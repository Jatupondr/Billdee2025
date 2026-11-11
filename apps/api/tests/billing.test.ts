import { describe, expect, it } from "bun:test";
import { bangkokDay, bangkokMonthStart, nextExpiry, PRICES, thaiDate, trialExpiry } from "../src/domain/billing/plans";
import { Posthub, posthubState } from "../src/domain/billing/posthub";
import { parseCallback } from "../src/domain/billing/service";
import { Telegram } from "../src/domain/billing/telegram";

const at = (s: string) => new Date(s);

describe("plans", () => {
  it("prices are the owner's (2026-11-11)", () => {
    expect(PRICES).toEqual({
      billdee: { month: 200, year: 2000 },
      posthub: { month: 150, year: 1500 },
      bundle: { month: 300, year: 3000 },
    });
  });
  it("renew before expiry counts from the old end date; after expiry from now", () => {
    const now = at("2026-11-11T05:45:00Z"); // 12:45 ไทย
    expect(thaiDate(nextExpiry(null, "month", now))).toBe("11 ธ.ค. 2569");
    expect(thaiDate(nextExpiry(null, "year", now))).toBe("11 พ.ย. 2570");
    expect(thaiDate(nextExpiry(at("2026-11-14T05:00:00Z"), "month", now))).toBe("14 ธ.ค. 2569"); // ทดลองเหลือ 3 วัน ไม่เสียวัน
    expect(nextExpiry(at("2026-01-01T00:00:00Z"), "month", now).getTime()).toBe(nextExpiry(null, "month", now).getTime());
  });
  it("month end and Thai midnight do not shift the day", () => {
    expect(thaiDate(nextExpiry(null, "month", at("2027-01-30T18:00:00Z")))).toBe("28 ก.พ. 2570"); // 31 ม.ค. ไทย
    expect(thaiDate(nextExpiry(null, "month", at("2026-11-30T17:30:00Z")))).toBe("1 ม.ค. 2570"); // 1 ธ.ค. 00:30 ไทย
  });
  it("trial = 7 days; free quota month starts at Thai midnight on the 1st", () => {
    expect(trialExpiry(at("2026-11-11T00:00:00Z")).toISOString()).toBe("2026-11-18T00:00:00.000Z");
    expect(bangkokMonthStart(at("2026-11-30T18:00:00Z")).toISOString()).toBe("2026-11-30T17:00:00.000Z"); // 1 ธ.ค. ไทย
    expect(bangkokMonthStart(at("2026-11-11T05:00:00Z")).toISOString()).toBe("2026-10-31T17:00:00.000Z");
    expect(bangkokDay(at("2026-11-11T17:30:00Z"))).toBe("2026-11-12");
  });
});

describe("telegram callbacks", () => {
  const id = "65a1b2c3d4e5f60718293a4b";
  it("accepts only known actions with a valid id", () => {
    expect(parseCallback(`ap:${id}`)).toEqual({ action: "ap", id });
    expect(parseCallback(`rr:${id}:amount`)).toEqual({ action: "rr", id, reason: "amount" });
    expect(parseCallback(`rr:${id}`)).toBeNull();
    expect(parseCallback(`ap:${id}x`)).toBeNull();
    expect(parseCallback(`zz:${id}`)).toBeNull();
    expect(parseCallback(`ap:{"$ne":1}`)).toBeNull();
    expect(`rr:${id}:notyet`.length).toBeLessThanOrEqual(64); // Telegram callback_data limit
  });
  it("is only built from env; sends to the owner chat only", async () => {
    expect(Telegram.fromEnv({})).toBeNull();
    const calls: any[] = [];
    const fake = (async (url: string, init: any) => {
      calls.push({ url, body: JSON.parse(init.body) });
      return new Response(JSON.stringify({ ok: true, result: { message_id: 7 } }));
    }) as any;
    const tg = Telegram.fromEnv({ TELEGRAM_BOT_TOKEN: "123:abc", TELEGRAM_OWNER_CHAT_ID: "42" }, fake)!;
    await tg.sendText("hi", [[{ text: "✅", callback_data: "x" }]]);
    expect(calls[0].url).toBe("https://api.telegram.org/bot123:abc/sendMessage");
    expect(calls[0].body).toMatchObject({ chat_id: "42", text: "hi", reply_markup: { inline_keyboard: [[{ text: "✅", callback_data: "x" }]] } });
  });
});

describe("posthub client", () => {
  const fake = (handler: (path: string, body: any) => [number, any]) =>
    (async (url: string, init: any) => {
      const [status, data] = handler(new URL(url).pathname, init.body ? JSON.parse(init.body) : null);
      expect(init.headers.authorization).toBe("Bearer admin-token");
      return new Response(JSON.stringify(data), { status });
    }) as any;

  it("info: 404 = not a customer yet; set-expiry sends ISO date", async () => {
    let sent: any;
    const ph = Posthub.fromEnv(
      { POSTHUB_LICENSE_URL: "https://lic.test/", POSTHUB_ADMIN_TOKEN: "admin-token" },
      fake((path, body) => {
        if (path === "/admin/emails/info") return [404, { ok: false, code: "NOT_FOUND" }];
        sent = { path, body };
        return [200, { ok: true, license: { email: body.email, expires_at: body.expiresAt } }];
      }),
    )!;
    expect(await ph.info("a@b.co")).toBeNull();
    await ph.setExpiry("a@b.co", at("2026-11-18T00:00:00Z"), "trial");
    expect(sent).toEqual({ path: "/admin/emails/set-expiry", body: { email: "a@b.co", expiresAt: "2026-11-18T00:00:00.000Z", note: "trial" } });
  });
  it("info: a wrong admin token is an error, not 'no customer'", async () => {
    const ph = new Posthub("https://lic.test", "admin-token", fake(() => [401, { ok: false, code: "UNAUTHORIZED" }]));
    await expect(ph.info("a@b.co")).rejects.toThrow("UNAUTHORIZED");
  });
  it("state", () => {
    const now = Date.parse("2026-11-11T00:00:00Z");
    const base = { email: "a", status: "active", note: null, activated_at: "x", pending_days: 0, max_devices: 2, devices: [] };
    expect(posthubState(null, now).state).toBe("none");
    expect(posthubState({ ...base, plan: "forever", expires_at: null }, now).state).toBe("forever");
    expect(posthubState({ ...base, plan: "30d", note: "trial", expires_at: "2026-11-14T00:00:00Z" }, now).state).toBe("trial");
    expect(posthubState({ ...base, plan: "30d", expires_at: "2026-11-01T00:00:00Z" }, now).state).toBe("expired");
    expect(posthubState({ ...base, plan: "30d", status: "revoked", expires_at: "2026-12-01T00:00:00Z" }, now).state).toBe("revoked");
  });
});
