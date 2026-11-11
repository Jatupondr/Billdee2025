/**
 * แพ็กเกจและการชำระเงิน (ตัดสินใจโดยเจ้าของ 2026-11-11)
 *   ลูกค้าเลือกแพ็กเกจ → สแกน QR พร้อมเพย์ (ล็อกยอด) → แนบสลิป
 *   → เด้งเข้าเทเลแกรมเจ้าของ (สลิป อีเมล แพ็กเกจ ยอด) → กด ✅/❌ ในเทเลแกรม
 *   → อนุมัติ = ต่ออายุ Billdee Pro และ/หรือ PostHub ทันที (นับต่อจากวันหมดเดิม)
 */
import mongoose from "mongoose";
import generatePayload from "promptpay-qr";
import { Bill, BillingMeta, Payment, Subscription, User } from "../../../models/model";
import cloudinary from "../../../lib/cloudinary";
import {
  type Cycle,
  FREE_BILLS_PER_MONTH,
  PRICES,
  type Product,
  REJECT_REASONS,
  bangkokDay,
  bangkokHour,
  bangkokMonthStart,
  includesBilldee,
  includesPosthub,
  money,
  nextExpiry,
  planLabel,
  thaiDate,
  trialExpiry,
} from "./plans";
import { Posthub, type PosthubLicense, posthubState } from "./posthub";
import { esc, type Keyboard, Telegram } from "./telegram";

export class BillingError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const MAX_SLIP_BYTES = 8 * 1024 * 1024;
const SLIP_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

/** ตั้งค่าที่อ่านจาก env ทุกครั้ง (เปลี่ยนใน Dokploy แล้วรีสตาร์ทก็พอ) */
export const deps = {
  telegram: () => Telegram.fromEnv(),
  posthub: () => Posthub.fromEnv(),
  payTo: () => ({
    promptPay: process.env.BILLING_PROMPTPAY_ID?.trim() || "", // ไม่มี = ไม่โชว์ QR ให้โอนเข้าบัญชีแทน
    bankName: process.env.BILLING_BANK_NAME?.trim() || "",
    accountNo: process.env.BILLING_ACCOUNT_NO?.trim() || "",
    accountName: process.env.BILLING_ACCOUNT_NAME?.trim() || "",
  }),
  now: () => new Date(),
};

/* ------------------------------ helpers ------------------------------ */

async function activePro(userId: string) {
  const now = deps.now();
  await Subscription.updateMany(
    { userId, status: "paid", isDeleted: false, expDate: { $lt: now } },
    { $set: { status: "expired" } },
  );
  return Subscription.findOne({ userId, status: "paid", plan: "pro", isDeleted: false, expDate: { $gt: now } })
    .sort({ expDate: -1 })
    .lean<any>();
}

export async function billsThisMonth(userId: string): Promise<number> {
  if (!mongoose.Types.ObjectId.isValid(userId)) return 0;
  return Bill.countDocuments({ userId, createdAt: { $gte: bangkokMonthStart(deps.now()) } });
}

async function posthubLicense(email: string): Promise<{ lic: PosthubLicense | null; ok: boolean }> {
  const ph = deps.posthub();
  if (!ph) return { lic: null, ok: false };
  try {
    return { lic: await ph.info(email), ok: true };
  } catch (e) {
    console.error("posthub info failed", e instanceof Error ? e.message : e);
    return { lic: null, ok: false };
  }
}

function describePosthub(lic: PosthubLicense | null, ok: boolean): string {
  if (!ok) return "PostHub เช็กไม่ได้";
  const s = posthubState(lic, deps.now().getTime());
  switch (s.state) {
    case "none":
      return "PostHub ยังไม่เคยใช้";
    case "trial":
      return `PostHub ทดลอง (หมด ${thaiDate(s.expiresAt!)})`;
    case "active":
      return `PostHub ใช้งาน (หมด ${thaiDate(s.expiresAt!)})`;
    case "expired":
      return `PostHub หมดอายุ ${thaiDate(s.expiresAt!)}`;
    case "forever":
      return "PostHub ตลอดชีพ";
    case "revoked":
      return "PostHub ถูกระงับ";
    default:
      return "PostHub ซื้อแล้ว ยังไม่เคยล็อกอิน";
  }
}

/** ฐานวันหมด PostHub เดิม (ทดลอง/ใช้งานอยู่ = ต่อจากวันหมด, ซื้อค้างไว้ยังไม่ล็อกอิน = วันนี้ + วันที่ค้าง) */
function posthubBase(lic: PosthubLicense | null): Date | null {
  if (!lic) return null;
  if (lic.expires_at) return new Date(lic.expires_at);
  if (lic.pending_days > 0) return new Date(deps.now().getTime() + lic.pending_days * 86_400_000);
  return null;
}

/* ------------------------------ customer ------------------------------ */

export async function status(user: { id: string; email: string; role?: string | null }) {
  const now = deps.now();
  const [pro, used, pending, lastDecided, ph] = await Promise.all([
    activePro(user.id),
    billsThisMonth(user.id),
    Payment.findOne({ userId: user.id, status: "pending" }).sort({ createdAt: -1 }).lean<any>(),
    Payment.findOne({ userId: user.id, status: { $ne: "pending" } }).sort({ decidedAt: -1 }).lean<any>(),
    posthubLicense(user.email),
  ]);
  const p = posthubState(ph.lic, now.getTime());
  const payTo = deps.payTo();
  return {
    email: user.email,
    billdee: {
      plan: pro ? "pro" : "free",
      expDate: pro?.expDate ?? null,
      usedThisMonth: used,
      freeLimit: FREE_BILLS_PER_MONTH,
      unlimited: !!pro || user.role === "admin",
    },
    posthub: {
      available: ph.ok,
      state: ph.ok ? p.state : "unknown",
      expiresAt: p.expiresAt,
      devices: ph.lic?.devices?.length ?? 0,
      maxDevices: ph.lic?.max_devices ?? 2,
      trialAvailable: ph.ok && !ph.lic,
    },
    pending: pending ? pick(pending) : null,
    // แจ้งผลครั้งล่าสุด (ไว้โชว์ "อนุมัติแล้ว" / "ไม่ผ่าน เพราะ…" 7 วัน)
    lastDecided:
      lastDecided && now.getTime() - new Date(lastDecided.decidedAt ?? 0).getTime() < 7 * 86_400_000 ? pick(lastDecided) : null,
    prices: PRICES,
    payTo: {
      ready: !!(payTo.promptPay || payTo.accountNo),
      accountName: payTo.accountName,
      promptPay: maskPromptPay(payTo.promptPay),
      bankName: payTo.bankName,
      accountNo: formatAccountNo(payTo.accountNo),
    },
    telegramReady: !!deps.telegram(),
  };
}

function pick(p: any) {
  return {
    id: String(p._id),
    product: p.product,
    cycle: p.cycle,
    amount: p.amount,
    status: p.status,
    rejectReason: p.rejectReason ?? null,
    createdAt: p.createdAt,
    decidedAt: p.decidedAt ?? null,
    billdeeExpDate: p.billdeeExpDate ?? null,
    posthubExpDate: p.posthubExpDate ?? null,
  };
}

/** 1301294278 → 130-1-29427-8 (รูปแบบเลขบัญชี 10 หลัก) */
function formatAccountNo(no: string): string {
  const d = no.replace(/\D/g, "");
  return d.length === 10 ? `${d.slice(0, 3)}-${d[3]}-${d.slice(4, 9)}-${d[9]}` : no;
}

function maskPromptPay(id: string): string {
  const d = id.replace(/\D/g, "");
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 13) return `${d[0]}-${d.slice(1, 5)}-${d.slice(5, 10)}-${d.slice(10, 12)}-${d[12]}`;
  return d;
}

export async function payQr(product: Product, cycle: Cycle): Promise<{ qr: string; amount: number }> {
  const { promptPay } = deps.payTo();
  if (!promptPay) throw new BillingError(503, "ยังไม่ได้ตั้งค่าบัญชีรับเงิน");
  const amount = PRICES[product][cycle];
  const QRCode = require("qrcode");
  const qr = await QRCode.toDataURL(generatePayload(promptPay, { amount }), { margin: 1, width: 360 });
  return { qr, amount };
}

export async function createPayment(
  user: { id: string; email: string; name?: string | null },
  product: Product,
  cycle: Cycle,
  slip: File,
) {
  if (!slip || typeof slip.arrayBuffer !== "function") throw new BillingError(400, "กรุณาแนบรูปสลิป");
  if (slip.size > MAX_SLIP_BYTES) throw new BillingError(400, "รูปสลิปใหญ่เกินไป (ไม่เกิน 8 MB)");
  if (slip.type && !SLIP_TYPES.includes(slip.type)) throw new BillingError(400, "รองรับเฉพาะรูปภาพ (JPG / PNG)");
  if (await Payment.exists({ userId: user.id, status: "pending" })) {
    throw new BillingError(409, "มีรายการรออนุมัติอยู่แล้ว — รอผลก่อนนะครับ");
  }
  const tg = deps.telegram();
  if (!tg) throw new BillingError(503, "ระบบแจ้งชำระยังไม่พร้อม — ติดต่อผู้ขาย");

  const bytes = Buffer.from(await slip.arrayBuffer());
  const uploaded = await cloudinary.uploader.upload(`data:${slip.type || "image/jpeg"};base64,${bytes.toString("base64")}`, {
    folder: "payment-slips",
    resource_type: "image",
    transformation: [{ width: 1600, height: 1600, crop: "limit" }, { quality: "auto" }],
  });

  const amount = PRICES[product][cycle];
  const payment: any = await Payment.create({
    userId: user.id,
    email: user.email,
    product,
    cycle,
    amount,
    slipUrl: uploaded.secure_url,
    status: "pending",
  });

  try {
    const caption = await pendingCaption(payment, user.name);
    const id = await tg.sendSlip(new Blob([bytes], { type: slip.type || "image/jpeg" }), "slip.jpg", caption, decideKeyboard(payment._id));
    await Payment.updateOne({ _id: payment._id }, { $set: { telegramMessageId: id } });
  } catch (e) {
    // ไม่ทิ้งรายการลูกค้า: ยังอยู่ในหน้าแอดมินให้อนุมัติได้
    console.error("telegram notify failed", e instanceof Error ? e.message : e);
  }
  return pick(payment);
}

export async function startTrial(user: { id: string; email: string; name?: string | null }) {
  const ph = deps.posthub();
  if (!ph) throw new BillingError(503, "ระบบ PostHub ยังไม่พร้อม — ติดต่อผู้ขาย");
  const lic = await ph.info(user.email);
  if (lic) throw new BillingError(409, "อีเมลนี้เคยใช้ PostHub แล้ว ทดลองได้ครั้งเดียว");
  const exp = trialExpiry(deps.now());
  await ph.setExpiry(user.email, exp, "trial");
  // แจ้งเทเลแกรมผ่าน trialTick() ที่เดียว (ทดลองจากเว็บหรือจากส่วนขยายก็แจ้งแบบเดียวกัน ไม่ซ้ำ)
  trialTick().catch(() => {});
  return { expiresAt: exp };
}

/* ------------------------------ owner ------------------------------ */

function decideKeyboard(id: unknown): Keyboard {
  return [
    [
      { text: "✅ อนุมัติ", callback_data: `ap:${id}` },
      { text: "❌ ปฏิเสธ", callback_data: `rj:${id}` },
    ],
  ];
}

function reasonKeyboard(id: unknown): Keyboard {
  return [
    [
      { text: "ยอดไม่ตรง", callback_data: `rr:${id}:amount` },
      { text: "สลิปไม่ชัด/ซ้ำ", callback_data: `rr:${id}:slip` },
    ],
    [
      { text: "ยังไม่เห็นเงินเข้า", callback_data: `rr:${id}:notyet` },
      { text: "อื่นๆ", callback_data: `rr:${id}:other` },
    ],
    [{ text: "← กลับ", callback_data: `bk:${id}` }],
  ];
}

async function pendingCaption(p: any, name?: string | null): Promise<string> {
  const [pro, ph] = await Promise.all([activePro(String(p.userId)), posthubLicense(p.email)]);
  const now = deps.now();
  const lines = [
    "💰 <b>แจ้งชำระใหม่</b>",
    `อีเมล: ${esc(p.email)}${name ? ` (${esc(name)})` : ""}`,
    `แพ็กเกจ: <b>${esc(planLabel(p.product, p.cycle))}</b>`,
    `ยอดที่ต้องโอน: <b>${money(p.amount)} บาท</b> — ดูสลิปให้ตรง`,
    `ตอนนี้: ${pro ? `Billdee Pro (หมด ${thaiDate(pro.expDate)})` : "Billdee Free"} · ${describePosthub(ph.lic, ph.ok)}`,
  ];
  const after: string[] = [];
  if (includesBilldee(p.product)) after.push(`Billdee ถึง ${thaiDate(nextExpiry(pro?.expDate ?? null, p.cycle, now))}`);
  if (includesPosthub(p.product)) {
    if (ph.lic?.plan === "forever") after.push("PostHub ตลอดชีพอยู่แล้ว");
    else after.push(`PostHub ถึง ${thaiDate(nextExpiry(posthubBase(ph.lic), p.cycle, now))}`);
  }
  lines.push(`ถ้าอนุมัติ → ${after.join(" · ")}`);
  return lines.join("\n");
}

/** อนุมัติ (ทำครั้งเดียว — กดซ้ำไม่ต่ออายุซ้ำ) */
export async function approve(paymentId: string, by: string) {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) throw new BillingError(400, "รหัสรายการไม่ถูกต้อง");
  const now = deps.now();
  const p: any = await Payment.findOneAndUpdate(
    { _id: paymentId, status: "pending" },
    { $set: { status: "approved", decidedAt: now, decidedBy: by } },
    { returnDocument: "after" },
  ).lean();
  if (!p) {
    const existing: any = await Payment.findById(paymentId).lean();
    if (!existing) throw new BillingError(404, "ไม่พบรายการ");
    return { payment: existing, already: true };
  }

  const set: Record<string, unknown> = {};
  if (includesBilldee(p.product)) {
    const pro = await activePro(String(p.userId));
    const exp = nextExpiry(pro?.expDate ?? null, p.cycle, now);
    if (pro) await Subscription.updateOne({ _id: pro._id }, { $set: { expDate: exp, endDate: exp } });
    else
      await Subscription.create({ plan: "pro", status: "paid", startDate: now, endDate: exp, expDate: exp, userId: p.userId });
    set.billdeeExpDate = exp;
  }
  if (includesPosthub(p.product)) {
    const r = await renewPosthub(p);
    Object.assign(set, r);
  }
  await Payment.updateOne({ _id: p._id }, { $set: set, ...(set.posthubError ? {} : { $unset: { posthubError: 1 } }) });
  return { payment: { ...p, ...set }, already: false };
}

async function renewPosthub(p: any): Promise<{ posthubExpDate?: Date; posthubError?: string }> {
  const ph = deps.posthub();
  if (!ph) return { posthubError: "ยังไม่ได้ตั้งค่าเซิร์ฟเวอร์ PostHub" };
  try {
    const lic = await ph.info(p.email);
    if (lic?.plan === "forever") return {};
    const exp = nextExpiry(posthubBase(lic), p.cycle, deps.now());
    await ph.setExpiry(p.email, exp, "billdee");
    return { posthubExpDate: exp };
  } catch (e) {
    return { posthubError: e instanceof Error ? e.message : String(e) };
  }
}

/** ต่ออายุ PostHub ใหม่ ถ้าตอนอนุมัติเซิร์ฟเวอร์ PostHub ล่ม */
export async function retryPosthub(paymentId: string) {
  const p: any = await Payment.findOne({ _id: paymentId, status: "approved", posthubError: { $exists: true } }).lean();
  if (!p) throw new BillingError(404, "ไม่มีรายการที่ต้องลองใหม่");
  const r = await renewPosthub(p);
  await Payment.updateOne({ _id: p._id }, r.posthubError ? { $set: r } : { $set: r, $unset: { posthubError: 1 } });
  return { payment: { ...p, ...r, ...(r.posthubError ? {} : { posthubError: undefined }) } };
}

export async function reject(paymentId: string, reasonCode: string, by: string) {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) throw new BillingError(400, "รหัสรายการไม่ถูกต้อง");
  const reason = REJECT_REASONS[reasonCode] ?? (reasonCode.trim().slice(0, 200) || REJECT_REASONS.other);
  const p: any = await Payment.findOneAndUpdate(
    { _id: paymentId, status: "pending" },
    { $set: { status: "rejected", rejectReason: reason, decidedAt: deps.now(), decidedBy: by } },
    { returnDocument: "after" },
  ).lean();
  if (!p) {
    const existing: any = await Payment.findById(paymentId).lean();
    if (!existing) throw new BillingError(404, "ไม่พบรายการ");
    return { payment: existing, already: true };
  }
  return { payment: p, already: false };
}

function resultLine(p: any): string {
  const t = new Date(p.decidedAt ?? deps.now()).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" });
  if (p.status === "rejected") return `\n\n❌ <b>ปฏิเสธแล้ว</b> ${t} — แจ้งลูกค้า: ${esc(p.rejectReason)}`;
  const parts: string[] = [];
  if (p.billdeeExpDate) parts.push(`Billdee ถึง ${thaiDate(p.billdeeExpDate)}`);
  if (p.posthubExpDate) parts.push(`PostHub ถึง ${thaiDate(p.posthubExpDate)}`);
  let s = `\n\n✅ <b>อนุมัติแล้ว</b> ${t}${parts.length ? ` — ${parts.join(" · ")}` : ""}`;
  if (p.posthubError) s += `\n⚠️ ต่ออายุ PostHub ไม่สำเร็จ (${esc(p.posthubError)}) — กดลองใหม่`;
  return s;
}

/** แก้ข้อความสลิปในเทเลแกรมให้ขึ้นผล (ใช้ทั้งตอนกดในเทเลแกรมและตอนอนุมัติจากหน้าแอดมิน) */
export async function reflectInTelegram(p: any) {
  const tg = deps.telegram();
  if (!tg || !p.telegramMessageId) return;
  const user: any = await User.findById(p.userId, { name: 1 }).lean().catch(() => null);
  const base = (await pendingCaption({ ...p, status: "pending" }, user?.name)).split("\nตอนนี้:")[0];
  const kb: Keyboard = p.posthubError ? [[{ text: "🔁 ลองต่ออายุ PostHub อีกครั้ง", callback_data: `rp:${p._id}` }]] : [];
  await tg.editCaption(p.telegramMessageId, `${base}${resultLine(p)}`, kb).catch((e) =>
    console.error("telegram edit failed", e instanceof Error ? e.message : e),
  );
}

/* ------------------------------ telegram webhook ------------------------------ */

export function parseCallback(data: string): { action: "ap" | "rj" | "rr" | "bk" | "rp"; id: string; reason?: string } | null {
  const m = /^(ap|rj|rr|bk|rp):([a-f0-9]{24})(?::([a-z]{1,10}))?$/.exec(data);
  if (!m) return null;
  if (m[1] === "rr" && !m[3]) return null;
  return { action: m[1] as any, id: m[2]!, ...(m[3] ? { reason: m[3] } : {}) };
}

export async function handleTelegramUpdate(update: any) {
  const tg = deps.telegram();
  if (!tg) return;
  const owner = String(tg.ownerChatId);

  const cq = update?.callback_query;
  if (cq) {
    if (String(cq.from?.id) !== owner || String(cq.message?.chat?.id) !== owner) {
      await tg.answer(cq.id, "ไม่มีสิทธิ์").catch(() => {});
      return;
    }
    const c = parseCallback(String(cq.data ?? ""));
    if (!c) return tg.answer(cq.id).catch(() => {});
    try {
      if (c.action === "rj") {
        await tg.editKeyboard(cq.message.message_id, reasonKeyboard(c.id));
        return tg.answer(cq.id, "เลือกเหตุผลที่จะแจ้งลูกค้า");
      }
      if (c.action === "bk") {
        await tg.editKeyboard(cq.message.message_id, decideKeyboard(c.id));
        return tg.answer(cq.id);
      }
      const r =
        c.action === "ap"
          ? await approve(c.id, "telegram")
          : c.action === "rr"
            ? await reject(c.id, c.reason!, "telegram")
            : await retryPosthub(c.id);
      await reflectInTelegram({ ...r.payment, telegramMessageId: r.payment.telegramMessageId ?? cq.message.message_id });
      const already = "already" in r && r.already;
      return tg.answer(cq.id, already ? "รายการนี้ตัดสินไปแล้ว" : c.action === "rr" ? "ปฏิเสธแล้ว" : "เรียบร้อย ✅");
    } catch (e) {
      console.error("telegram action failed", e instanceof Error ? e.message : e);
      return tg.answer(cq.id, e instanceof BillingError ? e.message : "ทำไม่สำเร็จ ลองใหม่").catch(() => {});
    }
  }

  const msg = update?.message;
  if (msg && String(msg.chat?.id) === owner) {
    const text = String(msg.text ?? "").trim();
    if (text.startsWith("/summary") || text === "สรุป") return sendSummary();
    return tg.sendText("บอทแจ้งชำระเงิน Billdee พร้อมใช้งาน ✅\nพิมพ์ /summary เพื่อดูสรุปตอนนี้");
  }
}

/* ------------------------------ admin (หน้าเว็บสำรอง) ------------------------------ */

export async function listPayments(query: { status?: string; page?: number; pageSize?: number }) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
  const filter: any = {};
  if (query.status && ["pending", "approved", "rejected"].includes(query.status)) filter.status = query.status;
  const [rows, total, pendingCount] = await Promise.all([
    Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "name email")
      .lean(),
    Payment.countDocuments(filter),
    Payment.countDocuments({ status: "pending" }),
  ]);
  return { rows, meta: { page, pageSize: limit, total, pendingCount } };
}

/* ------------------------------ สรุปเช้า 09:00 ------------------------------ */

export async function summaryText(): Promise<string> {
  const now = deps.now();
  const soon = new Date(now.getTime() + 3 * 86_400_000);
  const dayAgo = new Date(now.getTime() - 86_400_000);
  const [pending, pros, approved] = await Promise.all([
    Payment.countDocuments({ status: "pending" }),
    Subscription.find({ status: "paid", plan: "pro", isDeleted: false, expDate: { $gt: now, $lte: soon } })
      .populate("userId", "email")
      .lean<any[]>(),
    Payment.find({ status: "approved", decidedAt: { $gte: dayAgo } }).lean<any[]>(),
  ]);
  const income = approved.reduce((s, p) => s + (p.amount || 0), 0);
  const lines = [`⏰ <b>สรุปเช้า ${thaiDate(now)}</b>`];
  lines.push(pending ? `⏳ รออนุมัติ ${pending} รายการ` : "⏳ ไม่มีรายการค้างอนุมัติ");
  lines.push(`💰 24 ชม.ที่ผ่านมา อนุมัติ ${approved.length} รายการ · ${money(income)} บาท`);
  if (pros.length) {
    lines.push(`📅 Billdee Pro หมดใน 3 วัน ${pros.length} ราย:`);
    for (const s of pros.slice(0, 10)) lines.push(`  • ${esc(s.userId?.email ?? "-")} (${thaiDate(s.expDate)})`);
  }
  const ph = deps.posthub();
  if (ph) {
    try {
      const list = await ph.list();
      const expiring = list.filter(
        (l) => l.plan !== "forever" && l.expires_at && Date.parse(l.expires_at) > now.getTime() && Date.parse(l.expires_at) <= soon.getTime(),
      );
      const trials = list.filter((l) => l.note === "trial" && l.created_at && Date.parse(l.created_at) >= dayAgo.getTime());
      if (expiring.length) {
        lines.push(`📅 PostHub หมดใน 3 วัน ${expiring.length} ราย:`);
        for (const l of expiring.slice(0, 10)) lines.push(`  • ${esc(l.email)} (${thaiDate(l.expires_at!)}${l.note === "trial" ? " ทดลอง" : ""})`);
      }
      lines.push(`🎁 ทดลอง PostHub ใหม่ 24 ชม. ${trials.length} ราย`);
    } catch {
      lines.push("PostHub: เช็กรายชื่อไม่ได้");
    }
  }
  return lines.join("\n");
}

export async function sendSummary() {
  const tg = deps.telegram();
  if (!tg) return;
  await tg.sendText(await summaryText());
}

/** เรียกทุก 5 นาที: ถึง 09:00 ไทยแล้วยังไม่ส่งวันนี้ → ส่ง (รีสตาร์ทกี่ครั้งก็ไม่ส่งซ้ำ) */
export async function morningTick() {
  const now = deps.now();
  if (!deps.telegram() || bangkokHour(now) < 9) return;
  const today = bangkokDay(now);
  const prev = await BillingMeta.findOneAndUpdate(
    { key: "summary_day" },
    { $set: { value: today } },
    { upsert: true, returnDocument: "before" },
  ).lean<any>();
  if (prev?.value === today) return;
  await sendSummary();
}

/**
 * ทดลอง PostHub ใหม่ → แจ้งเทเลแกรม (เรียกทุก 2 นาที)
 * ลูกค้ากดเข้าสู่ระบบด้วย Google ในส่วนขยายครั้งแรก = เริ่มทดลองที่เซิร์ฟเวอร์ PostHub เลย Billdee เลยคอยดูรายชื่อแทน
 */
export async function trialTick() {
  const tg = deps.telegram();
  const ph = deps.posthub();
  if (!tg || !ph) return;
  const trials = (await ph.list()).filter((l) => l.note === "trial" && l.created_at);
  const meta = await BillingMeta.findOne({ key: "trial_seen" }).lean<any>();
  const seen = meta?.value ? Date.parse(meta.value) : Number.NaN;
  if (!Number.isFinite(seen)) {
    // ครั้งแรก: จำไว้ว่าเห็นถึงตอนนี้แล้ว ไม่ไล่แจ้งของเก่า
    await BillingMeta.updateOne({ key: "trial_seen" }, { $set: { value: deps.now().toISOString() } }, { upsert: true });
    return;
  }
  const fresh = trials.filter((t) => Date.parse(t.created_at!) > seen).sort((a, b) => Date.parse(a.created_at!) - Date.parse(b.created_at!));
  if (!fresh.length) return;
  // ขยับก่อนส่ง: ถ้าสองรอบทำงานพร้อมกัน รอบที่ช้ากว่าจะไม่เจอรายการเดิมซ้ำ
  const last = fresh[fresh.length - 1]!.created_at!;
  const moved = await BillingMeta.updateOne({ key: "trial_seen", value: meta!.value }, { $set: { value: last } });
  if (!moved.modifiedCount) return;
  for (const t of fresh) {
    await tg.sendText(`🎁 <b>ทดลอง PostHub ใหม่</b>\n${esc(t.email)}\nหมด ${thaiDate(t.expires_at ?? deps.now())}`).catch(() => {});
  }
}

export async function registerWebhook() {
  const tg = deps.telegram();
  const base = process.env.PUBLIC_API_URL?.trim().replace(/\/+$/, "");
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (!tg || !base || !secret || secret.length < 24) {
    if (tg) console.warn("telegram: ตั้ง PUBLIC_API_URL และ TELEGRAM_WEBHOOK_SECRET (24+ ตัว) เพื่อรับการกดปุ่ม");
    return;
  }
  try {
    await tg.setWebhook(`${base}/billing/telegram/webhook`, secret);
  } catch (e) {
    console.error("telegram setWebhook failed", e instanceof Error ? e.message : e);
  }
}
