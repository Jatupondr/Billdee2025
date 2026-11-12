"use client";

/**
 * ผู้ใช้ใหม่ที่ยังไม่มีร้าน: ยินดีต้อนรับ → ตั้งค่าร้าน 4 ขั้น → ร้านพร้อมแล้ว
 * ขั้น 1 สร้างร้านทันที (ข้อมูลไม่หายถ้าออกกลางทาง) · ขั้น 2–4 อัปเดตร้านที่สร้างแล้ว
 */
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  FileTextIcon,
  ImageIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import api from "@/hooks/axios";
import { authClient } from "@/lib/auth-client";
import { bankLogoUrl, DEFAULT_CHAT_SETTINGS } from "@/lib/chat-bill";
import { cn } from "@/lib/utils";
import { THAI_BANKS } from "../../(main)/settings/_components/thbank";

const POPULAR = ["KBANK", "SCB", "BBL", "KTB", "BAY", "TTB", "GSB"];
const SHORT: Record<string, string> = {
  KBANK: "กสิกร",
  SCB: "ไทยพาณิชย์",
  BBL: "กรุงเทพ",
  KTB: "กรุงไทย",
  BAY: "กรุงศรี",
  TTB: "ทีทีบี",
  GSB: "ออมสิน",
};
const COLORS = [
  ["น้ำเงิน", "#2563eb"],
  ["เขียว", "#1aa356"],
  ["ชมพู", "#e0337a"],
  ["ส้ม", "#f97316"],
  ["ม่วง", "#7c3aed"],
  ["กรมท่า", "#121a33"],
] as const;
const STEPS = [
  { title: "ตั้งชื่อร้านของคุณ", sub: "รูปโลโก้ · ชื่อร้าน · เบอร์โทร", short: "ร้าน" },
  { title: "บัญชีและการเงิน", sub: "เลขบัญชี · ธนาคาร · พร้อมเพย์", short: "การเงิน" },
  { title: "ที่อยู่ร้าน", sub: "เลขผู้เสียภาษี · ที่อยู่ (ข้ามได้)", short: "ที่อยู่" },
  { title: "ออกแบบบิล", sub: "สีหัวบิล · ข้อความท้ายบิล", short: "บิล" },
];

const slugify = () => `store-${Math.random().toString(36).substring(2, 8)}-${Date.now().toString(36)}`;
const digits = (s: string) => s.replace(/\D/g, "");

const inputCls =
  "h-[54px] w-full rounded-[14px] border-[1.5px] border-[#2a3561] bg-[#0a1128] px-4 text-[16px] text-white outline-none placeholder:text-[#6b7699] focus:border-[#3b5bff] focus:shadow-[0_0_0_4px_rgba(59,91,255,0.18)]";
const labelCls = "text-[15px] font-semibold text-[#dfe6ff]";

function Field({ label, htmlFor, req, hint, children }: { label: string; htmlFor?: string; req?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className={labelCls}>
        {label} {req && <span className="text-[#ff9b8a]">*</span>}
        {hint && <span className="font-normal text-[#8b96bd]"> {hint}</span>}
      </label>
      {children}
    </div>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: orgs, isPending: orgsPending } = authClient.useListOrganizations();
  const [view, setView] = useState<"welcome" | "steps" | "done">("welcome");
  const [step, setStep] = useState(1);
  const [doneUpTo, setDoneUpTo] = useState(0);
  const [busy, setBusy] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);

  // ร้านมีอยู่แล้ว (ไม่ได้อยู่กลางขั้นตอน) → หน้าหลัก
  useEffect(() => {
    if (!orgsPending && orgs && orgs.length > 0 && view === "welcome" && !orgId) router.replace("/");
  }, [orgsPending, orgs, view, orgId, router]);

  // ขั้น 1
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const logoPreview = useMemo(() => (logoFile ? URL.createObjectURL(logoFile) : ""), [logoFile]);
  const fileRef = useRef<HTMLInputElement>(null);
  // ขั้น 2
  const [accNo, setAccNo] = useState("");
  const [bank, setBank] = useState("ธนาคารกสิกรไทย");
  const [accName, setAccName] = useState("");
  const [promptPay, setPromptPay] = useState("");
  // ขั้น 3
  const [taxId, setTaxId] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [subDistrict, setSubDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  // ขั้น 4
  const [color, setColor] = useState<string>(COLORS[0][1]);
  const [footer, setFooter] = useState(DEFAULT_CHAT_SETTINGS.footerText);
  const [showQr, setShowQr] = useState(true);

  const popular = THAI_BANKS.filter((b) => POPULAR.includes(b.abbreviation)).sort(
    (a, b) => POPULAR.indexOf(a.abbreviation) - POPULAR.indexOf(b.abbreviation),
  );
  const others = THAI_BANKS.filter((b) => !POPULAR.includes(b.abbreviation));

  const update = async (data: Record<string, string>) => {
    const r = await authClient.organization.update({ data: data as any, organizationId: orgId || "" });
    if (r.error) throw new Error(r.error.message || "บันทึกไม่สำเร็จ");
  };

  const go = (n: number) => {
    // กระโดดไปขั้นที่ยังไม่ผ่านไม่ได้ (ต้องมีร้านก่อน)
    if (n > doneUpTo + 1) return;
    setStep(n);
  };

  const next = async () => {
    setBusy(true);
    try {
      if (step === 1) {
        if (!name.trim()) return void toast.error("กรุณาใส่ชื่อร้าน");
        let logo = "";
        if (logoFile) {
          const fd = new FormData();
          fd.append("file", logoFile);
          fd.append("width", "800");
          fd.append("quality", "auto");
          const r = await api.post("/cloudinary/upload", fd, { headers: { "Content-Type": "multipart/form-data" } }).catch(() => null);
          logo = r?.data?.url || "";
          if (!logo) toast.error("อัปโหลดโลโก้ไม่สำเร็จ ข้ามไปก่อน เพิ่มทีหลังได้ที่ตั้งค่า");
        }
        if (orgId) {
          await update({ name: name.trim(), phone: phone.trim(), ...(logo && { logo }) });
        } else {
          const r = await authClient.organization.create({
            name: name.trim(),
            slug: slugify(),
            logo,
            userId: session?.user.id,
            phone: phone.trim(),
            taxId: "",
            email: "",
            note: "",
            address: "",
            province: "",
            district: "",
            subDistrict: "",
            postalCode: "",
            account_no: "",
            account_name: "",
            prompt_pay: "",
            bank_name: "",
          } as any);
          if (r.error || !r.data) throw new Error(r.error?.message || "สร้างร้านไม่สำเร็จ");
          setOrgId(r.data.id);
          await authClient.organization.setActive({ organizationId: r.data.id });
        }
      } else if (step === 2) {
        if (!digits(accNo) || !bank || !accName.trim()) return void toast.error("กรุณากรอกเลขบัญชี ธนาคาร และชื่อเจ้าของบัญชี");
        await update({ account_no: accNo.trim(), bank_name: bank, account_name: accName.trim(), prompt_pay: digits(promptPay) });
      } else if (step === 3) {
        await update({ taxId: digits(taxId), address: address.trim(), province: province.trim(), district: district.trim(), subDistrict: subDistrict.trim(), postalCode: digits(postalCode) });
      } else {
        await api.patch("/bill-template/chat", {
          organizationId: orgId,
          chat: { ...DEFAULT_CHAT_SETTINGS, useThemeColor: false, headerColor: color, footerText: footer.trim(), showQr },
        });
        setView("done");
        return;
      }
      setDoneUpTo((d) => Math.max(d, step));
      setStep(step + 1);
    } catch (e: any) {
      toast.error(e?.message || "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setBusy(false);
    }
  };

  const signOut = () => authClient.signOut({ fetchOptions: { onSuccess: () => router.push("/login") } });

  const shell = (children: React.ReactNode, right?: React.ReactNode) => (
    <div className="fixed inset-0 z-10 overflow-y-auto bg-[#070c1c] font-mitr text-[#eef2ff]">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-520px] size-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,91,255,0.2),transparent)]" />
      <header className="relative flex items-center justify-between px-5 py-5 md:px-16 md:py-7">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Billdee" width={40} height={40} className="size-[34px] rounded-[10px] md:size-10" />
          <span className="text-[19px] font-semibold md:text-[22px]">Billdee</span>
        </div>
        {right}
      </header>
      {children}
    </div>
  );

  // ---------- ยินดีต้อนรับ ----------
  if (view === "welcome") {
    return shell(
      <main className="relative mx-auto grid max-w-[1312px] items-center gap-12 px-5 pb-10 md:px-16 lg:grid-cols-2">
        <section className="flex max-w-[600px] flex-col gap-6 md:gap-7">
          <span className="self-start rounded-full border border-[rgba(110,138,255,0.35)] bg-[rgba(59,91,255,0.16)] px-3.5 py-1.5 text-sm font-semibold text-[#c7d4ff]">
            บัญชีใหม่ · ตั้งค่าครั้งเดียว ใช้ได้ทันที
          </span>
          <h1 className="text-[40px] font-medium leading-tight md:text-[64px]">
            ยินดีต้อนรับสู่
            <br />
            <span className="text-[#8ea6ff]">Billdee</span>
          </h1>
          <p className="text-[16px] leading-relaxed text-[#b8c2e3] md:text-[20px]">
            เริ่มจากตั้งชื่อร้านของคุณ แล้วออกบิลแรกได้ภายในไม่กี่นาที
            <br className="hidden md:block" /> ข้อมูลร้านจะขึ้นบนหัวบิลทุกใบให้อัตโนมัติ
          </p>
          <ol className="flex flex-col gap-3.5">
            {["ตั้งชื่อร้าน และเบอร์โทร", "ใส่บัญชีรับเงิน / พร้อมเพย์", "ที่อยู่ร้าน และหน้าตาบิล"].map((t, i) => (
              <li key={t} className={cn("flex items-center gap-3.5 text-[15px] md:text-[17px]", i > 0 && "text-[#b8c2e3]")}>
                <span className={cn("grid size-8 place-items-center rounded-full text-[15px] font-semibold", i === 0 ? "bg-[#3b5bff] text-white" : "border-[1.5px] border-[#3a4775]")}>{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
            <button
              type="button"
              onClick={() => setView("steps")}
              className="flex h-[58px] items-center justify-center gap-3 rounded-2xl bg-[#3b5bff] px-8 text-[18px] font-medium text-white shadow-[0_12px_32px_rgba(59,91,255,0.38)] transition-transform active:scale-[0.98] md:text-[20px]"
            >
              เริ่มสร้างร้านค้า <ArrowRightIcon size={22} />
            </button>
            <span className="text-center text-[15px] text-[#8b96bd]">ใช้ฟรี 10 บิล/เดือน · ไม่ต้องใส่บัตร</span>
          </div>
        </section>

        <section aria-label="ตัวอย่างบิล" className="hidden justify-center lg:flex">
          <div className="relative w-[420px]">
            <div className="flex -rotate-2 flex-col gap-4 rounded-[22px] bg-white p-7 text-[#111827] shadow-[0_40px_80px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-10 place-items-center rounded-xl bg-[#e8edff] font-semibold text-[#3b5bff]">ร้</div>
                  <div className="flex flex-col">
                    <span className="text-[17px] font-medium">ชื่อร้านของคุณ</span>
                    <span className="text-[13px] text-[#6b7280]">โทร 08x-xxx-xxxx</span>
                  </div>
                </div>
                <span className="text-[13px] text-[#6b7280]">บิล #0001</span>
              </div>
              <div className="h-px bg-[#eef0f4]" />
              <div className="flex flex-col gap-2.5 text-[15px]">
                <div className="flex justify-between"><span>สินค้า A × 2</span><span>1,200</span></div>
                <div className="flex justify-between"><span>สินค้า B × 1</span><span>450</span></div>
                <div className="flex justify-between text-[#6b7280]"><span>ค่าส่ง</span><span>80</span></div>
              </div>
              <div className="flex items-baseline justify-between rounded-xl bg-[#f4f6fb] px-4 py-3.5">
                <span className="font-semibold">ยอดรวม</span>
                <span className="text-[26px] font-semibold text-[#2741d8]">1,730 บาท</span>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-7 flex items-center gap-2.5 rounded-[14px] border border-[#2a3766] bg-[#121a36] px-4 py-3 text-sm text-[#dfe6ff] shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
              <CheckIcon size={20} weight="bold" className="text-[#5fd39a]" />
              ชื่อร้านขึ้นหัวบิลทุกใบอัตโนมัติ
            </div>
          </div>
        </section>
      </main>,
      <button type="button" onClick={signOut} className="flex min-h-10 items-center gap-2 rounded-full border border-[#263055] px-3.5 text-sm text-[#a8b3d6] hover:text-white">
        <SignOutIcon size={16} />
        <span className="hidden sm:inline">{session?.user?.email} · </span>ออกจากระบบ
      </button>,
    );
  }

  // ---------- ร้านพร้อมแล้ว ----------
  if (view === "done") {
    return shell(
      <main className="relative mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-6 px-5 pb-12 text-center">
        <div className="grid size-[84px] place-items-center rounded-full border-[1.5px] border-[rgba(52,199,130,0.5)] bg-[rgba(52,199,130,0.14)]">
          <CheckIcon size={40} weight="bold" className="text-[#5fd39a]" />
        </div>
        <h1 className="text-[30px] font-medium leading-snug md:text-[44px]">
          ร้าน <span className="text-[#8ea6ff]">{name}</span> พร้อมแล้ว
        </h1>
        <p className="text-[15px] leading-relaxed text-[#a8b3d6] md:text-[18px]">
          ข้อมูลร้าน บัญชีรับเงิน และหน้าตาบิล ตั้งค่าครบแล้ว เริ่มออกบิลได้เลย
        </p>
        <div className="flex w-full flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => (window.location.href = "/bill/create")}
            className="flex h-[58px] w-full max-w-sm items-center justify-center gap-3 rounded-2xl bg-[#3b5bff] text-[18px] font-medium text-white shadow-[0_12px_32px_rgba(59,91,255,0.38)] active:scale-[0.98]"
          >
            <FileTextIcon size={22} /> ออกบิลแรกเลย
          </button>
          <button type="button" onClick={() => (window.location.href = "/")} className="min-h-11 text-[15px] text-[#a8b3d6] hover:text-white">
            ไปหน้าหลัก
          </button>
        </div>
      </main>,
    );
  }

  // ---------- ตั้งค่าร้าน 4 ขั้น ----------
  const head = (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-[#8ea6ff]">
        ขั้นที่ {step} จาก 4{step === 3 && " · ไม่บังคับ"}
      </span>
      <h1 className="text-[26px] font-medium md:text-[32px]">{STEPS[step - 1].title}</h1>
    </div>
  );

  return shell(
    <main className="relative mx-auto flex max-w-[1312px] flex-col gap-4 px-4 pb-6 md:flex-row md:gap-8 md:px-16 md:pb-10">
      {/* การ์ดขั้นตอน (คอม) / แถบ 4 ช่อง (มือถือ) */}
      <nav aria-label="ขั้นตอน" className="grid grid-cols-4 gap-1.5 md:flex md:w-[340px] md:shrink-0 md:flex-col md:gap-3">
        {STEPS.map((s, i) => {
          const n = i + 1;
          const active = n === step;
          const done = n <= doneUpTo && !active;
          const locked = n > doneUpTo + 1;
          return (
            <button
              key={s.title}
              type="button"
              onClick={() => go(n)}
              disabled={locked}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex flex-col gap-1.5 text-left md:min-h-[76px] md:flex-row md:items-center md:gap-3.5 md:rounded-[18px] md:px-[18px] md:py-3.5",
                active ? "md:border-[1.5px] md:border-[#3b5bff] md:bg-[#111b40] md:shadow-[0_16px_40px_rgba(59,91,255,0.22)]" : "md:border md:border-[#1c2548] md:bg-[#0b1128]",
                locked && "cursor-not-allowed",
              )}
            >
              <span className={cn("block h-[5px] rounded-full md:hidden", n <= Math.max(step, doneUpTo) ? "bg-[#3b5bff]" : "bg-[#26305a]")} />
              <span className={cn("text-xs md:hidden", active ? "font-semibold text-white" : done ? "text-[#5fd39a]" : "text-[#8b96bd]")}>
                {done ? "✓ " : `${n} `}
                {s.short}
              </span>
              <span
                className={cn(
                  "hidden size-9 shrink-0 place-items-center rounded-full text-[15px] font-semibold md:grid",
                  done ? "border-[1.5px] border-[rgba(95,211,154,0.5)] bg-[rgba(95,211,154,0.16)] text-[#5fd39a]" : active ? "bg-[#3b5bff] text-white" : "border-[1.5px] border-[#3a4775] text-[#a8b3d6]",
                )}
              >
                {done ? <CheckIcon size={16} weight="bold" /> : n}
              </span>
              <span className="hidden flex-col gap-0.5 md:flex">
                <span className="text-[17px] font-medium text-white">{s.title}</span>
                <span className="text-[13px] leading-snug text-[#8b96bd]">{s.sub}</span>
              </span>
            </button>
          );
        })}
        <p className="mt-auto hidden px-1.5 text-[13px] leading-relaxed text-[#8b96bd] md:block">
          ทุกอย่างแก้ไขได้ภายหลังที่ ตั้งค่า › ข้อมูลร้านค้า
        </p>
      </nav>

      <section className="flex min-w-0 flex-1 flex-col gap-5 rounded-[22px] border border-[#222c55] bg-[#0e1530] p-5 shadow-[0_40px_90px_rgba(0,0,0,0.45)] md:gap-6 md:rounded-[26px] md:p-10">
        {head}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="เพิ่มรูปโลโก้ร้าน"
                className="grid size-[88px] shrink-0 place-items-center overflow-hidden rounded-[22px] border-[1.5px] border-dashed border-[#3a4775] bg-[#111a3a] text-[13px] text-[#8ea6ff] md:size-[104px]"
              >
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="" className="size-full object-cover" />
                ) : (
                  <span className="flex flex-col items-center gap-1.5"><ImageIcon size={28} />เพิ่มรูป</span>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && f.size > 4 * 1024 * 1024) return void toast.error("ไฟล์ใหญ่เกิน 4MB");
                  setLogoFile(f || null);
                }}
              />
              <span className="text-sm leading-relaxed text-[#a8b3d6]">
                <span className="font-semibold text-[#dfe6ff]">รูปโลโก้ร้าน</span> (ไม่บังคับ)
                <br />
                PNG หรือ JPG ไม่เกิน 4MB
              </span>
            </div>
            <Field label="ชื่อร้านค้า" htmlFor="ob-name" req>
              <input id="ob-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="เช่น JATUPON SEAFOODS" className={inputCls} />
            </Field>
            <div className="md:max-w-[360px]">
              <Field label="เบอร์โทรร้าน" htmlFor="ob-phone">
                <input id="ob-phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} placeholder="08x-xxx-xxxx" className={inputCls} />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <p className="-mt-3 text-[15px] text-[#a8b3d6]">ขึ้นท้ายบิล ให้ลูกค้าโอนหรือสแกนจ่ายได้ทันที</p>
            <Field label="หมายเลขบัญชีธนาคาร" htmlFor="ob-acc" req>
              <input id="ob-acc" inputMode="numeric" value={accNo} onChange={(e) => setAccNo(e.target.value)} maxLength={20} placeholder="xxx-x-xxxxx-x" className={inputCls} />
            </Field>
            <div className="flex flex-col gap-2">
              <span className={labelCls}>ธนาคาร <span className="text-[#ff9b8a]">*</span></span>
              <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
                {popular.map((b) => (
                  <button
                    key={b.code}
                    type="button"
                    onClick={() => setBank(b.name)}
                    aria-pressed={bank === b.name}
                    className={cn(
                      "flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-[14px] px-1 py-2",
                      bank === b.name ? "border-[1.5px] border-[#3b5bff] bg-[#111b40]" : "border border-[#222c55] bg-[#0a1128]",
                    )}
                  >
                    <Image src={bankLogoUrl(b.name) || "/banks/PromptPay.png"} alt="" width={32} height={32} className="size-8 rounded-full object-contain" />
                    <span className="text-[11px] text-[#c7d0ee] md:text-xs">{SHORT[b.abbreviation]}</span>
                  </button>
                ))}
                <label className={cn("flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-[14px] px-1 py-2 text-[11px] text-[#c7d0ee] md:text-xs", others.some((o) => o.name === bank) ? "border-[1.5px] border-[#3b5bff] bg-[#111b40]" : "border border-[#222c55] bg-[#0a1128]")}>
                  <span>ธนาคารอื่น</span>
                  <select
                    value={others.some((o) => o.name === bank) ? bank : ""}
                    onChange={(e) => e.target.value && setBank(e.target.value)}
                    className="w-full max-w-full truncate bg-transparent text-center text-[11px] text-white outline-none"
                  >
                    <option value="" className="bg-[#0a1128]">เลือก</option>
                    {others.map((o) => (
                      <option key={o.code} value={o.name} className="bg-[#0a1128]">{o.name}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="ชื่อเจ้าของบัญชี" htmlFor="ob-accname" req>
                <input id="ob-accname" value={accName} onChange={(e) => setAccName(e.target.value)} maxLength={120} placeholder="ตามหน้าสมุดบัญชี" className={inputCls} />
              </Field>
              <Field label="หมายเลขพร้อมเพย์" htmlFor="ob-pp" hint="(ถ้ามี)">
                <input id="ob-pp" inputMode="numeric" value={promptPay} onChange={(e) => setPromptPay(e.target.value)} maxLength={20} placeholder="เบอร์โทร หรือ เลขบัตรประชาชน" className={inputCls} />
              </Field>
            </div>
            <span className="text-[13px] text-[#8b96bd]">ใส่พร้อมเพย์ไว้ บิลจะมี QR ให้ลูกค้าสแกนจ่ายได้เลย</span>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <p className="-mt-3 text-[15px] text-[#a8b3d6]">ใช้ออกใบกำกับภาษี / ใบเสร็จแบบเต็ม ถ้ายังไม่ใช้ กดข้ามได้</p>
            <div className="md:max-w-[420px]">
              <Field label="เลขประจำตัวผู้เสียภาษี" htmlFor="ob-tax">
                <input id="ob-tax" inputMode="numeric" value={taxId} onChange={(e) => setTaxId(e.target.value)} maxLength={17} placeholder="13 หลัก" className={inputCls} />
              </Field>
            </div>
            <Field label="ที่อยู่ร้านค้า" htmlFor="ob-addr">
              <input id="ob-addr" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} placeholder="บ้านเลขที่ หมู่ ซอย ถนน" className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Field label="จังหวัด" htmlFor="ob-prov"><input id="ob-prov" value={province} onChange={(e) => setProvince(e.target.value)} maxLength={80} className={inputCls} /></Field>
              <Field label="อำเภอ / เขต" htmlFor="ob-dist"><input id="ob-dist" value={district} onChange={(e) => setDistrict(e.target.value)} maxLength={80} className={inputCls} /></Field>
              <Field label="ตำบล / แขวง" htmlFor="ob-sub"><input id="ob-sub" value={subDistrict} onChange={(e) => setSubDistrict(e.target.value)} maxLength={80} className={inputCls} /></Field>
              <Field label="รหัสไปรษณีย์" htmlFor="ob-zip"><input id="ob-zip" inputMode="numeric" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} maxLength={5} className={inputCls} /></Field>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-6 md:flex-row md:gap-8">
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <p className="-mt-3 text-[15px] text-[#a8b3d6]">เลือกสีให้เข้ากับร้าน ตัวอย่างเปลี่ยนตามทันที</p>
              <div className="flex flex-col gap-2.5">
                <span className={labelCls}>สีหัวบิล</span>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map(([n, c]) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      aria-label={`สี${n}`}
                      aria-pressed={color === c}
                      className={cn("grid size-[52px] place-items-center rounded-full", color === c ? "border-[2.5px] border-white shadow-[0_0_0_4px_rgba(59,91,255,0.45)]" : "border-2 border-[#2a3561]")}
                    >
                      <span className="size-[30px] rounded-full" style={{ background: c }} />
                    </button>
                  ))}
                </div>
                <span className="text-[13px] text-[#8b96bd]">อยากได้เฉดอื่น ปรับละเอียดได้ทุกสีที่ ตั้งค่า › รูปแบบบิลส่งแชท</span>
              </div>
              <Field label="ข้อความท้ายบิล" htmlFor="ob-foot">
                <input id="ob-foot" value={footer} onChange={(e) => setFooter(e.target.value)} maxLength={200} className={inputCls} />
              </Field>
              <label className="flex min-h-11 items-center gap-3 text-[15px] text-[#dfe6ff]">
                <input type="checkbox" checked={showQr} onChange={(e) => setShowQr(e.target.checked)} className="size-[22px] accent-[#3b5bff]" />
                แสดง QR พร้อมเพย์บนบิล
              </label>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-2 md:w-[280px]">
              <span className="text-[13px] text-[#8b96bd]">ตัวอย่างบิล</span>
              <div className="w-full max-w-[280px] overflow-hidden rounded-2xl bg-white text-[#111827] shadow-[0_24px_50px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col gap-0.5 px-4 py-3.5" style={{ background: color }}>
                  <span className="truncate text-[19px] font-medium text-white">{name || "ชื่อร้านของคุณ"}</span>
                  <span className="text-xs text-white/85">โทร {phone || "08x-xxx-xxxx"}</span>
                </div>
                <div className="flex flex-col gap-2.5 px-4 py-3.5 text-[13px]">
                  <div className="flex justify-between"><span>สินค้า A × 2</span><span className="font-semibold">1,200</span></div>
                  <div className="flex justify-between"><span>สินค้า B × 1</span><span className="font-semibold">450</span></div>
                  <div className="flex items-center justify-between rounded-[10px] border-[1.5px] px-3 py-2.5" style={{ borderColor: color, color, background: `${color}10` }}>
                    <span className="font-semibold">รวมโอน</span>
                    <span className="text-[20px] font-semibold">1,650 บาท</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#374151]">
                    {bankLogoUrl(bank) && <Image src={bankLogoUrl(bank)!} alt="" width={24} height={24} className="size-6 object-contain" />}
                    <span className="truncate">{bank.replace("ธนาคาร", "")} · {accNo || "xxx-x-xxxxx-x"}</span>
                  </div>
                  {showQr && digits(promptPay) && (
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <div className="size-[74px] rounded-md bg-[repeating-linear-gradient(45deg,#111827_0_4px,#fff_4px_8px)]" />
                      <span className="text-[11px] text-[#6b7280]">สแกนจ่ายด้วยพร้อมเพย์</span>
                    </div>
                  )}
                  {footer.trim() && <span className="text-center text-xs text-[#6b7280]">{footer}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-col-reverse gap-3 border-t border-[#1c2548] pt-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between md:justify-start md:gap-3">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="flex min-h-12 items-center gap-2 rounded-[14px] border border-[#2a3561] px-5 text-[15px] text-[#c7d0ee]">
                <ArrowLeftIcon size={16} /> ย้อนกลับ
              </button>
            ) : (
              <button type="button" onClick={() => setView("welcome")} className="flex min-h-12 items-center gap-2 px-1 text-[15px] text-[#a8b3d6]">
                <ArrowLeftIcon size={16} /> ย้อนกลับ
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            {step === 3 && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setDoneUpTo((d) => Math.max(d, 3));
                  setStep(4);
                }}
                className="min-h-12 px-4 text-[15px] text-[#a8b3d6] underline underline-offset-4"
              >
                ข้ามขั้นนี้
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={next}
              className="flex h-14 items-center justify-center gap-2 rounded-[14px] bg-[#3b5bff] px-8 text-[17px] font-medium text-white shadow-[0_12px_32px_rgba(59,91,255,0.38)] disabled:opacity-60 md:text-[18px]"
            >
              {busy ? "กำลังบันทึก…" : step === 4 ? "เปิดร้านเลย ✓" : "ถัดไป →"}
            </button>
          </div>
        </div>
      </section>
    </main>,
  );
}
