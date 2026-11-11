/**
 * ทดสอบกับฐานข้อมูลจริงแบบ Mongo (ตั้ง BILLING_TEST_MONGO เช่น mongodb://127.0.0.1:27027) — ไม่ตั้ง = ข้าม
 * เทเลแกรม / PostHub / Cloudinary เป็นตัวปลอม (ไม่มีการส่งออกไปข้างนอก)
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test";
import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary";
import { Bill, BillingMeta, Payment, Subscription } from "../models/model";
import { billQuota } from "../src/domain/billing/quota";
import * as billing from "../src/domain/billing/service";
import { thaiDate } from "../src/domain/billing/plans";

const URL = process.env.BILLING_TEST_MONGO;
const d = URL ? describe : describe.skip;

const OWNER = "1214536106";
let now = new Date("2026-11-11T05:45:00Z");
let sent: { method: string; body: any }[] = [];
let licenses: Record<string, any> = {};
let posthubDown = false;

const tg = {
  ownerChatId: OWNER,
  sendSlip: async (_b: Blob, _n: string, caption: string, kb: any) => {
    sent.push({ method: "sendSlip", body: { caption, kb } });
    return 555;
  },
  sendText: async (text: string) => {
    sent.push({ method: "sendText", body: { text } });
  },
  editCaption: async (id: number, caption: string, kb: any) => {
    sent.push({ method: "editCaption", body: { id, caption, kb } });
  },
  editKeyboard: async (id: number, kb: any) => {
    sent.push({ method: "editKeyboard", body: { id, kb } });
  },
  answer: async (_id: string, text?: string) => {
    sent.push({ method: "answer", body: { text } });
  },
};
const ph = {
  info: async (email: string) => {
    if (posthubDown) throw new Error("posthub info: 500");
    return licenses[email] ?? null;
  },
  setExpiry: async (email: string, exp: Date, note?: string) => {
    if (posthubDown) throw new Error("posthub set-expiry: 500");
    licenses[email] = { ...(licenses[email] ?? { plan: "30d", status: "active", max_devices: 2, devices: [], pending_days: 0 }), email, expires_at: exp.toISOString(), note: note ?? null };
    return licenses[email];
  },
  list: async () => Object.values(licenses),
};

const user = { id: new mongoose.Types.ObjectId().toString(), email: "somchai.shop@gmail.com", name: "สมชาย" };
const slip = () => new File([new Uint8Array([0xff, 0xd8, 0xff, 1, 2, 3])], "slip.jpg", { type: "image/jpeg" });
const cb = (data: string, chat = OWNER) => ({
  callback_query: { id: "q1", from: { id: Number(chat) }, data, message: { message_id: 555, chat: { id: Number(chat) } } },
});

d("billing with a database", () => {
  beforeAll(async () => {
    await mongoose.connect(`${URL}/billing-test-${Date.now()}`);
    (cloudinary.uploader as any).upload = async () => ({ secure_url: "https://res.cloudinary.test/slip.jpg" });
    billing.deps.telegram = () => tg as any;
    billing.deps.posthub = () => ph as any;
    billing.deps.payTo = () => ({ promptPay: "0931041289", accountName: "ทดสอบ", bankName: "", accountNo: "" });
    billing.deps.now = () => now;
  });
  afterAll(async () => {
    await mongoose.connection.db?.dropDatabase();
    await mongoose.disconnect();
  });
  beforeEach(async () => {
    await Promise.all([Payment.deleteMany({}), Subscription.deleteMany({}), Bill.deleteMany({}), BillingMeta.deleteMany({})]);
    sent = [];
    licenses = {};
    posthubDown = false;
    now = new Date("2026-11-11T05:45:00Z");
  });

  it("bundle yearly: slip → telegram → ✅ → Billdee Pro + PostHub extended once (double tap = no double extend)", async () => {
    licenses[user.email] = { email: user.email, plan: "30d", status: "active", note: "trial", expires_at: "2026-11-14T05:00:00Z", pending_days: 0, max_devices: 2, devices: [{}] };
    const p = await billing.createPayment(user, "bundle", "year", slip());
    expect(p).toMatchObject({ product: "bundle", cycle: "year", amount: 3000, status: "pending" });
    const msg = sent.find((s) => s.method === "sendSlip")!.body;
    expect(msg.caption).toContain("somchai.shop@gmail.com");
    expect(msg.caption).toContain("รวมชุด Pro + PostHub (รายปี)");
    expect(msg.caption).toContain("3,000 บาท");
    expect(msg.caption).toContain("PostHub ทดลอง (หมด 14 พ.ย. 2569)");
    expect(msg.caption).toContain("Billdee ถึง 11 พ.ย. 2570");
    expect(msg.caption).toContain("PostHub ถึง 14 พ.ย. 2570"); // ต่อจากวันหมดทดลอง
    expect(msg.kb[0].map((b: any) => b.callback_data)).toEqual([`ap:${p.id}`, `rj:${p.id}`]);

    await expect(billing.createPayment(user, "billdee", "month", slip())).rejects.toThrow("รออนุมัติ");

    await billing.handleTelegramUpdate(cb(`ap:${p.id}`));
    const sub: any = await Subscription.findOne({ userId: user.id }).lean();
    expect(sub).toMatchObject({ plan: "pro", status: "paid" });
    expect(thaiDate(sub.expDate)).toBe("11 พ.ย. 2570");
    expect(thaiDate(licenses[user.email].expires_at)).toBe("14 พ.ย. 2570");
    expect(licenses[user.email].note).toBe("billdee");
    const edit = sent.find((s) => s.method === "editCaption")!.body;
    expect(edit.caption).toContain("✅ <b>อนุมัติแล้ว</b>");
    expect(edit.kb).toEqual([]);

    const st = await billing.status(user);
    expect(st.billdee).toMatchObject({ plan: "pro", unlimited: true });
    expect(st.posthub.state).toBe("active");
    expect(st.pending).toBeNull();
    expect(st.lastDecided).toMatchObject({ status: "approved" });

    // กดซ้ำ: ไม่ต่ออายุซ้ำ
    sent = [];
    await billing.handleTelegramUpdate(cb(`ap:${p.id}`));
    expect(thaiDate(((await Subscription.findOne({ userId: user.id }).lean()) as any).expDate)).toBe("11 พ.ย. 2570");
    expect(await Subscription.countDocuments({ userId: user.id })).toBe(1);
    expect(sent.find((s) => s.method === "answer")!.body.text).toBe("รายการนี้ตัดสินไปแล้ว");

    // ซื้อ Billdee รายเดือนเพิ่ม: ต่อจากวันหมดเดิม
    const p2 = await billing.createPayment(user, "billdee", "month", slip());
    await billing.handleTelegramUpdate(cb(`ap:${p2.id}`));
    expect(thaiDate(((await Subscription.findOne({ userId: user.id }).lean()) as any).expDate)).toBe("11 ธ.ค. 2570");
  });

  it("❌ → reason buttons → reason saved for the customer; ← back restores the buttons", async () => {
    const p = await billing.createPayment(user, "posthub", "month", slip());
    await billing.handleTelegramUpdate(cb(`rj:${p.id}`));
    const kb = sent.find((s) => s.method === "editKeyboard")!.body.kb;
    expect(kb.flat().map((b: any) => b.callback_data)).toContain(`rr:${p.id}:amount`);
    await billing.handleTelegramUpdate(cb(`bk:${p.id}`));
    expect(sent.filter((s) => s.method === "editKeyboard")[1]!.body.kb[0][0].callback_data).toBe(`ap:${p.id}`);
    await billing.handleTelegramUpdate(cb(`rr:${p.id}:amount`));
    const st = await billing.status(user);
    expect(st.lastDecided).toMatchObject({ status: "rejected", rejectReason: "ยอดเงินไม่ตรงกับแพ็กเกจ" });
    expect(licenses[user.email]).toBeUndefined(); // ไม่ได้ต่ออายุ
    // ส่งใหม่ได้หลังถูกปฏิเสธ
    expect((await billing.createPayment(user, "posthub", "month", slip())).status).toBe("pending");
  });

  it("buttons from any other chat are ignored", async () => {
    const p = await billing.createPayment(user, "billdee", "month", slip());
    await billing.handleTelegramUpdate(cb(`ap:${p.id}`, "999"));
    expect((await Payment.findById(p.id).lean<any>()).status).toBe("pending");
    expect(sent.find((s) => s.method === "answer")!.body.text).toBe("ไม่มีสิทธิ์");
  });

  it("PostHub server down at approval: Billdee still extended, owner gets a retry button that works later", async () => {
    const p = await billing.createPayment(user, "bundle", "month", slip());
    posthubDown = true;
    await billing.handleTelegramUpdate(cb(`ap:${p.id}`));
    const edit = sent.filter((s) => s.method === "editCaption").at(-1)!.body;
    expect(edit.caption).toContain("ต่ออายุ PostHub ไม่สำเร็จ");
    expect(edit.kb[0][0].callback_data).toBe(`rp:${p.id}`);
    expect(await Subscription.countDocuments({ userId: user.id, plan: "pro" })).toBe(1);
    posthubDown = false;
    await billing.handleTelegramUpdate(cb(`rp:${p.id}`));
    expect(thaiDate(licenses[user.email].expires_at)).toBe("11 ธ.ค. 2569");
    expect((await Payment.findById(p.id).lean<any>()).posthubError).toBeUndefined();
  });

  it("new trials (from the extension or the web) reach Telegram once; old ones are not replayed", async () => {
    licenses["old@x.co"] = { email: "old@x.co", plan: "30d", status: "active", note: "trial", created_at: "2026-11-10T00:00:00Z", expires_at: "2026-11-17T00:00:00Z" };
    await billing.trialTick(); // first run only remembers "now"
    expect(sent).toHaveLength(0);
    licenses["new@x.co"] = { email: "new@x.co", plan: "30d", status: "active", note: "trial", created_at: "2026-11-11T06:00:00Z", expires_at: "2026-11-18T06:00:00Z" };
    licenses["paid@x.co"] = { email: "paid@x.co", plan: "30d", status: "active", note: "billdee", created_at: "2026-11-11T06:00:00Z", expires_at: "2026-12-18T06:00:00Z" };
    await billing.trialTick();
    await billing.trialTick();
    const texts = sent.filter((s) => s.method === "sendText").map((s) => s.body.text);
    expect(texts).toEqual(["🎁 <b>ทดลอง PostHub ใหม่</b>\nnew@x.co\nหมด 18 พ.ย. 2569"]);
  });

  it("trial: once per email, 7 days", async () => {
    const r = await billing.startTrial(user);
    expect(thaiDate(r.expiresAt)).toBe("18 พ.ย. 2569");
    expect((await billing.status(user)).posthub).toMatchObject({ state: "trial", trialAvailable: false });
    await expect(billing.startTrial(user)).rejects.toThrow("ทดลองได้ครั้งเดียว");
  });

  it("free plan: 10 bills per Thai month; Pro is unlimited; resets on the 1st", async () => {
    const org = new mongoose.Types.ObjectId();
    const mk = (createdAt: Date) =>
      Bill.collection.insertOne({ billNumber: "x", date: createdAt, name_customer: "c", organizationId: org, userId: new mongoose.Types.ObjectId(user.id), createdAt } as any);
    for (let i = 0; i < 9; i++) await mk(new Date("2026-11-05T00:00:00Z"));
    await mk(new Date("2026-10-31T16:59:00Z")); // 31 ต.ค. 23:59 ไทย — เดือนก่อน
    expect((await billQuota({ id: user.id })).ok).toBe(true); // 9 ใบ (billQuota ใช้ deps.now ผ่าน billsThisMonth)
    await mk(new Date("2026-11-06T00:00:00Z"));
    expect(await billQuota({ id: user.id })).toMatchObject({ ok: false, used: 10, limit: 10 });
    expect((await billQuota({ id: user.id, role: "admin" })).ok).toBe(true);
    now = new Date("2026-11-30T17:00:00Z"); // 1 ธ.ค. 00:00 ไทย
    expect((await billQuota({ id: user.id })).used).toBe(0);
  });

  it("morning summary is sent once a day after 09:00 Thai time", async () => {
    now = new Date("2026-11-11T01:00:00Z"); // 08:00
    await billing.morningTick();
    expect(sent).toHaveLength(0);
    now = new Date("2026-11-11T02:05:00Z"); // 09:05
    await billing.createPayment(user, "billdee", "month", slip());
    sent = [];
    await billing.morningTick();
    await billing.morningTick();
    const texts = sent.filter((s) => s.method === "sendText");
    expect(texts).toHaveLength(1);
    expect(texts[0]!.body.text).toContain("รออนุมัติ 1 รายการ");
  });
});
