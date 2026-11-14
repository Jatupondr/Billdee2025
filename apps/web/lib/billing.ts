"use client";

/** แพ็กเกจและการชำระเงิน — ข้อมูลจาก GET /billing/status (ราคาและสิทธิ์ตัดสินที่เซิร์ฟเวอร์) */
import { useQuery } from "@tanstack/react-query";
import api from "@/hooks/axios";

export type Product = "billdee" | "posthub" | "bundle";
export type Cycle = "month" | "year";

export type PaymentInfo = {
  id: string;
  product: Product;
  cycle: Cycle;
  amount: number;
  status: "pending" | "approved" | "rejected";
  rejectReason: string | null;
  createdAt: string;
  decidedAt: string | null;
  billdeeExpDate: string | null;
  posthubExpDate: string | null;
};

export type BillingStatus = {
  email: string;
  billdee: { plan: "free" | "pro"; expDate: string | null; usedThisMonth: number; freeLimit: number; unlimited: boolean };
  posthub: {
    available: boolean;
    state: "none" | "trial" | "active" | "expired" | "forever" | "revoked" | "waiting" | "unknown";
    expiresAt: string | null;
    devices: number;
    maxDevices: number;
    trialAvailable: boolean;
  };
  pending: PaymentInfo | null;
  lastDecided: PaymentInfo | null;
  prices: Record<Product, Record<Cycle, number>>;
  payTo: { ready: boolean; accountName: string; promptPay: string; bankName: string; accountNo: string };
  telegramReady: boolean;
};

export const PRODUCT_LABEL: Record<Product, string> = {
  billdee: "Billdee Pro",
  posthub: "Billdee PostHub",
  bundle: "รวมชุด Pro + PostHub",
};

export const planLabel = (p: Product, c: Cycle) => `${PRODUCT_LABEL[p]} (${c === "month" ? "รายเดือน" : "รายปี"})`;

export const thaiDate = (d: string | Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" }) : "-";

export const daysLeft = (d: string | null | undefined) =>
  // 1 ชม. เผื่อเวลาเครื่องต่างกัน: ทดลอง 7 วันที่เพิ่งเริ่มโชว์ 7 ไม่ใช่ 8
  d ? Math.max(0, Math.ceil((new Date(d).getTime() - Date.now() - 3_600_000) / 86_400_000)) : 0;

export const baht = (n: number) => n.toLocaleString("th-TH");

export function useBillingStatus(enabled = true) {
  return useQuery<BillingStatus>({
    queryKey: ["billing-status"],
    queryFn: async () => (await api.get("/billing/status")).data.data,
    enabled,
    // รออนุมัติอยู่ = เช็กทุก 8 วินาที (อนุมัติในเทเลแกรมแล้วหน้าเปลี่ยนเอง)
    refetchInterval: (q) => (q.state.data?.pending ? 8_000 : false),
    refetchOnWindowFocus: true,
  });
}

/** ไฟล์ส่วนขยาย PostHub ล่าสุด (อยู่ใน public/downloads) — ออกเวอร์ชันใหม่: วางไฟล์ใหม่แล้วแก้ 2 บรรทัดนี้ */
export const POSTHUB_VERSION = "1.8.1";
export const POSTHUB_DOWNLOAD = `/downloads/billdee-posthub-v${POSTHUB_VERSION}.zip`;
