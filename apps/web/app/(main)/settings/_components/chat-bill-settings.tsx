"use client";

/**
 * ตั้งค่า > รูปแบบบิลส่งแชท — รูปบิลและข้อความที่ใช้ตอน ส่งรูปบิล / ส่งข้อความ / คัดลอก
 * ค่าที่มีอยู่แล้ว (สีธีม/ข้อความท้ายบิลของ PDF, เบอร์โทร, บัญชีธนาคาร) ดึงมาใช้ ไม่ต้องกรอกซ้ำ
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import api from "@/hooks/axios";
import { authClient } from "@/lib/auth-client";
import { renderBillImage } from "@/lib/bill-image";
import {
  bankLogoUrl,
  type ChatBillSettings,
  DEFAULT_CHAT_SETTINGS,
  resolveChatSettings,
  useBillTemplate,
} from "@/lib/chat-bill";
import { cn } from "@/lib/utils";
import { customerBillText } from "../../bill/_components/customer-copy";

const SAMPLE_BILL = {
  billNumber: "RE0000001",
  date: new Date().toISOString(),
  name_customer: "ลูกค้าตัวอย่าง",
  products: [
    { name: "กุ้งขาว 50/55", quantity: 2.5, price: 320, total: 800 },
    { name: "ดองซีอิ๊ว กระปุก", quantity: 3, price: 120, total: 360 },
  ],
  total: 1160,
};

function From() {
  return (
    <span className="ml-1.5 rounded-md border border-green-600/50 bg-green-600/10 px-1.5 py-px text-xs text-green-700 dark:text-green-300">
      ใช้ของเดิม
    </span>
  );
}

function Row({
  label,
  hint,
  from,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  from?: boolean;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 py-1.5 text-sm">
      <span>
        {label}
        {from && <From />}
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <Switch checked={checked} onCheckedChange={(v: boolean) => onChange(!!v)} />
    </label>
  );
}

function Group({ title, extra, children }: { title: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-border/60 px-4 pb-3 pt-1">
      <legend className="px-1.5 text-sm font-semibold">
        {title} {extra}
      </legend>
      {children}
    </fieldset>
  );
}

export default function ChatBillSettingsForm() {
  const queryClient = useQueryClient();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const shop = activeOrg as any;
  const { data: template, isFetched } = useBillTemplate(activeOrg?.id);
  const [s, setS] = useState<ChatBillSettings>(DEFAULT_CHAT_SETTINGS);
  const [view, setView] = useState<"both" | "img" | "txt">("both");
  const [imgUrl, setImgUrl] = useState("");

  useEffect(() => {
    if (isFetched) setS({ ...DEFAULT_CHAT_SETTINGS, ...(template?.chat ?? {}) });
  }, [isFetched, template]);
  const set = <K extends keyof ChatBillSettings>(k: K, v: ChatBillSettings[K]) => setS((cur) => ({ ...cur, [k]: v }));

  // บิลล่าสุดของร้าน ใช้เป็นตัวอย่าง (QR พร้อมเพย์ต้องมีบิลจริง) · ไม่มีบิล = บิลตัวอย่าง
  const { data: latest } = useQuery<any>({
    queryKey: ["bills-latest", activeOrg?.id],
    queryFn: async () => (await api.get(`/bills?page=1&pageSize=1&search=&organizationId=${activeOrg?.id}`)).data,
    enabled: !!activeOrg?.id,
  });
  const sample = latest?.rows?.[0] ?? SAMPLE_BILL;
  const resolved = useMemo(() => resolveChatSettings({ ...(template ?? {}), chat: s }), [template, s]);
  const text = customerBillText(sample, shop, resolved);

  const previewKey = JSON.stringify([resolved, sample?._id, shop?.name, shop?.bank_name, shop?.prompt_pay]);
  useEffect(() => {
    if (!shop) return;
    let url = "";
    let cancelled = false;
    const t = setTimeout(async () => {
      const qrDataUrl =
        resolved.showQr && shop.prompt_pay && sample?._id
          ? await api.get(`/report/promptpay-qr/${sample._id}`).then((r) => r.data?.data ?? null).catch(() => null)
          : null;
      const blob = await renderBillImage(sample, shop, {
        headerColor: resolved.color,
        footerText: resolved.footer,
        showPhone: resolved.showPhone,
        showUnit: resolved.showUnit,
        showBank: resolved.showBank,
        showAccountNo: resolved.showAccountNo,
        showAccountName: resolved.showAccountName,
        showPromptPay: resolved.showPromptPay,
        totalLabel: resolved.totalLabel,
        bankLogoUrl: resolved.showBankLogo ? bankLogoUrl(shop.bank_name) : null,
        qrDataUrl,
      }).catch(() => null);
      if (!blob || cancelled) return;
      url = URL.createObjectURL(blob);
      setImgUrl(url);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewKey, !!shop]);

  const save = useMutation({
    mutationFn: async (chat: ChatBillSettings) =>
      (await api.patch("/bill-template/chat", { organizationId: activeOrg?.id, chat })).data,
    onSuccess: () => {
      toast.success("บันทึกรูปแบบบิลส่งแชทแล้ว");
      queryClient.invalidateQueries({ queryKey: ["bill-template"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "บันทึกไม่สำเร็จ"),
  });

  return (
    <div className="mt-4 grid gap-5 lg:grid-cols-2">
      <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-white p-5 shadow-xl dark:bg-zinc-900">
        <div>
          <h2 className="text-xl font-normal tracking-widest">รูปแบบบิลส่งแชท</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            รูปบิลและข้อความที่ใช้ตอนกด "ส่งรูปบิล / ส่งข้อความ / คัดลอก" หลังสร้างบิล — ใบเสร็จ PDF ตั้งแยกที่แท็บ "รูปแบบบิล" เหมือนเดิม
          </p>
        </div>

        <Group title="หัวบิล">
          <Row label="ใช้สีเดียวกับใบเสร็จ PDF" hint='สีธีมจากแท็บ "รูปแบบบิล"' from checked={s.useThemeColor} onChange={(v) => set("useThemeColor", v)} />
          {!s.useThemeColor && (
            <label className="flex min-h-11 items-center justify-between gap-3 py-1.5 text-sm">
              สีหัวบิล
              <input
                type="color"
                value={s.headerColor}
                onChange={(e) => set("headerColor", e.target.value)}
                className="h-9 w-12 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
              />
            </label>
          )}
          <Row label="แสดงเบอร์โทรร้าน" from checked={s.showPhone} onChange={(v) => set("showPhone", v)} />
        </Group>

        <Group title="รายการสินค้า">
          <Row label="แสดงจำนวน × ราคาต่อหน่วย" hint="ปิด = แสดงแค่ชื่อสินค้ากับยอด" checked={s.showUnit} onChange={(v) => set("showUnit", v)} />
        </Group>

        <Group
          title="ช่องทางรับเงิน"
          extra={
            <Link href={"/settings?tab=shop-info" as any} className="ml-1 text-xs font-normal text-blue-600 dark:text-blue-300">
              แก้เลขบัญชีที่ ข้อมูลร้านค้า →
            </Link>
          }
        >
          <Row label="ธนาคาร" from checked={s.showBank} onChange={(v) => set("showBank", v)} />
          <Row label="โลโก้ธนาคาร" hint="ชุดเดียวกับใบเสร็จ PDF (16 ธนาคาร)" checked={s.showBankLogo} onChange={(v) => set("showBankLogo", v)} />
          <Row label="เลขบัญชี" checked={s.showAccountNo} onChange={(v) => set("showAccountNo", v)} />
          <Row label="ชื่อบัญชี" checked={s.showAccountName} onChange={(v) => set("showAccountName", v)} />
          <Row label="พร้อมเพย์ (ตัวเลข)" checked={s.showPromptPay} onChange={(v) => set("showPromptPay", v)} />
          <Row
            label="QR พร้อมเพย์ในรูปบิล"
            hint={shop?.prompt_pay ? "ลูกค้าสแกนจ่ายได้เลย ยอดตรงบิล" : "ต้องใส่พร้อมเพย์ที่ ข้อมูลร้านค้า ก่อน"}
            checked={s.showQr}
            onChange={(v) => set("showQr", v)}
          />
        </Group>

        <Group title="ข้อความท้ายบิล">
          <Row label="ใช้ข้อความเดียวกับใบเสร็จ PDF" hint="ข้อความเดิมยาว เหมาะกับกระดาษ" from checked={s.useFooterFromPdf} onChange={(v) => set("useFooterFromPdf", v)} />
          <textarea
            value={s.footerText}
            disabled={s.useFooterFromPdf}
            maxLength={500}
            onChange={(e) => set("footerText", e.target.value)}
            className="mb-1 min-h-20 w-full rounded-xl border border-border bg-background p-3 text-sm disabled:opacity-50"
            placeholder="เช่น ขอบคุณที่อุดหนุนครับ 🙏"
          />
        </Group>

        <Group title="ข้อความ (ตอนกด ส่งข้อความ / คัดลอกข้อความ)">
          <label className="flex min-h-11 items-center justify-between gap-3 py-1.5 text-sm">
            คำนำหน้ายอด
            <input
              value={s.totalLabel}
              maxLength={30}
              onChange={(e) => set("totalLabel", e.target.value)}
              className="h-10 w-36 rounded-lg border border-border bg-background px-3 text-sm"
            />
          </label>
          <Row label="เน้นบรรทัดยอดด้วย ***" checked={s.starTotal} onChange={(v) => set("starTotal", v)} />
          <Row label="ใส่ข้อความท้ายบิลในข้อความด้วย" checked={s.footerInText} onChange={(v) => set("footerInText", v)} />
        </Group>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={!activeOrg?.id || save.isPending || !s.totalLabel.trim()}
            onClick={() => save.mutate({ ...s, totalLabel: s.totalLabel.trim() || "รวมโอน" })}
            className="min-h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {save.isPending ? "กำลังบันทึก…" : "บันทึก"}
          </button>
          <button
            type="button"
            onClick={() => setS(DEFAULT_CHAT_SETTINGS)}
            className="min-h-11 rounded-xl border border-border px-5 text-sm hover:bg-accent"
          >
            คืนค่าเริ่มต้น
          </button>
        </div>
      </div>

      <div className="flex h-fit flex-col gap-4 rounded-2xl border border-border/50 bg-white p-5 shadow-xl lg:sticky lg:top-8 dark:bg-zinc-900">
        <div>
          <h2 className="text-xl font-normal tracking-widest">ตัวอย่าง</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {latest?.rows?.[0] ? `ใช้บิลล่าสุดของร้าน (${sample.billNumber})` : "ใช้บิลตัวอย่าง"} · ยังไม่บันทึกก็เห็นผลทันที
          </p>
        </div>
        <div className="flex rounded-xl border border-border p-1" role="tablist">
          {(
            [
              ["both", "ทั้งสองแบบ"],
              ["img", "รูปบิล"],
              ["txt", "ข้อความ"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cn("min-h-9 flex-1 rounded-lg text-sm", view === v ? "bg-accent" : "text-muted-foreground")}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-start gap-4">
          {view !== "txt" &&
            (imgUrl ? (
              // biome-ignore lint/performance/noImgElement: รูปจาก blob ในเครื่อง
              <img src={imgUrl} alt="ตัวอย่างรูปบิล" className="w-full max-w-[300px] rounded-md shadow-lg" />
            ) : (
              <div className="grid h-72 w-[300px] place-items-center rounded-md bg-muted text-sm text-muted-foreground">
                กำลังสร้างตัวอย่าง…
              </div>
            ))}
          {view !== "img" && (
            <pre className="min-w-60 flex-1 whitespace-pre-wrap rounded-xl border border-border/60 bg-background/40 p-3 font-sans text-sm leading-relaxed">
              {text}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
