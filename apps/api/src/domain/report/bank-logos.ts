import { readFileSync } from "node:fs";
import { join } from "node:path";

// โลโก้ธนาคาร (จาก casperstack/thai-banks-logo) จับคู่กับชื่อธนาคารใน THAI_BANKS ของหน้าตั้งค่าร้าน
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

const LOGO_DIR = join(import.meta.dir, "../../assets/banks");
const cache = new Map<string, string | null>();

function loadLogo(file: string): string | null {
  if (!cache.has(file)) {
    try {
      const data = readFileSync(join(LOGO_DIR, `${file}.png`));
      cache.set(file, `data:image/png;base64,${data.toString("base64")}`);
    } catch (error) {
      console.error("Failed to load bank logo:", file, error);
      cache.set(file, null);
    }
  }
  return cache.get(file) ?? null;
}

export function getBankLogo(bankName?: string | null): string | null {
  const file = bankName ? BANK_LOGO_FILES[bankName.trim()] : undefined;
  return file ? loadLogo(file) : null;
}

export function getPromptPayLogo(): string | null {
  return loadLogo("PromptPay");
}
