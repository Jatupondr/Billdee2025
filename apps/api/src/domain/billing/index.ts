import Elysia, { t } from "elysia";
import { betterAuth } from "../../plugins/better-auth";
import { isCycle, isProduct } from "./plans";
import * as billing from "./service";
import { BillingError } from "./service";

function fail(set: any, e: unknown) {
  if (e instanceof BillingError) {
    set.status = e.status;
    return { message: e.message };
  }
  console.error("billing error", e);
  set.status = 500;
  return { message: "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง" };
}

/** เทียบรหัสแบบใช้เวลาคงที่ */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

const productCycle = t.Object({ product: t.String(), cycle: t.String() });

export const billingRoutes = new Elysia({ prefix: "/billing" })
  .use(betterAuth)
  .get(
    "/status",
    async ({ user, set }: any) => {
      try {
        return { data: await billing.status(user) };
      } catch (e) {
        return fail(set, e);
      }
    },
    { auth: true, detail: { tags: ["Billing"], summary: "แพ็กเกจปัจจุบันของฉัน (Billdee + PostHub)" } },
  )
  .get(
    "/qr",
    async ({ query, set }: any) => {
      if (!isProduct(query.product) || !isCycle(query.cycle)) {
        set.status = 400;
        return { message: "แพ็กเกจไม่ถูกต้อง" };
      }
      try {
        return { data: await billing.payQr(query.product, query.cycle) };
      } catch (e) {
        return fail(set, e);
      }
    },
    { auth: true, query: productCycle, detail: { tags: ["Billing"], summary: "QR พร้อมเพย์ล็อกยอดตามแพ็กเกจ" } },
  )
  .post(
    "/payments",
    async ({ body, user, set }: any) => {
      if (!isProduct(body.product) || !isCycle(body.cycle)) {
        set.status = 400;
        return { message: "แพ็กเกจไม่ถูกต้อง" };
      }
      try {
        const data = await billing.createPayment(user, body.product, body.cycle, body.slip);
        set.status = 201;
        return { data };
      } catch (e) {
        return fail(set, e);
      }
    },
    {
      auth: true,
      body: t.Object({ product: t.String(), cycle: t.String(), slip: t.File() }),
      detail: { tags: ["Billing"], summary: "แนบสลิปแจ้งชำระ" },
    },
  )
  .post(
    "/posthub/trial",
    async ({ user, set }: any) => {
      try {
        return { data: await billing.startTrial(user) };
      } catch (e) {
        return fail(set, e);
      }
    },
    { auth: true, detail: { tags: ["Billing"], summary: "เริ่มทดลอง PostHub 7 วัน (ครั้งเดียวต่ออีเมล)" } },
  )
  // ---- แอดมิน (สำรองไว้ ถ้าไม่ได้กดในเทเลแกรม) ----
  .get(
    "/payments",
    async ({ query, set }: any) => {
      try {
        return await billing.listPayments(query);
      } catch (e) {
        return fail(set, e);
      }
    },
    {
      admin: true,
      query: t.Object({ status: t.Optional(t.String()), page: t.Optional(t.String()), pageSize: t.Optional(t.String()) }),
      detail: { tags: ["Billing"], summary: "รายการแจ้งชำระทั้งหมด (แอดมิน)" },
    },
  )
  .post(
    "/payments/:id/approve",
    async ({ params, user, set }: any) => {
      try {
        const r = await billing.approve(params.id, String(user.id));
        await billing.reflectInTelegram(r.payment);
        return { data: r.payment, already: r.already };
      } catch (e) {
        return fail(set, e);
      }
    },
    { admin: true, params: t.Object({ id: t.String() }), detail: { tags: ["Billing"], summary: "อนุมัติ (แอดมิน)" } },
  )
  .post(
    "/payments/:id/reject",
    async ({ params, body, user, set }: any) => {
      try {
        const r = await billing.reject(params.id, body?.reason ?? "other", String(user.id));
        await billing.reflectInTelegram(r.payment);
        return { data: r.payment, already: r.already };
      } catch (e) {
        return fail(set, e);
      }
    },
    {
      admin: true,
      params: t.Object({ id: t.String() }),
      body: t.Object({ reason: t.Optional(t.String({ maxLength: 200 })) }),
      detail: { tags: ["Billing"], summary: "ปฏิเสธ (แอดมิน)" },
    },
  )
  .post(
    "/payments/:id/retry-posthub",
    async ({ params, set }: any) => {
      try {
        const r = await billing.retryPosthub(params.id);
        await billing.reflectInTelegram(r.payment);
        return { data: r.payment };
      } catch (e) {
        return fail(set, e);
      }
    },
    { admin: true, params: t.Object({ id: t.String() }), detail: { tags: ["Billing"], summary: "ลองต่ออายุ PostHub ใหม่ (แอดมิน)" } },
  )
  // ---- เทเลแกรมเรียกเข้ามา (ตรวจรหัสลับใน header ทุกครั้ง) ----
  .post(
    "/telegram/webhook",
    async ({ request, body, set }: any) => {
      const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim() ?? "";
      const got = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
      if (secret.length < 24 || !safeEqual(got, secret)) {
        set.status = 401;
        return { ok: false };
      }
      try {
        await billing.handleTelegramUpdate(body);
      } catch (e) {
        console.error("telegram update failed", e instanceof Error ? e.message : e);
      }
      return { ok: true }; // ตอบ 200 เสมอ ไม่ให้เทเลแกรมส่งซ้ำวนไป
    },
    { body: t.Any(), detail: { hide: true } },
  );

/** เริ่มระบบ: ลงทะเบียน webhook + ตั้งเวลาสรุปเช้า */
export function startBillingJobs() {
  billing.registerWebhook();
  const tick = () => billing.morningTick().catch((e) => console.error("morning summary failed", e instanceof Error ? e.message : e));
  setTimeout(tick, 30_000);
  setInterval(tick, 5 * 60_000);
}
