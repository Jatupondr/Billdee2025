"use client";

/**
 * แพ (ผู้ขายส่ง) ต่อรายการบิล + ยอด "ต้องโอนให้แพ" (B2).
 * ยอดโอนของแพ = ทุน × จำนวน ของทุกรายการที่ระบุแพนั้น · รายการที่ไม่ระบุแพไม่นับ
 */
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/hooks/axios";
import { cn } from "@/lib/utils";

export type SupplierLine = {
  name?: string;
  quantity?: number;
  cost?: number;
  supplier?: string;
};

export type SupplierTotal = {
  supplier: string;
  count: number;
  total: number;
  lines: SupplierLine[];
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** รวมยอดโอนแยกแพ เรียงตามลำดับที่เจอในบิล */
export function supplierTotals(lines: SupplierLine[] | undefined): SupplierTotal[] {
  const map = new Map<string, SupplierTotal>();
  for (const line of lines ?? []) {
    const supplier = (line.supplier ?? "").trim();
    if (!supplier || !line.name) continue;
    const row = map.get(supplier) ?? { supplier, count: 0, total: 0, lines: [] };
    row.count += 1;
    row.total = round2(row.total + (line.cost || 0) * (line.quantity || 0));
    row.lines.push(line);
    map.set(supplier, row);
  }
  return [...map.values()];
}

const num = (n: number) =>
  n.toLocaleString("th-TH", { maximumFractionDigits: 2 });

/** ข้อความส่งให้แพ: รายการ จำนวน × ทุน และยอดรวมโอน */
export function supplierCopyText(
  row: SupplierTotal,
  bill: { billNumber?: string; customer?: string },
): string {
  const head = [bill.billNumber ? `บิล ${bill.billNumber}` : "", bill.customer ?? ""]
    .filter(Boolean)
    .join(" · ");
  const items = row.lines.map(
    (l) =>
      `${l.name} ${num(l.quantity || 0)} × ${num(l.cost || 0)} = ${num(round2((l.cost || 0) * (l.quantity || 0)))}`,
  );
  return [head, ...items, `รวมโอน ${num(row.total)} บาท`].filter(Boolean).join("\n");
}

/** ชื่อแพทั้งหมดของร้าน (จากสินค้า) สำหรับให้เลือก */
export function useSuppliers(organizationId?: string) {
  const { data } = useQuery<{ rows: string[] }>({
    queryKey: ["product-suppliers", organizationId],
    queryFn: async () =>
      (await api.get(`/products/suppliers?organizationId=${organizationId}`)).data,
    enabled: !!organizationId,
    staleTime: 60_000,
  });
  return data?.rows ?? [];
}

/** รายชื่อแพสำหรับ <input list="billdee-suppliers"> — วางครั้งเดียวต่อหน้า */
export function SupplierDatalist({ suppliers }: { suppliers: string[] }) {
  return (
    <datalist id="billdee-suppliers">
      {suppliers.map((s) => (
        <option key={s} value={s} />
      ))}
    </datalist>
  );
}

/**
 * ชิป "แพ: …" ของรายการบิล — แตะแล้วพิมพ์/เลือกแพ (เปลี่ยนเฉพาะบิลนี้)
 * ว่าง = "+ ระบุแพ"
 */
export function SupplierChip({
  value,
  onChange,
  label,
  className,
}: {
  value?: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const filled = !!value?.trim();
  if (!editing) {
    return (
      <button
        type="button"
        aria-label={label}
        onClick={() => setEditing(true)}
        className={cn(
          "inline-flex min-h-8 max-w-[11rem] items-center gap-1 truncate rounded-full border px-3 text-sm",
          filled
            ? "border-blue-500/60 bg-blue-500/10 text-blue-600 dark:text-blue-300"
            : "border-dashed border-border text-muted-foreground",
          className,
        )}
      >
        <span className="truncate">{filled ? `แพ: ${value}` : "+ ระบุแพ"}</span>
        {filled && <span aria-hidden="true">▾</span>}
      </button>
    );
  }
  return (
    <input
      autoFocus
      list="billdee-suppliers"
      aria-label={label}
      defaultValue={value ?? ""}
      placeholder="ชื่อแพ"
      maxLength={100}
      onBlur={(e) => {
        onChange(e.target.value.trim());
        setEditing(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        }
        if (e.key === "Escape") setEditing(false);
      }}
      className={cn(
        "h-8 w-40 rounded-full border border-blue-500/60 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40",
        className,
      )}
    />
  );
}

/** กล่อง "ต้องโอนให้แพ" (ซ่อนเมื่อไม่มีรายการไหนระบุแพ) */
export function SupplierPayables({
  lines,
  bill,
  copyable = false,
  className,
}: {
  lines: SupplierLine[] | undefined;
  bill?: { billNumber?: string; customer?: string };
  copyable?: boolean;
  className?: string;
}) {
  const rows = supplierTotals(lines);
  if (rows.length === 0) return null;
  const sum = round2(rows.reduce((s, r) => s + r.total, 0));
  const copy = async (row: SupplierTotal) => {
    try {
      await navigator.clipboard.writeText(supplierCopyText(row, bill ?? {}));
      toast.success(`คัดลอกยอดของแพ ${row.supplier} แล้ว`);
    } catch {
      toast.error("คัดลอกไม่ได้");
    }
  };
  return (
    <div
      className={cn(
        "rounded-2xl border border-blue-500/40 bg-blue-500/5 px-3 py-2.5",
        className,
      )}
    >
      <div className="flex items-baseline justify-between pb-1 text-sm font-semibold">
        <span>ต้องโอนให้แพ</span>
        <span>{num(sum)}</span>
      </div>
      {rows.map((row) => (
        <div
          key={row.supplier}
          className="flex items-center justify-between gap-2 border-t border-dashed border-border/60 py-1.5 text-sm"
        >
          <span className="min-w-0 truncate">
            {row.supplier}{" "}
            <span className="text-xs text-muted-foreground">
              ({row.count} รายการ)
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <b className="font-semibold">{num(row.total)}</b>
            {copyable && (
              <button
                type="button"
                onClick={() => copy(row)}
                className="min-h-8 rounded-lg border border-border bg-background px-2.5 text-xs hover:bg-accent"
              >
                คัดลอก
              </button>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
