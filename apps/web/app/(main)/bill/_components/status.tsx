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
