/**
 * แพ็กเกจและราคา (ตัดสินใจโดยเจ้าของ 2026-11-11) — ไฟล์นี้ไม่มี I/O ทดสอบได้ตรงๆ
 *   Billdee Free  = 10 บิล/เดือน (นับตามเดือนไทย)
 *   Billdee Pro   = 200/เดือน · 2,000/ปี
 *   PostHub       = 150/เดือน · 1,500/ปี · ทดลอง 7 วัน (ครั้งเดียวต่ออีเมล)
 *   รวมชุด        = 300/เดือน · 3,000/ปี
 * ต่ออายุก่อนหมด = นับต่อจากวันหมดเดิม (ไม่เสียวัน)
 */
export type Product = "billdee" | "posthub" | "bundle";
export type Cycle = "month" | "year";

export const PRODUCTS: readonly Product[] = ["billdee", "posthub", "bundle"];
export const CYCLES: readonly Cycle[] = ["month", "year"];

export const PRICES: Readonly<Record<Product, Record<Cycle, number>>> = {
  billdee: { month: 200, year: 2000 },
  posthub: { month: 150, year: 1500 },
  bundle: { month: 300, year: 3000 },
};

export const PRODUCT_LABEL: Readonly<Record<Product, string>> = {
  billdee: "Billdee Pro",
  posthub: "Billdee PostHub",
  bundle: "รวมชุด Pro + PostHub",
};

export const FREE_BILLS_PER_MONTH = 10;
export const TRIAL_DAYS = 7;
const DAY_MS = 86_400_000;
const BKK_MS = 7 * 3_600_000;

export const includesBilldee = (p: Product) => p === "billdee" || p === "bundle";
export const includesPosthub = (p: Product) => p === "posthub" || p === "bundle";

export function planLabel(product: Product, cycle: Cycle): string {
  return `${PRODUCT_LABEL[product]} (${cycle === "month" ? "รายเดือน" : "รายปี"})`;
}

/** วันหมดอายุใหม่: ต่อจากวันหมดเดิมถ้ายังไม่หมด ไม่งั้นนับจากตอนนี้ · บวกเป็นเดือนปฏิทิน (11 พ.ย. → 11 ธ.ค.) */
export function nextExpiry(current: Date | string | null | undefined, cycle: Cycle, now: Date = new Date()): Date {
  const cur = current ? new Date(current).getTime() : 0;
  const base = new Date(Math.max(Number.isFinite(cur) ? cur : 0, now.getTime()));
  // คำนวณในเวลาไทย เพื่อไม่ให้วันเลื่อนตอนข้ามเดือน
  const local = new Date(base.getTime() + BKK_MS);
  const months = cycle === "month" ? 1 : 12;
  const day = local.getUTCDate();
  local.setUTCDate(1);
  local.setUTCMonth(local.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth() + 1, 0)).getUTCDate();
  local.setUTCDate(Math.min(day, lastDay)); // 31 ม.ค. + 1 เดือน = 28/29 ก.พ.
  return new Date(local.getTime() - BKK_MS);
}

export function trialExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + TRIAL_DAYS * DAY_MS);
}

/** ต้นเดือนตามเวลาไทย (ใช้นับโควตาบิลฟรี) */
export function bangkokMonthStart(now: Date = new Date()): Date {
  const local = new Date(now.getTime() + BKK_MS);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - BKK_MS);
}

/** วันที่ไทย YYYY-MM-DD */
export function bangkokDay(now: Date = new Date()): string {
  return new Date(now.getTime() + BKK_MS).toISOString().slice(0, 10);
}

export function bangkokHour(now: Date = new Date()): number {
  return new Date(now.getTime() + BKK_MS).getUTCHours();
}

const TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
/** 11 ธ.ค. 2569 */
export function thaiDate(d: Date | string): string {
  const local = new Date(new Date(d).getTime() + BKK_MS);
  return `${local.getUTCDate()} ${TH_MONTHS[local.getUTCMonth()]} ${local.getUTCFullYear() + 543}`;
}

export const money = (n: number) => n.toLocaleString("en-US");

export function isProduct(v: unknown): v is Product {
  return typeof v === "string" && (PRODUCTS as readonly string[]).includes(v);
}
export function isCycle(v: unknown): v is Cycle {
  return typeof v === "string" && (CYCLES as readonly string[]).includes(v);
}

export const REJECT_REASONS: Readonly<Record<string, string>> = {
  amount: "ยอดเงินไม่ตรงกับแพ็กเกจ",
  slip: "สลิปไม่ชัดหรือเป็นสลิปซ้ำ",
  notyet: "ยังไม่พบเงินเข้าบัญชี",
  other: "กรุณาติดต่อผู้ขาย",
};
