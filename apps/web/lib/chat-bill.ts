"use client";

/**
 * รูปแบบบิลส่งแชท (ตั้งค่าที่ ตั้งค่า > รูปแบบบิลส่งแชท) — ใช้กับรูปบิลและข้อความคัดลอก/ส่งต่อ
 * เก็บใน billTemplate.chat ของร้าน · ยังไม่ตั้ง = ค่าเริ่มต้นด้านล่าง
 */
import { useQuery } from "@tanstack/react-query";
import api from "@/hooks/axios";

export type ChatBillSettings = {
  useThemeColor: boolean;
  headerColor: string;
  showPhone: boolean;
  showUnit: boolean;
  showBank: boolean;
  showBankLogo: boolean;
  showAccountNo: boolean;
  showAccountName: boolean;
  showPromptPay: boolean;
  showQr: boolean;
  useFooterFromPdf: boolean;
  footerText: string;
  totalLabel: string;
  starTotal: boolean;
  footerInText: boolean;
};

export const DEFAULT_CHAT_SETTINGS: ChatBillSettings = {
  useThemeColor: false,
  headerColor: "#2563eb",
  showPhone: true,
  showUnit: true,
  showBank: true,
  showBankLogo: true,
  showAccountNo: true,
  showAccountName: true,
  showPromptPay: false,
  showQr: true, // ขึ้นเฉพาะร้านที่ใส่พร้อมเพย์ไว้
  useFooterFromPdf: false,
  footerText: "ขอบคุณที่อุดหนุนครับ 🙏",
  totalLabel: "รวมโอน",
  starTotal: true,
  footerInText: false,
};

export const PDF_DEFAULT_FOOTER = "ขอบพระคุณลูกค้าที่ไว้วางใจและเลือกซื้อสินค้าจากเรา";

/** ค่าที่ใช้จริงหลังรวมค่าจากใบเสร็จ PDF (สี / ข้อความท้ายบิล) */
export type ResolvedChatSettings = ChatBillSettings & { color: string; footer: string };

export function resolveChatSettings(template: any): ResolvedChatSettings {
  const s: ChatBillSettings = { ...DEFAULT_CHAT_SETTINGS, ...(template?.chat ?? {}) };
  const color = s.useThemeColor ? template?.themcolor || "#2563eb" : s.headerColor || "#2563eb";
  const footer = s.useFooterFromPdf ? template?.footerText || PDF_DEFAULT_FOOTER : s.footerText;
  return { ...s, color, footer: (footer ?? "").trim() };
}

/** ตั้งค่าของร้าน (ร้านใหม่ที่ยังไม่มี billTemplate = ค่าเริ่มต้น) */
export function useBillTemplate(organizationId?: string) {
  return useQuery<any>({
    queryKey: ["bill-template", organizationId],
    queryFn: async () => {
      try {
        return (await api.get(`/bill-template/${organizationId}`)).data?.data ?? null;
      } catch (e: any) {
        if (e?.response?.status === 404) return null;
        throw e;
      }
    },
    enabled: !!organizationId,
    staleTime: 60_000,
  });
}

export function useChatSettings(organizationId?: string): ResolvedChatSettings {
  const { data } = useBillTemplate(organizationId);
  return resolveChatSettings(data);
}

/** โลโก้ธนาคาร (ชุดเดียวกับใบเสร็จ PDF) อยู่ที่ /banks/<CODE>.png */
const BANK_LOGO_FILES: Record<string, string> = {
  ธนาคารกรุงเทพ: "BBL",
  ธนาคารกสิกรไทย: "KBANK",
  ธนาคารกรุงไทย: "KTB",
  ธนาคารทหารไทยธนชาต: "TTB",
  ธนาคารไทยพาณิชย์: "SCB",
  ธนาคารซีไอเอ็มบีไทย: "CIMB",
  ธนาคารยูโอบี: "UOB",
  ธนาคารกรุงศรีอยุธยา: "BAY",
  ธนาคารออมสิน: "GSB",
  ธนาคารอาคารสงเคราะห์: "GHB",
  ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร: "BAAC",
  ธนาคารทิสโก้: "TISCO",
  ธนาคารเกียรตินาคินภัทร: "KKP",
  "ธนาคารไอซีบีซี (ไทย)": "ICBC",
  ธนาคารไทยเครดิตเพื่อรายย่อย: "TCRB",
  "ธนาคารแลนด์ แอนด์ เฮ้าส์": "LHB",
};

export function bankLogoUrl(bankName?: string | null): string | null {
  const code = bankName ? BANK_LOGO_FILES[bankName.trim()] : undefined;
  return code ? `/banks/${code}.png` : null;
}
