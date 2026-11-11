"use client";

/**
 * หน้า "บิลเสร็จแล้ว" — เด้งขึ้นหลังกดสร้างบิล
 * รูปบิลสำหรับแชท + ส่งรูป / ส่งข้อความ (เมนูแชร์ของมือถือ ทีละอย่าง) + คัดลอก / บันทึก / พิมพ์ PDF
 */
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import api from "@/hooks/axios";
import { authClient } from "@/lib/auth-client";
import { renderBillImage } from "@/lib/bill-image";
import { saveBlob } from "@/lib/receipt-image";
import { cn } from "@/lib/utils";
import { customerBillText } from "./customer-copy";
import { StatusMenu } from "./status";

const money = (n: number) => (n || 0).toLocaleString("th-TH", { maximumFractionDigits: 2 });

export default function BillDone({ id }: { id: string }) {
  const { data: activeOrg } = authClient.useActiveOrganization();
  const shop = activeOrg as any;
  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ["bill", id],
    queryFn: async () => (await api.get(`/bills/${id}`)).data,
    enabled: !!id,
  });
  const bill = data?.data;

  const [blob, setBlob] = useState<Blob | null>(null);
  const [imgUrl, setImgUrl] = useState<string>("");
  const [canShareFiles, setCanShareFiles] = useState(false);
  const [canShareText, setCanShareText] = useState(false);

  // รูปบิล: วาดใหม่เมื่อข้อมูลบิล/ร้านพร้อม (สถานะเปลี่ยนไม่ต้องวาดใหม่)
  const imageKey = bill ? JSON.stringify([bill.products, bill.total, bill.discount, bill.vat, shop?.name, shop?.account_no]) : "";
  useEffect(() => {
    if (!bill || !shop) return;
    let url = "";
    let cancelled = false;
    renderBillImage(bill, shop)
      .then((b) => {
        if (cancelled) return;
        setBlob(b);
        url = URL.createObjectURL(b);
        setImgUrl(url);
        const file = new File([b], `${bill.billNumber || "bill"}.png`, { type: "image/png" });
        setCanShareFiles(!!navigator.canShare?.({ files: [file] }));
        setCanShareText(typeof navigator.share === "function");
      })
      .catch(() => toast.error("สร้างรูปบิลไม่สำเร็จ"));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageKey, !!shop]);

  const text = useMemo(() => (bill ? customerBillText(bill, shop) : ""), [bill, shop]);
  const fileName = `${bill?.billNumber || "bill"}.png`;

  const shareImage = async () => {
    if (!blob) return;
    try {
      await navigator.share({ files: [new File([blob], fileName, { type: "image/png" })] });
    } catch (e: any) {
      if (e?.name !== "AbortError") toast.error("ส่งรูปไม่สำเร็จ — ลองคัดลอกหรือบันทึกรูปแทน");
    }
  };
  const shareText = async () => {
    try {
      await navigator.share({ text });
    } catch (e: any) {
      if (e?.name !== "AbortError") toast.error("ส่งข้อความไม่สำเร็จ — ลองคัดลอกข้อความแทน");
    }
  };
  const copyImage = async () => {
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast.success("คัดลอกรูปบิลแล้ว — วางในแชทได้เลย");
    } catch {
      toast.error("เครื่องนี้คัดลอกรูปไม่ได้ — ใช้บันทึกรูปแทน");
    }
  };
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("คัดลอกข้อความแล้ว — วางในแชทได้เลย");
    } catch {
      toast.error("คัดลอกไม่ได้");
    }
  };

  if (isError) return <p className="p-4 text-red-500">ไม่พบบิลนี้</p>;
  if (isLoading || !bill) return <p className="p-4 text-muted-foreground">กำลังโหลด…</p>;

  const btn = "min-h-12 rounded-2xl border px-4 text-base transition active:scale-95 disabled:opacity-50";
  const primary = cn(btn, "border-green-600 bg-green-600 font-semibold text-white hover:bg-green-700");
  const secondary = cn(btn, "border-green-600 bg-green-600/10 font-semibold text-green-700 dark:text-green-300");
  const plain = cn(btn, "border-border bg-background hover:bg-accent");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-normal tracking-widest">บิลเสร็จแล้ว</h1>
        <div className="hidden gap-2 md:flex">
          <Link href="/bill/create" className={cn(plain, "inline-flex items-center text-sm")}>
            + สร้างบิลใหม่
          </Link>
          <Link href="/bill" className={cn(plain, "inline-flex items-center text-sm")}>
            ไปหน้ารายการบิล
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <div className="order-2 md:order-1 md:w-[380px] md:shrink-0">
          {imgUrl ? (
            // biome-ignore lint/performance/noImgElement: รูปจาก blob ในเครื่อง
            <img
              src={imgUrl}
              alt={`รูปบิล ${bill.billNumber}`}
              className="mx-auto w-full max-w-[380px] rounded-md shadow-xl"
            />
          ) : (
            <div className="grid h-80 place-items-center rounded-md bg-muted text-sm text-muted-foreground">
              กำลังสร้างรูปบิล…
            </div>
          )}
        </div>

        <div className="order-1 flex flex-1 flex-col gap-4 md:order-2">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-green-600 text-xl text-white">✓</span>
            <div className="min-w-0">
              <b className="block truncate text-lg">
                {bill.billNumber} · {bill.name_customer}
              </b>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                {money(bill.total)} บาท ·
                <StatusMenu bill={bill} organizationId={activeOrg?.id} />
              </span>
            </div>
          </div>

          <div className="grid max-w-md grid-cols-2 gap-2.5">
            {canShareFiles && (
              <button type="button" className={primary} disabled={!blob} onClick={shareImage}>
                ส่งรูปบิล
              </button>
            )}
            {canShareText && (
              <button type="button" className={secondary} onClick={shareText}>
                ส่งข้อความ
              </button>
            )}
            <button type="button" className={canShareFiles ? plain : primary} disabled={!blob} onClick={copyImage}>
              คัดลอกรูป
            </button>
            <button type="button" className={canShareText ? plain : secondary} onClick={copyText}>
              คัดลอกข้อความ
            </button>
            <button type="button" className={plain} disabled={!blob} onClick={() => blob && saveBlob(blob, fileName)}>
              บันทึกรูป
            </button>
            <button
              type="button"
              className={plain}
              onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/report/receipt/${id}`, "_blank")}
            >
              พิมพ์ / PDF
            </button>
          </div>

          <div className="hidden max-w-md whitespace-pre-line rounded-2xl border border-border/60 bg-background/40 p-3.5 text-sm leading-relaxed md:block">
            <span className="text-xs text-muted-foreground">ข้อความที่จะคัดลอก</span>
            {"\n"}
            {text}
          </div>

          <div className="flex max-w-md justify-between text-base md:hidden">
            <Link href="/bill/create" className="min-h-11 py-2 text-blue-600 dark:text-blue-300">
              + สร้างบิลใหม่
            </Link>
            <Link href="/bill" className="min-h-11 py-2 text-blue-600 dark:text-blue-300">
              ไปหน้ารายการบิล →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
