"use client";

/**
 * ตั้งค่า > แพ็กเกจและการชำระเงิน
 * สถานะ Billdee + PostHub → เลือกแพ็กเกจ → สแกน QR (ล็อกยอด) → แนบสลิป → รออนุมัติ (เจ้าของกดในเทเลแกรม) → ใช้ได้ทันที
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import api from "@/hooks/axios";
import {
  type BillingStatus,
  type Cycle,
  type Product,
  baht,
  daysLeft,
  planLabel,
  POSTHUB_DOWNLOAD,
  POSTHUB_VERSION,
  thaiDate,
  useBillingStatus,
} from "@/lib/billing";
import { bankLogoUrl } from "@/lib/chat-bill";
import { cn } from "@/lib/utils";

const PACKS: { key: Product; name: string; desc: string }[] = [
  { key: "billdee", name: "Billdee Pro", desc: "ออกบิลไม่จำกัด · สรุปรายเดือน · Excel" },
  { key: "posthub", name: "Billdee PostHub", desc: "ส่วนขยายโพสต์สินค้าเข้ากลุ่มแชท · 2 เครื่อง" },
  { key: "bundle", name: "รวมชุด Pro + PostHub", desc: "ได้ทั้งสองอย่างในราคาพิเศษ" },
];

const card = "rounded-2xl border border-border/60 bg-background/40 p-4";
const btn = "min-h-11 rounded-xl border px-4 text-base transition active:scale-95 disabled:opacity-50 disabled:active:scale-100";
const primary = cn(btn, "border-blue-600 bg-blue-600 font-semibold text-white hover:bg-blue-700");
const plain = cn(btn, "border-border bg-background hover:bg-accent");

function BilldeeCard({ s }: { s: BillingStatus }) {
  const b = s.billdee;
  return (
    <div className={card}>
      <p className="text-sm text-muted-foreground">Billdee (ออกบิล)</p>
      {b.plan === "pro" ? (
        <>
          <p className="mt-1 text-xl font-semibold text-green-600 dark:text-green-400">Pro</p>
          <p className="text-sm text-muted-foreground">
            ถึง {thaiDate(b.expDate)} · เหลือ {daysLeft(b.expDate)} วัน
          </p>
        </>
      ) : (
        <>
          <p className="mt-1 text-xl font-semibold">Free</p>
          <p className={cn("text-sm", b.usedThisMonth >= b.freeLimit ? "text-red-500" : "text-amber-600 dark:text-amber-400")}>
            {b.unlimited ? "แอดมิน — ไม่จำกัด" : `ใช้ไป ${b.usedThisMonth}/${b.freeLimit} บิลเดือนนี้`}
          </p>
        </>
      )}
    </div>
  );
}

function PosthubCard({ s, onTrial, trialing }: { s: BillingStatus; onTrial: () => void; trialing: boolean }) {
  const p = s.posthub;
  const line: Record<string, React.ReactNode> = {
    none: <span className="text-muted-foreground">ยังไม่ได้ใช้</span>,
    trial: <span className="text-amber-600 dark:text-amber-400">ทดลองใช้ เหลือ {daysLeft(p.expiresAt)} วัน</span>,
    active: <span className="text-green-600 dark:text-green-400">ใช้งาน ถึง {thaiDate(p.expiresAt)}</span>,
    expired: <span className="text-red-500">หมดอายุ {thaiDate(p.expiresAt)}</span>,
    forever: <span className="text-green-600 dark:text-green-400">ตลอดชีพ</span>,
    revoked: <span className="text-red-500">ถูกระงับ — ติดต่อผู้ขาย</span>,
    waiting: <span className="text-muted-foreground">ซื้อแล้ว — เริ่มนับเมื่อล็อกอินครั้งแรก</span>,
    unknown: <span className="text-muted-foreground">เช็กสถานะไม่ได้ตอนนี้</span>,
  };
  return (
    <div className={card}>
      <p className="text-sm text-muted-foreground">Billdee PostHub (ส่วนขยาย Chrome)</p>
      <p className="mt-1 text-xl font-semibold">{line[p.state]}</p>
      {["trial", "active", "forever"].includes(p.state) && (
        <p className="text-sm text-muted-foreground">
          {p.devices} / {p.maxDevices} เครื่อง
        </p>
      )}
      {p.trialAvailable && (
        <button type="button" className={cn(plain, "mt-2 min-h-10 text-sm")} disabled={trialing} onClick={onTrial}>
          {trialing ? "กำลังเปิด…" : "🎁 ทดลองฟรี 7 วัน"}
        </button>
      )}
      <a
        href={POSTHUB_DOWNLOAD}
        download
        className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        ⬇️ ดาวน์โหลด PostHub v{POSTHUB_VERSION}
      </a>
      <details className="mt-2 rounded-xl border border-border px-3 py-2 text-sm">
        <summary className="min-h-9 cursor-pointer py-1 font-medium">วิธีติดตั้ง (ใช้บนคอม ผ่าน Google Chrome)</summary>
        <ol className="mt-1 list-decimal space-y-1.5 pl-5 text-muted-foreground">
          <li>ดาวน์โหลดไฟล์ แล้วคลิกขวา › <b className="text-foreground">แตกไฟล์ทั้งหมด</b> (เก็บโฟลเดอร์ไว้ที่เดิม ห้ามลบ)</li>
          <li>
            เปิด Chrome พิมพ์ <code className="rounded bg-muted px-1 text-foreground">chrome://extensions</code> แล้วเปิด{" "}
            <b className="text-foreground">โหมดนักพัฒนาซอฟต์แวร์</b> มุมขวาบน
          </li>
          <li>
            กด <b className="text-foreground">โหลดส่วนขยายที่คลายการแพ็ก</b> แล้วเลือกโฟลเดอร์ที่แตกไว้
          </li>
          <li>กดไอคอน PostHub › เข้าสู่ระบบด้วย Google บัญชีเดียวกับเว็บนี้ ครั้งแรกทดลองฟรี 7 วัน</li>
        </ol>
        <p className="mt-2 text-xs text-muted-foreground">
          อัปเดตเวอร์ชันใหม่: แตกไฟล์ทับโฟลเดอร์เดิม แล้วกดปุ่มรีโหลด ↻ ที่การ์ด PostHub ในหน้า chrome://extensions
        </p>
      </details>
      <p className="mt-2 text-xs text-muted-foreground">ล็อกอินส่วนขยายด้วย Google บัญชี {s.email}</p>
    </div>
  );
}

export default function SubscriptionInfo() {
  const qc = useQueryClient();
  const { data: s, isLoading, isError } = useBillingStatus();
  const [cycle, setCycle] = useState<Cycle>("year");
  const [pack, setPack] = useState<Product>("bundle");
  const [step, setStep] = useState<"choose" | "pay">("choose");
  const [slip, setSlip] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const prevPending = useRef<string | null>(null);

  // อนุมัติ/ปฏิเสธในเทเลแกรม → หน้านี้รู้เอง
  useEffect(() => {
    if (!s) return;
    const was = prevPending.current;
    prevPending.current = s.pending?.id ?? null;
    if (was && !s.pending && s.lastDecided?.id === was) {
      if (s.lastDecided.status === "approved") {
        toast.success("เปิดใช้งานแล้ว 🎉");
        qc.invalidateQueries({ queryKey: ["subscription"] });
      } else toast.error(`ไม่ผ่าน: ${s.lastDecided.rejectReason ?? ""}`);
    }
  }, [s, qc]);

  useEffect(() => {
    if (!slip) return setPreview("");
    const u = URL.createObjectURL(slip);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [slip]);

  const qr = useQuery<{ qr: string; amount: number }>({
    queryKey: ["billing-qr", pack, cycle],
    queryFn: async () => (await api.get(`/billing/qr?product=${pack}&cycle=${cycle}`)).data.data,
    enabled: step === "pay" && !!s?.payTo.promptPay,
    staleTime: Infinity,
  });

  const trial = useMutation({
    mutationFn: async () => (await api.post("/billing/posthub/trial")).data,
    onSuccess: () => {
      toast.success("เปิดทดลอง PostHub 7 วันแล้ว — กดดาวน์โหลดด้านล่าง ติดตั้งแล้วล็อกอินด้วย Google ได้เลย");
      qc.invalidateQueries({ queryKey: ["billing-status"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "เปิดทดลองไม่สำเร็จ"),
  });

  const pay = useMutation({
    mutationFn: async () => {
      const f = new FormData();
      f.set("product", pack);
      f.set("cycle", cycle);
      f.set("slip", slip as File);
      return (await api.post("/billing/payments", f, { headers: { "Content-Type": "multipart/form-data" }, timeout: 60_000 })).data;
    },
    onSuccess: () => {
      toast.success("ส่งสลิปแล้ว — รออนุมัติ");
      setSlip(null);
      setStep("choose");
      qc.invalidateQueries({ queryKey: ["billing-status"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "ส่งสลิปไม่สำเร็จ"),
  });

  if (isLoading) return <p className="p-6 text-muted-foreground">กำลังโหลด…</p>;
  if (isError || !s) return <p className="p-6 text-red-500">โหลดข้อมูลแพ็กเกจไม่สำเร็จ ลองรีเฟรช</p>;

  const posthubForever = s.posthub.state === "forever";
  const packs = posthubForever ? PACKS.filter((p) => p.key === "billdee") : PACKS;
  const chosen = posthubForever ? "billdee" : pack;
  const price = s.prices[chosen][cycle];
  const canPay = s.payTo.ready && s.telegramReady;
  const decided = !s.pending ? s.lastDecided : null;

  return (
    <div className="mt-4 flex w-full flex-col gap-5 rounded-2xl border border-border/50 bg-white px-5 py-6 shadow-xl dark:bg-zinc-900 md:px-7">
      <div>
        <h2 className="text-xl font-normal tracking-widest">แพ็กเกจและการชำระเงิน</h2>
        <p className="text-sm text-muted-foreground">บัญชี {s.email}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <BilldeeCard s={s} />
        <PosthubCard s={s} onTrial={() => trial.mutate()} trialing={trial.isPending} />
      </div>

      {s.pending && (
        <div className="rounded-2xl border border-amber-500/50 bg-amber-500/10 p-4 leading-relaxed" data-testid="pending">
          ⏳ <b>ได้รับสลิปแล้ว — รออนุมัติ</b>
          <br />
          {planLabel(s.pending.product, s.pending.cycle)} · {baht(s.pending.amount)} บาท
          <br />
          <span className="text-sm text-muted-foreground">อนุมัติแล้วใช้งานได้ทันที หน้านี้จะเปลี่ยนเอง ไม่ต้องรีเฟรช</span>
        </div>
      )}

      {decided?.status === "approved" && (
        <div className="rounded-2xl border border-green-600/50 bg-green-600/10 p-4 leading-relaxed" data-testid="approved">
          ✅ <b>เปิดใช้งานแล้ว</b> — {planLabel(decided.product, decided.cycle)}
          {decided.billdeeExpDate && <> · Billdee ถึง {thaiDate(decided.billdeeExpDate)}</>}
          {decided.posthubExpDate && <> · PostHub ถึง {thaiDate(decided.posthubExpDate)}</>}
        </div>
      )}
      {decided?.status === "rejected" && (
        <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-4 leading-relaxed" data-testid="rejected">
          ❌ <b>สลิปล่าสุดไม่ผ่าน</b> — {decided.rejectReason}
          <br />
          <span className="text-sm text-muted-foreground">ตรวจสอบแล้วแนบสลิปใหม่ได้ด้านล่าง</span>
        </div>
      )}

      {!s.pending && step === "choose" && (
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-normal tracking-widest">เลือกแพ็กเกจ</h3>
            <div className="inline-flex rounded-xl border p-1" role="tablist">
              {(["month", "year"] as Cycle[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={cycle === c}
                  className={cn("rounded-lg px-4 py-1.5 text-sm", cycle === c ? "bg-accent font-semibold" : "text-muted-foreground")}
                  onClick={() => setCycle(c)}
                >
                  {c === "month" ? "รายเดือน" : "รายปี (ประหยัดกว่า)"}
                </button>
              ))}
            </div>
          </div>
          <div className={cn("grid gap-3", packs.length > 1 && "md:grid-cols-3")}>
            {packs.map((p) => {
              const on = chosen === p.key;
              const save = s.prices.billdee[cycle] + s.prices.posthub[cycle] - s.prices.bundle[cycle];
              return (
                <button
                  key={p.key}
                  type="button"
                  data-pack={p.key}
                  onClick={() => setPack(p.key)}
                  className={cn(
                    "relative rounded-2xl border p-4 text-left transition",
                    on ? "border-blue-600 bg-blue-600/10 ring-1 ring-blue-600" : "border-border hover:bg-accent/50",
                  )}
                >
                  {p.key === "bundle" && (
                    <span className="absolute -top-2.5 right-3 rounded-full bg-green-600 px-2 py-0.5 text-xs text-white">คุ้มสุด</span>
                  )}
                  <span className="block font-semibold">{p.name}</span>
                  <span className="block text-sm text-muted-foreground">
                    {p.desc}
                    {p.key === "bundle" && save > 0 && ` · ประหยัด ${baht(save)} บาท/${cycle === "month" ? "เดือน" : "ปี"}`}
                  </span>
                  <span className="mt-2 block text-2xl font-bold">
                    {baht(s.prices[p.key][cycle])} <span className="text-sm font-normal text-muted-foreground">บาท/{cycle === "month" ? "เดือน" : "ปี"}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground">ต่ออายุก่อนหมด = นับต่อจากวันหมดเดิม ไม่เสียวัน</p>
          {canPay ? (
            <button type="button" className={cn(primary, "self-start")} onClick={() => setStep("pay")}>
              ไปชำระเงิน →
            </button>
          ) : (
            <p className="rounded-xl bg-muted p-3 text-sm">ระบบชำระเงินออนไลน์ยังไม่เปิด — ติดต่อผู้ขายเพื่อสมัคร</p>
          )}
        </section>
      )}

      {!s.pending && step === "pay" && (
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-normal tracking-widest">
            {s.payTo.promptPay ? "สแกนจ่าย" : "โอนเงิน"} <b>{baht(price)} บาท</b> — {planLabel(chosen, cycle)}
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            {s.payTo.promptPay &&
              (qr.data ? (
                // biome-ignore lint/performance/noImgElement: QR เป็น data URL
                <img src={qr.data.qr} alt="QR พร้อมเพย์" className="size-44 rounded-lg bg-white p-1" />
              ) : (
                <div className="grid size-44 place-items-center rounded-lg bg-muted text-sm text-muted-foreground">
                  {qr.isError ? "สร้าง QR ไม่ได้" : "กำลังสร้าง QR…"}
                </div>
              ))}
            <div className="flex flex-col gap-2 text-sm leading-7" data-testid="pay-to">
              {s.payTo.promptPay && (
                <span>
                  พร้อมเพย์ <b>{s.payTo.promptPay}</b> · <span className="text-muted-foreground">QR ล็อกยอดไว้แล้ว</span>
                </span>
              )}
              {s.payTo.accountNo && (
                <div className="flex items-center gap-3 rounded-xl border border-border/60 p-3">
                  {bankLogoUrl(s.payTo.bankName) && (
                    // biome-ignore lint/performance/noImgElement: โลโก้ธนาคารในเว็บ
                    <img src={bankLogoUrl(s.payTo.bankName) as string} alt="" className="size-10 rounded-full" />
                  )}
                  <div className="leading-6">
                    <span className="text-muted-foreground">{s.payTo.bankName}</span>
                    <br />
                    <b className="text-lg tracking-wide">{s.payTo.accountNo}</b>{" "}
                    <button
                      type="button"
                      className="ml-1 rounded-lg border px-2 text-xs"
                      onClick={() =>
                        navigator.clipboard
                          .writeText(s.payTo.accountNo.replace(/\D/g, ""))
                          .then(() => toast.success("คัดลอกเลขบัญชีแล้ว"))
                          .catch(() => toast.error("คัดลอกไม่ได้"))
                      }
                    >
                      คัดลอก
                    </button>
                  </div>
                </div>
              )}
              {s.payTo.accountName && <span>ชื่อบัญชี {s.payTo.accountName}</span>}
              <span className="font-semibold">ยอดโอน {baht(price)} บาท (โอนให้ตรงยอด)</span>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            data-testid="slip-input"
            onChange={(e) => setSlip(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-4 text-sm text-muted-foreground hover:bg-accent/40"
          >
            {preview ? (
              // biome-ignore lint/performance/noImgElement: ตัวอย่างรูปในเครื่อง
              <img src={preview} alt="สลิปที่เลือก" className="max-h-56 rounded-lg" />
            ) : (
              "📎 แตะเพื่อแนบรูปสลิป"
            )}
            {slip && <span>{slip.name} · แตะเพื่อเปลี่ยน</span>}
          </button>

          <div className="flex flex-wrap gap-2">
            <button type="button" className={plain} onClick={() => setStep("choose")}>
              ← เปลี่ยนแพ็กเกจ
            </button>
            <button type="button" className={primary} disabled={!slip || pay.isPending} onClick={() => pay.mutate()}>
              {pay.isPending ? "กำลังส่ง…" : "ส่งสลิป"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
