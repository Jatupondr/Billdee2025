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
 * ชิป "แพ: …" ของรายการบิล — ว่างไว้ได้ (ไม่เติมแพให้เอง)
 * แตะ "+ ระบุแพ" → มีรายชื่อแพที่เคยใช้ขึ้นให้เลือกทันที · พิมพ์เพื่อค้นหา หรือพิมพ์ชื่อใหม่แล้วกด Enter
 */
export function SupplierChip({
  value,
  onChange,
  label,
  suppliers = [],
  className,
}: {
  value?: string;
  onChange: (value: string) => void;
  label: string;
  suppliers?: string[];
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const filled = !!value?.trim();

  if (!editing) {
    return (
      <button
        type="button"
        aria-label={label}
        onClick={() => {
          setText(value ?? "");
          setEditing(true);
        }}
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

  const q = text.trim().toLowerCase();
  const options = suppliers.filter((s) => !q || s.toLowerCase().includes(q)).slice(0, 8);
  const exact = suppliers.some((s) => s.toLowerCase() === q);
  const choose = (v: string) => {
    onChange(v.trim());
    setEditing(false);
  };

  return (
    <div className={cn("relative", className)}>
      <input
        autoFocus
        role="combobox"
        aria-expanded="true"
        aria-label={label}
        value={text}
        placeholder="พิมพ์หรือเลือกแพ"
        maxLength={100}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            choose(options.length === 1 && !exact && q ? (options[0] as string) : text);
          }
          if (e.key === "Escape") setEditing(false);
        }}
        className="h-9 w-48 rounded-full border border-blue-500/60 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
      />
      <ul
        role="listbox"
        aria-label="รายชื่อแพ"
        className="absolute right-0 z-50 mt-1 max-h-64 w-56 overflow-auto rounded-xl border border-border bg-popover p-1 text-sm shadow-lg"
      >
        {options.map((s) => (
          <li key={s} role="option" aria-selected={s === value}>
            <button
              type="button"
              // mousedown ก่อน blur ของช่องพิมพ์ จะได้เลือกได้
              onMouseDown={(e) => {
                e.preventDefault();
                choose(s);
              }}
              className="flex min-h-10 w-full items-center rounded-lg px-3 text-left hover:bg-accent"
            >
              {s}
            </button>
          </li>
        ))}
        {q && !exact && (
          <li role="option" aria-selected="false">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                choose(text);
              }}
              className="flex min-h-10 w-full items-center rounded-lg px-3 text-left text-blue-600 hover:bg-accent dark:text-blue-300"
            >
              + ใช้แพใหม่ “{text.trim()}”
            </button>
          </li>
        )}
        {filled && (
          <li role="option" aria-selected="false">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                choose("");
              }}
              className="flex min-h-10 w-full items-center rounded-lg px-3 text-left text-muted-foreground hover:bg-accent"
            >
              ไม่ระบุแพ
            </button>
          </li>
        )}
        {options.length === 0 && !q && (
          <li className="px-3 py-2 text-muted-foreground">ยังไม่มีแพ — พิมพ์ชื่อแพใหม่</li>
        )}
      </ul>
    </div>
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
