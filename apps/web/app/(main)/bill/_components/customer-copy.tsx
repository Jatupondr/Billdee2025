"use client";

/**
 * คัดลอกบิลเป็นข้อความส่งลูกค้า (วางในแชท LINE / Messenger)
 *
 *   บิล INV-0123 · คุณสมชาย
 *   กุ้งขาว 50/55 2.5 × 320 = 800
 *   ...
 *
 *   ***รวมโอน 1,160 บาท***
 *
 *   ธนาคาร : กสิกรไทย
 *   เลขบัญชี : 123-4-56789-0
 */
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Line = { name?: string; quantity?: number; price?: number; total?: number };
type BillLike = {
  billNumber?: string;
  name_customer?: string;
  products?: Line[];
  discount?: number;
  discountPercent?: number;
  includeVat?: boolean;
  vat?: number;
  taxPercent?: number;
  total?: number;
};
type OrgLike = {
  bank_name?: string;
  account_no?: string;
  account_name?: string;
  prompt_pay?: string;
} | null | undefined;

const num = (n: number) => (n || 0).toLocaleString("th-TH", { maximumFractionDigits: 2 });

export function customerBillText(bill: BillLike, org: OrgLike): string {
  const head = [bill.billNumber ? `บิล ${bill.billNumber}` : "", bill.name_customer ?? ""]
    .filter(Boolean)
    .join(" · ");
  const items = (bill.products ?? [])
    .filter((l) => l.name)
    .map((l) => {
      const total = l.total ?? (l.price || 0) * (l.quantity || 0);
      return `${l.name} ${num(l.quantity || 0)} × ${num(l.price || 0)} = ${num(total)}`;
    });
  const extra: string[] = [];
  if (bill.discount) extra.push(`ส่วนลด${bill.discountPercent ? ` ${bill.discountPercent}%` : ""} -${num(bill.discount)}`);
  if (bill.includeVat && bill.vat) extra.push(`VAT ${bill.taxPercent || 7}% +${num(bill.vat)}`);
  const bank = [
    org?.bank_name ? `ธนาคาร : ${org.bank_name}` : "",
    org?.account_no ? `เลขบัญชี : ${org.account_no}` : "",
    org?.account_name ? `ชื่อบัญชี : ${org.account_name}` : "",
    org?.prompt_pay ? `พร้อมเพย์ : ${org.prompt_pay}` : "",
  ].filter(Boolean);
  return [
    head,
    ...items,
    ...extra,
    "",
    `***รวมโอน ${num(bill.total || 0)} บาท***`,
    ...(bank.length ? ["", ...bank] : []),
  ].join("\n");
}

export async function copyBillForCustomer(bill: BillLike, org: OrgLike) {
  try {
    await navigator.clipboard.writeText(customerBillText(bill, org));
    if (!org?.account_no && !org?.prompt_pay) {
      toast.success("คัดลอกบิลแล้ว", {
        description: "ยังไม่มีเลขบัญชี — ใส่ได้ที่ ตั้งค่า > ข้อมูลร้าน",
      });
    } else {
      toast.success("คัดลอกบิลแล้ว — วางในแชทลูกค้าได้เลย");
    }
  } catch {
    toast.error("คัดลอกไม่ได้");
  }
}

export function CopyForCustomerButton({
  bill,
  org,
  className,
}: {
  bill: BillLike;
  org: OrgLike;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => copyBillForCustomer(bill, org)}
      className={cn(
        "min-h-10 rounded-xl border border-green-600/60 bg-green-600/10 px-4 text-sm text-green-700 hover:bg-green-600/20 active:scale-95 dark:text-green-300",
        className,
      )}
    >
      คัดลอกบิลส่งลูกค้า
    </button>
  );
}
