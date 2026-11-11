// แปลงใบเสร็จ PDF จาก API (/report/receipt/:id) เป็นรูป PNG แล้วดาวน์โหลด
// ใช้ PDF ตัวเดียวกับปุ่มพิมพ์ใบเสร็จ รูปจึงตรงกับเทมเพลตบิลที่ตั้งค่าไว้

const RENDER_SCALE = 2;

/** รูปใบเสร็จ (PNG) ขนาดตามหน้ากระดาษของ PDF ใบเสร็จ — ทุกหน้าต่อกันเป็นรูปเดียว */
export async function renderReceiptBlob(billId: string): Promise<Blob> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/report/receipt/${billId}`,
    { credentials: "include" },
  );
  if (!response.ok) {
    throw new Error(`ไม่สามารถโหลดใบเสร็จได้ (${response.status})`);
  }
  const data = new Uint8Array(await response.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;

  // render ทุกหน้า แล้วต่อกันในแนวตั้งเป็นรูปเดียว
  const pages: HTMLCanvasElement[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: RENDER_SCALE });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("ไม่สามารถสร้างรูปภาพได้");
    await page.render({ canvasContext: ctx, viewport }).promise;
    pages.push(canvas);
  }
  await pdf.destroy();

  const output = document.createElement("canvas");
  output.width = Math.max(...pages.map((c) => c.width));
  output.height = pages.reduce((sum, c) => sum + c.height, 0);
  const outCtx = output.getContext("2d");
  if (!outCtx) throw new Error("ไม่สามารถสร้างรูปภาพได้");
  outCtx.fillStyle = "#ffffff";
  outCtx.fillRect(0, 0, output.width, output.height);
  let y = 0;
  for (const c of pages) {
    outCtx.drawImage(c, 0, y);
    y += c.height;
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    output.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("ไม่สามารถสร้างรูปภาพได้");
  return blob;
}

export async function downloadReceiptImage(billId: string, fileName?: string) {
  const blob = await renderReceiptBlob(billId);
  saveBlob(blob, `${fileName || `BillDee_${billId}`}.png`);
}

export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
