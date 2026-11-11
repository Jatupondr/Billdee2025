/**
 * รูปบิลสำหรับส่งแชท (แนวตั้ง กว้างพอดีจอมือถือ ตัวหนังสือใหญ่) — วาดด้วย canvas ในเครื่อง ไม่ต้องรอ PDF
 * หัวบิลสี · ร้าน · เลขบิล/วันที่ · ลูกค้า · รายการ · ส่วนลด/VAT · กล่องรวมโอน · บัญชีธนาคาร · ข้อความท้ายบิล
 */

export type BillImageInput = {
  billNumber?: string;
  date?: string | Date;
  name_customer?: string;
  products?: { name?: string; quantity?: number; price?: number; total?: number }[];
  discount?: number;
  discountPercent?: number;
  includeVat?: boolean;
  vat?: number;
  taxPercent?: number;
  total?: number;
};

export type BillImageShop = {
  name?: string;
  phone?: string;
  bank_name?: string;
  account_no?: string;
  account_name?: string;
  prompt_pay?: string;
};

export type BillImageOptions = {
  headerColor?: string;
  footerText?: string;
};

const W = 720; // px (วาดที่ 2 เท่าของ 360 เพื่อความคม)
const PAD = 40;
const num = (n: number) => (n || 0).toLocaleString("th-TH", { maximumFractionDigits: 2 });

function fontFamily(): string {
  if (typeof document === "undefined") return "sans-serif";
  const f = getComputedStyle(document.body).fontFamily;
  return f || "sans-serif";
}

/** ตัดบรรทัดตามความกว้าง (ภาษาไทยไม่มีช่องว่าง ตัดทีละตัวอักษรเมื่อจำเป็น) */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const ch of Array.from(text)) {
    const next = line + ch;
    if (ctx.measureText(next).width > maxWidth && line) {
      // ถ้ามีช่องว่างในบรรทัด ตัดที่ช่องว่างสุดท้าย
      const sp = line.lastIndexOf(" ");
      if (sp > 0) {
        out.push(line.slice(0, sp));
        line = line.slice(sp + 1) + ch;
      } else {
        out.push(line);
        line = ch;
      }
    } else {
      line = next;
    }
  }
  if (line) out.push(line);
  return out.length ? out : [""];
}

export async function renderBillImage(
  bill: BillImageInput,
  shop: BillImageShop | null | undefined,
  opts: BillImageOptions = {},
): Promise<Blob> {
  if (typeof document !== "undefined" && document.fonts?.ready) await document.fonts.ready;
  const family = fontFamily();
  const header = opts.headerColor || "#2563eb";
  const footer = opts.footerText ?? "ขอบคุณที่อุดหนุนครับ 🙏";
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("ไม่สามารถสร้างรูปบิลได้");
  const font = (size: number, bold = false) => `${bold ? "700" : "400"} ${size}px ${family}`;
  const inner = W - PAD * 2;

  // ---------- วัดความสูงก่อน ----------
  type Op = (y: number) => number;
  const ops: Op[] = [];
  let height = 0;
  const add = (h: number, draw: (y: number) => void) => {
    ops.push((y) => {
      draw(y);
      return y + h;
    });
    height += h;
  };

  // หัวบิล
  ctx.font = font(42, true);
  const shopLines = wrap(ctx, shop?.name || "ใบแจ้งยอด", inner);
  const headH = 44 + shopLines.length * 52 + (shop?.phone ? 40 : 0) + 24;
  add(headH, (y) => {
    ctx.fillStyle = header;
    ctx.fillRect(0, y, W, headH);
    ctx.fillStyle = "#ffffff";
    ctx.font = font(42, true);
    shopLines.forEach((l, i) => ctx.fillText(l, PAD, y + 80 + i * 52));
    if (shop?.phone) {
      ctx.globalAlpha = 0.88;
      ctx.font = font(26);
      ctx.fillText(`โทร ${shop.phone}`, PAD, y + 80 + shopLines.length * 52 - 4);
      ctx.globalAlpha = 1;
    }
  });

  // เลขบิล + วันที่ + ลูกค้า
  const dateText = bill.date
    ? new Date(bill.date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" })
    : "";
  ctx.font = font(36, true);
  const custLines = wrap(ctx, bill.name_customer || "", inner);
  add(70 + custLines.length * 46 + 16, (y) => {
    ctx.font = font(27);
    ctx.fillStyle = "#52525b";
    ctx.textAlign = "left";
    ctx.fillText(bill.billNumber ? `บิล ${bill.billNumber}` : "", PAD, y + 56);
    ctx.textAlign = "right";
    ctx.fillText(dateText, W - PAD, y + 56);
    ctx.textAlign = "left";
    ctx.fillStyle = "#18181b";
    ctx.font = font(36, true);
    custLines.forEach((l, i) => ctx.fillText(l, PAD, y + 108 + i * 46));
  });

  // รายการ
  for (const p of (bill.products ?? []).filter((x) => x.name)) {
    ctx.font = font(32);
    const lines = wrap(ctx, p.name as string, inner);
    const total = p.total ?? (p.price || 0) * (p.quantity || 0);
    const h = 24 + lines.length * 42 + 44;
    add(h, (y) => {
      ctx.strokeStyle = "#e4e4e7";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(PAD, y);
      ctx.lineTo(W - PAD, y);
      ctx.stroke();
      ctx.fillStyle = "#18181b";
      ctx.font = font(32);
      lines.forEach((l, i) => ctx.fillText(l, PAD, y + 50 + i * 42));
      const by = y + 50 + lines.length * 42;
      ctx.fillStyle = "#52525b";
      ctx.font = font(28);
      ctx.fillText(`${num(p.quantity || 0)} × ${num(p.price || 0)}`, PAD, by);
      ctx.textAlign = "right";
      ctx.fillStyle = "#18181b";
      ctx.font = font(32, true);
      ctx.fillText(num(total), W - PAD, by);
      ctx.textAlign = "left";
    });
  }

  // ส่วนลด / VAT
  const extras: [string, string][] = [];
  if (bill.discount) extras.push([`ส่วนลด${bill.discountPercent ? ` ${bill.discountPercent}%` : ""}`, `-${num(bill.discount)}`]);
  if (bill.includeVat && bill.vat) extras.push([`VAT ${bill.taxPercent || 7}%`, `+${num(bill.vat)}`]);
  for (const [k, v] of extras) {
    add(58, (y) => {
      ctx.strokeStyle = "#e4e4e7";
      ctx.beginPath();
      ctx.moveTo(PAD, y);
      ctx.lineTo(W - PAD, y);
      ctx.stroke();
      ctx.fillStyle = "#52525b";
      ctx.font = font(28);
      ctx.fillText(k, PAD, y + 40);
      ctx.textAlign = "right";
      ctx.fillText(v, W - PAD, y + 40);
      ctx.textAlign = "left";
    });
  }

  // กล่องรวมโอน
  add(150, (y) => {
    const bx = PAD;
    const by = y + 22;
    const bw = inner;
    const bh = 104;
    ctx.fillStyle = "#f0fdf4";
    ctx.strokeStyle = "#16a34a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 22);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#15803d";
    ctx.font = font(32, true);
    ctx.fillText("รวมโอน", bx + 28, by + 64);
    ctx.textAlign = "right";
    ctx.font = font(52, true);
    ctx.fillText(`${num(bill.total || 0)} บาท`, bx + bw - 28, by + 72);
    ctx.textAlign = "left";
  });

  // บัญชีธนาคาร
  const bank: [string, string, boolean][] = [];
  if (shop?.bank_name) bank.push(["ธนาคาร", shop.bank_name, false]);
  if (shop?.account_no) bank.push(["เลขบัญชี", shop.account_no, true]);
  if (shop?.account_name) bank.push(["ชื่อบัญชี", shop.account_name, false]);
  if (shop?.prompt_pay) bank.push(["พร้อมเพย์", shop.prompt_pay, true]);
  if (bank.length) {
    add(16 + bank.length * 50, (y) => {
      bank.forEach(([k, v, bold], i) => {
        const ly = y + 44 + i * 50;
        ctx.fillStyle = "#71717a";
        ctx.font = font(30);
        ctx.fillText(k, PAD, ly);
        ctx.fillStyle = "#18181b";
        ctx.font = font(bold ? 32 : 30, bold);
        ctx.fillText(v, PAD + 170, ly);
      });
    });
  }

  // ข้อความท้ายบิล
  if (footer.trim()) {
    ctx.font = font(26);
    const lines = wrap(ctx, footer.trim(), inner);
    add(30 + lines.length * 36 + 30, (y) => {
      ctx.fillStyle = "#a1a1aa";
      ctx.font = font(26);
      ctx.textAlign = "center";
      lines.forEach((l, i) => ctx.fillText(l, W / 2, y + 54 + i * 36));
      ctx.textAlign = "left";
    });
  } else {
    add(30, () => {});
  }

  // ---------- วาดจริง ----------
  canvas.width = W;
  canvas.height = Math.ceil(height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, canvas.height);
  ctx.textBaseline = "alphabetic";
  let y = 0;
  for (const op of ops) y = op(y);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("ไม่สามารถสร้างรูปบิลได้");
  return blob;
}
