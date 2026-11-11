"use client";

/**
 * สรุปรายเดือน (B4): ยอดขาย ต้นทุน กำไร · ยอดตามสถานะ · เครดิตเลยกำหนด · ต้องโอนให้แพ
 * + ดาวน์โหลด Excel (สรุป / บิล / รายการ / ต้องโอนให้แพ)
 */
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import api from "@/hooks/axios";
import { authClient } from "@/lib/auth-client";
import { downloadXlsx, type Sheet } from "@/lib/xlsx";
import { cn } from "@/lib/utils";
import {
  BillStatusBadge,
  bangkokDay,
  isOverdue,
  normalizeStatus,
  STATUS_LABEL,
} from "../../bill/_components/status";

type Summary = {
  month: string;
  totals: { bills: number; sales: number; cost: number; profit: number; outstanding: number };
  byStatus: Record<"pending" | "paid" | "credit" | "canceled", { count: number; total: number }>;
  overdue: { count: number; total: number };
  suppliers: { supplier: string; count: number; total: number }[];
  bills: any[];
};

const TH_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];
const monthLabel = (m: string) => {
  const [y, mo] = m.split("-").map(Number);
  return `${TH_MONTHS[(mo as number) - 1]} ${(y as number) + 543}`;
};
const shiftMonth = (m: string, by: number) => {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(Date.UTC(y as number, (mo as number) - 1 + by, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};
const money = (n: number) =>
  (n || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const thDay = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit", timeZone: "Asia/Bangkok" }) : "";

function Stat({ label, value, tone }: { label: string; value: string; tone?: "green" | "amber" | "red" }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-2xl font-semibold",
          tone === "green" && "text-green-600 dark:text-green-400",
          tone === "amber" && "text-amber-600 dark:text-amber-300",
          tone === "red" && "text-red-600 dark:text-red-400",
        )}
      >
        {value}
      </div>
    </div>
  );
}

export default function MonthSummary() {
  const { data: activeOrg } = authClient.useActiveOrganization();
  const thisMonth = bangkokDay(new Date()).slice(0, 7);
  const [month, setMonth] = useState(thisMonth);

  const { data, isLoading, isError } = useQuery<{ data: Summary }>({
    queryKey: ["bill-summary", activeOrg?.id, month],
    queryFn: async () =>
      (await api.get(`/bills/summary?organizationId=${activeOrg?.id}&month=${month}`)).data,
    enabled: !!activeOrg?.id,
  });
  const s = data?.data;

  const owed = useMemo(
    () => (s?.bills ?? []).filter((b) => ["pending", "credit"].includes(normalizeStatus(b.status))),
    [s],
  );

  const exportExcel = () => {
    if (!s) return;
    const lineRows = s.bills
      .filter((b) => normalizeStatus(b.status) !== "canceled")
      .flatMap((b) =>
        (b.products || []).map((p: any) => [
          bangkokDay(new Date(b.date)),
          b.billNumber,
          b.name_customer,
          p.name,
          p.quantity ?? 0,
          p.price ?? 0,
          p.cost ?? 0,
          p.total ?? 0,
          Math.round((p.cost || 0) * (p.quantity || 0) * 100) / 100,
          p.supplier || "",
        ]),
      );
    const sheets: Sheet[] = [
      {
        name: "สรุป",
        widths: [28, 16, 10],
        rows: [
          ["หัวข้อ", "ยอด (บาท)", "จำนวนบิล"],
          ["เดือน", monthLabel(s.month), null],
          ["ยอดขาย (ไม่รวมบิลยกเลิก)", s.totals.sales, s.totals.bills],
          ["ต้นทุน", s.totals.cost, null],
          ["กำไร", s.totals.profit, null],
          ["โอนแล้ว", s.byStatus.paid.total, s.byStatus.paid.count],
          ["รอโอน", s.byStatus.pending.total, s.byStatus.pending.count],
          ["เครดิต", s.byStatus.credit.total, s.byStatus.credit.count],
          ["เครดิตเลยกำหนด", s.overdue.total, s.overdue.count],
          ["ยกเลิก", s.byStatus.canceled.total, s.byStatus.canceled.count],
        ],
      },
      {
        name: "บิล",
        widths: [12, 14, 24, 12, 12, 12, 10, 14, 12],
        rows: [
          ["วันที่", "เลขที่บิล", "ลูกค้า", "ยอดรวม", "ต้นทุน", "กำไร", "สถานะ", "ครบกำหนดเครดิต", "วันที่โอน"],
          ...s.bills.map((b) => [
            bangkokDay(new Date(b.date)),
            b.billNumber,
            b.name_customer,
            b.total ?? 0,
            b.cost ?? 0,
            Math.round(((b.total || 0) - (b.cost || 0)) * 100) / 100,
            STATUS_LABEL[normalizeStatus(b.status)],
            b.dueDate ? bangkokDay(new Date(b.dueDate)) : "",
            b.paidAt ? bangkokDay(new Date(b.paidAt)) : "",
          ]),
        ],
      },
      {
        name: "รายการ",
        widths: [12, 14, 22, 26, 8, 10, 10, 12, 12, 16],
        rows: [
          ["วันที่", "เลขที่บิล", "ลูกค้า", "สินค้า", "จำนวน", "ราคา", "ทุน", "ยอดขาย", "ยอดทุน", "แพ"],
          ...lineRows,
        ],
      },
      {
        name: "ต้องโอนให้แพ",
        widths: [22, 12, 16],
        rows: [
          ["แพ", "รายการ", "ยอดโอน (บาท)"],
          ...s.suppliers.map((r) => [r.supplier, r.count, r.total]),
          ["รวม", null, Math.round(s.suppliers.reduce((a, r) => a + r.total, 0) * 100) / 100],
        ],
      },
    ];
    try {
      downloadXlsx(`billdee-${s.month}`, sheets);
      toast.success("ดาวน์โหลด Excel แล้ว");
    } catch {
      toast.error("สร้างไฟล์ Excel ไม่สำเร็จ");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-normal tracking-widest">สรุปรายเดือน</h1>
          <p className="text-sm text-muted-foreground">นับตามวันที่ออกบิล · บิลยกเลิกไม่นับในยอดขาย</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="เดือนก่อน"
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
            className="grid size-11 place-items-center rounded-xl border border-border hover:bg-accent"
          >
            ‹
          </button>
          <span className="min-w-36 text-center text-lg" aria-live="polite">
            {monthLabel(month)}
          </span>
          <button
            type="button"
            aria-label="เดือนถัดไป"
            disabled={month >= thisMonth}
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
            className="grid size-11 place-items-center rounded-xl border border-border hover:bg-accent disabled:opacity-40"
          >
            ›
          </button>
          <button
            type="button"
            onClick={exportExcel}
            disabled={!s}
            className="min-h-11 rounded-xl bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            ดาวน์โหลด Excel
          </button>
        </div>
      </div>

      {isError && <p className="text-red-500">โหลดข้อมูลไม่สำเร็จ ลองใหม่อีกครั้ง</p>}
      {isLoading || !s ? (
        <p className="text-muted-foreground">กำลังโหลด…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label={`ยอดขาย (${s.totals.bills} บิล)`} value={money(s.totals.sales)} />
            <Stat label="ต้นทุน" value={money(s.totals.cost)} />
            <Stat label="กำไร" value={money(s.totals.profit)} tone="green" />
            <Stat label="ยังไม่ได้รับเงิน" value={money(s.totals.outstanding)} tone="amber" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-2xl border border-border/60 bg-background/40 p-4">
              <h2 className="mb-2 font-semibold">ตามสถานะ</h2>
              {(["paid", "pending", "credit", "canceled"] as const).map((k) => (
                <div key={k} className="flex items-center justify-between border-t border-dashed border-border/60 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <BillStatusBadge status={k} />
                    <span className="text-muted-foreground">{s.byStatus[k].count} บิล</span>
                  </span>
                  <b className={cn("font-semibold", k === "canceled" && "text-muted-foreground line-through")}>
                    {money(s.byStatus[k].total)}
                  </b>
                </div>
              ))}
              {s.overdue.count > 0 && (
                <div className="mt-2 rounded-xl border border-red-500/50 bg-red-500/10 p-2.5 text-sm text-red-700 dark:text-red-300">
                  เครดิตเลยกำหนด {s.overdue.count} บิล · {money(s.overdue.total)} บาท
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-blue-500/40 bg-blue-500/5 p-4">
              <h2 className="mb-2 flex justify-between font-semibold">
                <span>ต้องโอนให้แพ (ทั้งเดือน)</span>
                <span>{money(s.suppliers.reduce((a, r) => a + r.total, 0))}</span>
              </h2>
              {s.suppliers.length === 0 ? (
                <p className="text-sm text-muted-foreground">ยังไม่มีรายการที่ระบุแพในเดือนนี้</p>
              ) : (
                s.suppliers.map((r) => (
                  <div key={r.supplier} className="flex justify-between border-t border-dashed border-border/60 py-2 text-sm">
                    <span>
                      {r.supplier} <span className="text-xs text-muted-foreground">({r.count} รายการ)</span>
                    </span>
                    <b className="font-semibold">{money(r.total)}</b>
                  </div>
                ))
              )}
            </section>
          </div>

          <section className="rounded-2xl border border-border/60 bg-background/40 p-4">
            <h2 className="mb-2 font-semibold">บิลที่ยังไม่ได้รับเงิน ({owed.length})</h2>
            {owed.length === 0 ? (
              <p className="text-sm text-muted-foreground">รับเงินครบทุกบิลแล้ว</p>
            ) : (
              <ul className="divide-y divide-dashed divide-border/60">
                {owed
                  .slice()
                  .sort((a, b) => Number(isOverdue(b.status, b.dueDate)) - Number(isOverdue(a.status, a.dueDate)))
                  .map((b) => (
                    <li key={b._id}>
                      <Link
                        href={`/bill/${b._id}` as any}
                        className="flex min-h-12 items-center justify-between gap-3 py-2 text-sm hover:bg-accent/40"
                      >
                        <span className="min-w-0">
                          <span className="block truncate">{b.name_customer}</span>
                          <span className="text-xs text-muted-foreground">
                            {b.billNumber} · {thDay(b.date)}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <BillStatusBadge status={b.status} dueDate={b.dueDate} />
                          <b className="font-semibold">{money(b.total)}</b>
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
