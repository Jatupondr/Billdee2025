"use client";

/** แจ้งชำระเงิน (แอดมิน) — สำรองไว้ ปกติเจ้าของกดอนุมัติ/ปฏิเสธในเทเลแกรม */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/hooks/axios";
import { baht, planLabel, thaiDate } from "@/lib/billing";
import { cn } from "@/lib/utils";

const REASONS: [string, string][] = [
  ["amount", "ยอดไม่ตรง"],
  ["slip", "สลิปไม่ชัด/ซ้ำ"],
  ["notyet", "ยังไม่เห็นเงินเข้า"],
  ["other", "อื่นๆ"],
];
const TABS: [string, string][] = [
  ["pending", "รออนุมัติ"],
  ["approved", "อนุมัติแล้ว"],
  ["rejected", "ปฏิเสธ"],
  ["", "ทั้งหมด"],
];
const btn = "min-h-10 whitespace-nowrap rounded-xl border px-3 text-sm transition active:scale-95 disabled:opacity-50";

export default function Payments() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("pending");
  const [rejecting, setRejecting] = useState<string | null>(null);
  const { data, isLoading } = useQuery<any>({
    queryKey: ["admin-payments", tab],
    queryFn: async () => (await api.get(`/billing/payments?pageSize=50${tab ? `&status=${tab}` : ""}`)).data,
    refetchInterval: 15_000,
  });
  const act = useMutation({
    mutationFn: async ({ id, action, reason }: { id: string; action: "approve" | "reject" | "retry-posthub"; reason?: string }) =>
      (await api.post(`/billing/payments/${id}/${action}`, action === "reject" ? { reason } : {})).data,
    onSuccess: (r: any, v) => {
      if (r?.already) toast.info("รายการนี้ตัดสินไปแล้ว");
      else if (r?.data?.posthubError) toast.warning(`อนุมัติแล้ว แต่ต่ออายุ PostHub ไม่สำเร็จ: ${r.data.posthubError}`);
      else toast.success(v.action === "reject" ? "ปฏิเสธแล้ว" : "เรียบร้อย");
      setRejecting(null);
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "ทำไม่สำเร็จ"),
  });

  const rows: any[] = data?.rows ?? [];
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-white p-5 shadow-xl dark:bg-zinc-900">
      <div>
        <h1 className="text-2xl font-normal tracking-widest">แจ้งชำระเงิน</h1>
        <p className="text-sm text-muted-foreground">ปกติกดอนุมัติในเทเลแกรม — หน้านี้ไว้สำรอง</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(btn, tab === k ? "border-blue-600 bg-blue-600 text-white" : "border-border")}
          >
            {label}
            {k === "pending" && data?.meta?.pendingCount ? ` (${data.meta.pendingCount})` : ""}
          </button>
        ))}
      </div>
      {isLoading && <p className="text-muted-foreground">กำลังโหลด…</p>}
      {!isLoading && rows.length === 0 && <p className="text-muted-foreground">ไม่มีรายการ</p>}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((p) => (
          <div key={p._id} className="flex gap-3 rounded-2xl border border-border/60 p-3" data-payment={p._id}>
            <a href={p.slipUrl} target="_blank" rel="noreferrer" className="shrink-0">
              {/* biome-ignore lint/performance/noImgElement: รูปสลิปจาก Cloudinary */}
              <img src={p.slipUrl} alt="สลิป" className="h-36 w-24 rounded-lg bg-muted object-cover" />
            </a>
            <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
              <b className="truncate">{p.userId?.email ?? p.email}</b>
              <span>{planLabel(p.product, p.cycle)}</span>
              <span className="font-semibold">{baht(p.amount)} บาท</span>
              <span className="text-xs text-muted-foreground">ส่งเมื่อ {new Date(p.createdAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}</span>
              {p.status === "approved" && (
                <span className="text-green-600 dark:text-green-400">
                  ✅ อนุมัติ{p.billdeeExpDate && ` · Billdee ถึง ${thaiDate(p.billdeeExpDate)}`}
                  {p.posthubExpDate && ` · PostHub ถึง ${thaiDate(p.posthubExpDate)}`}
                </span>
              )}
              {p.status === "rejected" && <span className="text-red-500">❌ {p.rejectReason}</span>}
              {p.posthubError && (
                <button type="button" className={cn(btn, "border-amber-500 text-amber-600")} onClick={() => act.mutate({ id: p._id, action: "retry-posthub" })}>
                  🔁 ลองต่ออายุ PostHub อีกครั้ง
                </button>
              )}
              {p.status === "pending" && rejecting !== p._id && (
                <div className="mt-auto flex gap-2">
                  <button
                    type="button"
                    disabled={act.isPending}
                    className={cn(btn, "border-green-600 bg-green-600 font-semibold text-white")}
                    onClick={() => act.mutate({ id: p._id, action: "approve" })}
                  >
                    ✅ อนุมัติ
                  </button>
                  <button type="button" className={cn(btn, "border-border")} onClick={() => setRejecting(p._id)}>
                    ❌ ปฏิเสธ
                  </button>
                </div>
              )}
              {rejecting === p._id && (
                <div className="mt-auto flex flex-wrap gap-1.5">
                  {REASONS.map(([code, label]) => (
                    <button
                      key={code}
                      type="button"
                      disabled={act.isPending}
                      className={cn(btn, "min-h-9 border-red-500/60")}
                      onClick={() => act.mutate({ id: p._id, action: "reject", reason: code })}
                    >
                      {label}
                    </button>
                  ))}
                  <button type="button" className={cn(btn, "min-h-9 border-border")} onClick={() => setRejecting(null)}>
                    ← กลับ
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
