/**
 * คุยกับเซิร์ฟเวอร์ใบอนุญาต Billdee PostHub (Cloudflare Worker drfx-license)
 *   POSTHUB_LICENSE_URL   เช่น https://drfx-license.<account>.workers.dev
 *   POSTHUB_ADMIN_TOKEN   ADMIN_TOKEN ตัวเดียวกับใน Worker (เก็บเป็นค่าลับเท่านั้น)
 */
type Fetch = typeof fetch;

export type PosthubLicense = {
  email: string;
  plan: string; // 30d | 90d | 365d | forever
  status: string; // active | revoked
  note: string | null;
  created_at?: string | null;
  activated_at: string | null;
  expires_at: string | null;
  pending_days: number;
  max_devices: number;
  devices: unknown[];
};

export class Posthub {
  constructor(
    private readonly baseUrl: string,
    private readonly adminToken: string,
    private readonly f: Fetch = fetch,
  ) {}

  static fromEnv(env: Record<string, string | undefined> = process.env, f: Fetch = fetch): Posthub | null {
    const url = env.POSTHUB_LICENSE_URL?.trim().replace(/\/+$/, "");
    const token = env.POSTHUB_ADMIN_TOKEN?.trim();
    return url && token ? new Posthub(url, token, f) : null;
  }

  private async post(path: string, body: Record<string, unknown>): Promise<{ status: number; data: any }> {
    const res = await this.f(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${this.adminToken}` },
      body: JSON.stringify(body),
    });
    return { status: res.status, data: await res.json().catch(() => ({})) };
  }

  /** null = อีเมลนี้ยังไม่เคยเป็นลูกค้า PostHub */
  async info(email: string): Promise<PosthubLicense | null> {
    const { status, data } = await this.post("/admin/emails/info", { email });
    if (status === 404 || data?.code === "NOT_FOUND") return null;
    if (!data?.ok) throw new Error(`posthub info: ${data?.code ?? status}`);
    return data.license as PosthubLicense;
  }

  async list(): Promise<PosthubLicense[]> {
    const res = await this.f(`${this.baseUrl}/admin/emails?limit=1000`, { headers: { authorization: `Bearer ${this.adminToken}` } });
    const data: any = await res.json().catch(() => ({}));
    if (!data?.ok) throw new Error(`posthub list: ${data?.code ?? res.status}`);
    return data.licenses as PosthubLicense[];
  }

  async setExpiry(email: string, expiresAt: Date, note?: string): Promise<PosthubLicense> {
    const { status, data } = await this.post("/admin/emails/set-expiry", {
      email,
      expiresAt: expiresAt.toISOString(),
      ...(note ? { note } : {}),
    });
    if (!data?.ok) throw new Error(`posthub set-expiry: ${data?.code ?? status}`);
    return data.license as PosthubLicense;
  }
}

/** วันหมดอายุที่ใช้ได้จริง (forever = null) */
export function posthubState(lic: PosthubLicense | null, now = Date.now()) {
  if (!lic) return { state: "none" as const, expiresAt: null };
  if (lic.status === "revoked") return { state: "revoked" as const, expiresAt: lic.expires_at };
  if (lic.plan === "forever") return { state: "forever" as const, expiresAt: null };
  if (!lic.expires_at) return { state: "waiting" as const, expiresAt: null }; // ซื้อแล้ว ยังไม่เคยล็อกอิน (ระบบเก่า)
  const expired = Date.parse(lic.expires_at) <= now;
  if (expired) return { state: "expired" as const, expiresAt: lic.expires_at };
  return { state: lic.note === "trial" ? ("trial" as const) : ("active" as const), expiresAt: lic.expires_at };
}
