"use client";

/**
 * สถานะบิล (B3): รอโอน / โอนแล้ว / เครดิต (มีวันครบกำหนด) / ยกเลิก
 * บิลยกเลิกไม่นับในยอดขายของ Dashboard และสรุปรายเดือน (แทนการลบบิลทิ้ง)
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/hooks/axios";
import { cn } from "@/lib/utils";

export type BillStatus = "pending" | "paid" | "credit" | "canceled";

export const STATUS_LABEL: Record<BillStatus, string> = {
  pending: "รอโอน",
  paid: "โอนแล้ว",
  credit: "เครดิต",
  canceled: "ยกเลิก",
};

const STATUS_CLASS: Record<BillStatus | "overdue", string> = {
  pending: "border-amber-500/50 bg-amber-500/15 text-amber-700 dark:text-amber-300",
  paid: "border-green-500/50 bg-green-500/15 text-green-700 dark:text-green-300",
  credit: "border-blue-500/50 bg-blue-500/15 text-blue-700 dark:text-blue-300",
  canceled: "border-zinc-500/40 bg-zinc-500/10 text-muted-foreground line-through",
  overdue: "border-red-500/60 bg-red-500/15 text-red-700 dark:text-red-300",
};

export const normalizeStatus = (s?: string): BillStatus =>
  s === "paid" || s === "credit" || s === "canceled" ? s : "pending";

/** เครดิตที่เลยวันครบกำหนดแล้ว (นับตามวันไทย) */
export function isOverdue(status?: string, dueDate?: string | Date | null) {
  if (normalizeStatus(status) !== "credit" || !dueDate) return false;
  return new Date(dueDate).getTime() < Date.now();
}

const thDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Bangkok",
  });

/** YYYY-MM-DD ตามเวลาไทย */
export const bangkokDay = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(d);

export function BillStatusBadge({
  status,
  dueDate,
  className,
}: {
  status?: string;
  dueDate?: string | Date | null;
  className?: string;
}) {
  const s = normalizeStatus(status);
  const overdue = isOverdue(s, dueDate);
  const label =
    s === "credit" && dueDate
      ? `${overdue ? "เลยกำหนด" : "เครดิต"} ${thDate(dueDate)}`
      : STATUS_LABEL[s];
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-normal",
        STATUS_CLASS[overdue ? "overdue" : s],
        className,
      )}
    >
      {label}
    </span>
  );
}

/** ปุ่มเปลี่ยนสถานะในหน้าดูบิล */
export function BillStatusActions({
  bill,
  organizationId,
}: {
  bill: { _id: string; status?: string; dueDate?: string | null };
  organizationId?: string;
}) {
  const queryClient = useQueryClient();
  const current = normalizeStatus(bill.status);
  const [askDue, setAskDue] = useState(false);
  const [due, setDue] = useState(() => {
    if (bill.dueDate) return bangkokDay(new Date(bill.dueDate));
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return bangkokDay(d);
  });

  const mutation = useMutation({
    mutationFn: async (body: { status: BillStatus; dueDate?: string }) =>
      (await api.patch(`/bills/${bill._id}/status`, { ...body, organizationId })).data,
    onSuccess: (_d, body) => {
      toast.success(`เปลี่ยนเป็น "${STATUS_LABEL[body.status]}" แล้ว`);
      setAskDue(false);
      queryClient.invalidateQueries({ queryKey: ["bill", bill._id] });
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["bill-summary"] });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "เปลี่ยนสถานะไม่สำเร็จ"),
  });

  const btn = (s: BillStatus, extra = "") =>
    cn(
      "min-h-10 rounded-xl border px-3 text-sm transition active:scale-95 disabled:opacity-50",
      current === s ? STATUS_CLASS[s] : "border-border bg-background hover:bg-accent",
      extra,
    );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {(["pending", "paid", "credit", "canceled"] as BillStatus[]).map((s) => (
          <button
            key={s}
            type="button"
            disabled={!organizationId || mutation.isPending}
            aria-pressed={current === s}
            className={btn(s)}
            onClick={() => {
              if (s === "credit") return setAskDue(true);
              if (s !== current) mutation.mutate({ status: s });
            }}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>
      {askDue && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/5 p-2.5">
          <label htmlFor="credit-due" className="text-sm">
            ครบกำหนดโอน
          </label>
          <input
            id="credit-due"
            type="date"
            value={due}
            min={bangkokDay(new Date())}
            onChange={(e) => setDue(e.target.value)}
            className="h-10 rounded-lg border border-border bg-background px-2 text-sm"
          />
          <button
            type="button"
            disabled={!due || mutation.isPending}
            className="min-h-10 rounded-lg bg-blue-600 px-4 text-sm text-white disabled:opacity-50"
            onClick={() => mutation.mutate({ status: "credit", dueDate: due })}
          >
            บันทึกเครดิต
          </button>
          <button
            type="button"
            className="min-h-10 px-2 text-sm text-muted-foreground"
            onClick={() => setAskDue(false)}
          >
            ยกเลิก
          </button>
        </div>
      )}
    </div>
  );
}

/** รายการสินค้าสูงสุดต่อบิล — ใบเสร็จ PDF ขึ้นหน้าใหม่ให้เอง (A4 ≈ 14 รายการ/หน้าแรก) */
export const MAX_BILL_ITEMS = 50;

/** เปลี่ยนสถานะบิลเดียว หรือหลายบิล (ids) */
export function useSetStatus(organizationId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (v: { ids: string[]; status: BillStatus; dueDate?: string }) =>
      v.ids.length === 1
        ? (await api.patch(`/bills/${v.ids[0]}/status`, { organizationId, status: v.status, dueDate: v.dueDate })).data
        : (await api.patch(`/bills/status`, { organizationId, ...v })).data,
    onSuccess: (_d, v) => {
      toast.success(
        v.ids.length === 1
          ? `เปลี่ยนเป็น "${STATUS_LABEL[v.status]}" แล้ว`
          : `เปลี่ยน ${v.ids.length} บิลเป็น "${STATUS_LABEL[v.status]}" แล้ว`,
      );
      for (const id of v.ids) queryClient.invalidateQueries({ queryKey: ["bill", id] });
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["bill-counts"] });
      queryClient.invalidateQueries({ queryKey: ["bill-summary"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "เปลี่ยนสถานะไม่สำเร็จ"),
  });
}

const defaultDue = (dueDate?: string | Date | null) => {
  if (dueDate) return bangkokDay(new Date(dueDate));
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return bangkokDay(d);
};

/** ตัวเลือกสถานะ + ช่องวันครบกำหนดเมื่อเลือกเครดิต (ใช้ทั้งเมนูทีละบิลและแถบหลายบิล) */
export function StatusChoices({
  current,
  dueDate,
  disabled,
  onPick,
  layout = "list",
}: {
  current?: string;
  dueDate?: string | Date | null;
  disabled?: boolean;
  onPick: (status: BillStatus, dueDate?: string) => void;
  layout?: "list" | "row";
}) {
  const [askDue, setAskDue] = useState(false);
  const [due, setDue] = useState(() => defaultDue(dueDate));
  const cur = current ? normalizeStatus(current) : undefined;
  if (askDue) {
    return (
      <div className="flex flex-wrap items-center gap-2 p-1">
        <label className="text-sm" htmlFor="due-pick">
          ครบกำหนดโอน
        </label>
        <input
          id="due-pick"
          type="date"
          value={due}
          min={bangkokDay(new Date())}
          onChange={(e) => setDue(e.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-2 text-sm"
        />
        <button
          type="button"
          disabled={!due || disabled}
          onClick={() => onPick("credit", due)}
          className="min-h-10 rounded-lg bg-blue-600 px-3 text-sm text-white disabled:opacity-50"
        >
          บันทึกเครดิต
        </button>
        <button type="button" onClick={() => setAskDue(false)} className="min-h-10 px-2 text-sm text-muted-foreground">
          กลับ
        </button>
      </div>
    );
  }
  const order: BillStatus[] = layout === "row" ? ["paid", "pending", "credit", "canceled"] : ["pending", "paid", "credit", "canceled"];
  return (
    <div className={layout === "row" ? "flex flex-wrap gap-2" : "flex flex-col"}>
      {order.map((s) => (
        <button
          key={s}
          type="button"
          disabled={disabled}
          aria-pressed={cur === s}
          onClick={() => (s === "credit" ? setAskDue(true) : onPick(s))}
          className={cn(
            layout === "row"
              ? cn("min-h-10 rounded-xl border px-4 text-sm disabled:opacity-50", s === "paid" ? "border-green-600 bg-green-600 text-white" : "border-border bg-background hover:bg-accent", s === "canceled" && "text-red-600 dark:text-red-300")
              : cn("flex min-h-10 items-center gap-2 rounded-lg px-3 text-left text-sm hover:bg-accent disabled:opacity-50", cur === s && "bg-accent", s === "canceled" && "text-red-600 dark:text-red-300"),
          )}
        >
          {layout === "list" && <span className="w-3">{cur === s ? "●" : ""}</span>}
          {s === "credit" ? (cur === "credit" && layout === "list" ? "เครดิต — แก้วันครบกำหนด" : "เครดิต…") : STATUS_LABEL[s]}
        </button>
      ))}
    </div>
  );
}

/** ป้ายสถานะที่กดแล้วมีเมนูเปลี่ยนสถานะ (หน้ารายการบิล / หน้าบิลเสร็จแล้ว) */
export function StatusMenu({
  bill,
  organizationId,
  className,
}: {
  bill: { _id: string; status?: string; dueDate?: string | null; billNumber?: string };
  organizationId?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const mutation = useSetStatus(organizationId);
  return (
    <span className={cn("relative inline-block", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`เปลี่ยนสถานะบิล ${bill.billNumber ?? ""}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="inline-flex items-center gap-1"
      >
        <BillStatusBadge status={bill.status} dueDate={bill.dueDate} className="text-[13px]" />
        <span aria-hidden="true" className="text-xs text-muted-foreground">▾</span>
      </button>
      {open && (
        <>
          <span
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          />
          <div
            role="menu"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 z-50 mt-1 w-64 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg"
          >
            <div className="px-3 py-1.5 text-xs text-muted-foreground">
              เปลี่ยนสถานะ {bill.billNumber}
            </div>
            <StatusChoices
              current={bill.status}
              dueDate={bill.dueDate}
              disabled={!organizationId || mutation.isPending}
              onPick={(status, dueDate) =>
                mutation.mutate({ ids: [bill._id], status, dueDate }, { onSuccess: () => setOpen(false) })
              }
            />
          </div>
        </>
      )}
    </span>
  );
}
