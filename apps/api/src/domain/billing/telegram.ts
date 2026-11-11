/**
 * บอทเทเลแกรมแจ้งชำระเงินถึงเจ้าของ (ค่าอยู่ใน env เท่านั้น ไม่ใส่ในโค้ด)
 *   TELEGRAM_BOT_TOKEN        token จาก @BotFather
 *   TELEGRAM_OWNER_CHAT_ID    แชทของเจ้าของ — ส่งไปที่นี่ที่เดียว และรับการกดปุ่มจากแชทนี้เท่านั้น
 *   TELEGRAM_WEBHOOK_SECRET   รหัสสุ่ม (อย่างน้อย 24 ตัว) ที่เทเลแกรมส่งกลับมาใน header ทุกครั้ง
 *   PUBLIC_API_URL            เช่น https://api.billdee.net/api (ใช้ลงทะเบียน webhook ตอนเริ่มระบบ)
 */
type Fetch = typeof fetch;

export type InlineButton = { text: string; callback_data: string };
export type Keyboard = InlineButton[][];

export class Telegram {
  constructor(
    private readonly token: string,
    readonly ownerChatId: string,
    private readonly f: Fetch = fetch,
    private readonly base = "https://api.telegram.org",
  ) {}

  static fromEnv(env: Record<string, string | undefined> = process.env, f: Fetch = fetch): Telegram | null {
    const token = env.TELEGRAM_BOT_TOKEN?.trim();
    const chat = env.TELEGRAM_OWNER_CHAT_ID?.trim();
    // TELEGRAM_API_BASE ใช้ตอนทดสอบในเครื่องเท่านั้น
    return token && chat ? new Telegram(token, chat, f, env.TELEGRAM_API_BASE?.trim() || undefined) : null;
  }

  async call<T = any>(method: string, body: Record<string, unknown> | FormData): Promise<T> {
    const isForm = typeof FormData !== "undefined" && body instanceof FormData;
    const res = await this.f(`${this.base}/bot${this.token}/${method}`, {
      method: "POST",
      ...(isForm ? { body } : { headers: { "content-type": "application/json" }, body: JSON.stringify(body) }),
    });
    const data: any = await res.json().catch(() => ({}));
    if (!data?.ok) throw new Error(`telegram ${method}: ${data?.description ?? res.status}`);
    return data.result as T;
  }

  /** ส่งรูปสลิปพร้อมข้อความและปุ่ม → message_id */
  async sendSlip(slip: Blob, fileName: string, caption: string, keyboard: Keyboard): Promise<number> {
    const form = new FormData();
    form.set("chat_id", this.ownerChatId);
    form.set("caption", caption);
    form.set("parse_mode", "HTML");
    form.set("reply_markup", JSON.stringify({ inline_keyboard: keyboard }));
    form.set("photo", slip, fileName);
    const msg = await this.call<{ message_id: number }>("sendPhoto", form);
    return msg.message_id;
  }

  sendText(text: string, keyboard?: Keyboard) {
    return this.call("sendMessage", {
      chat_id: this.ownerChatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}),
    });
  }

  editCaption(messageId: number, caption: string, keyboard: Keyboard = []) {
    return this.call("editMessageCaption", {
      chat_id: this.ownerChatId,
      message_id: messageId,
      caption,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  editKeyboard(messageId: number, keyboard: Keyboard) {
    return this.call("editMessageReplyMarkup", {
      chat_id: this.ownerChatId,
      message_id: messageId,
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  answer(callbackQueryId: string, text?: string) {
    return this.call("answerCallbackQuery", { callback_query_id: callbackQueryId, ...(text ? { text } : {}) });
  }

  setWebhook(url: string, secret: string) {
    return this.call("setWebhook", { url, secret_token: secret, allowed_updates: ["callback_query", "message"] });
  }
}

/** กันข้อความผู้ใช้ไปทำ HTML ในเทเลแกรมเพี้ยน */
export const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
