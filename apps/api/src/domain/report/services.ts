
import { Bill, BillTemplate, Organization } from "../../../models/model";
import generatePayload from "promptpay-qr";
const PdfPrinter = require("pdfmake/src/printer");

// Helper function to convert image URL to base64
async function getImageBase64(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("Failed to convert image to base64:", error);
    return null;
  }
}

export abstract class reportService {
  static async receipt(id: string, set: any, query: any) {
    try {
      const billdata:any = await Bill.findOne({ _id: id, isDeleted: false })
      .populate("customerId", "name email phone address district subDistrict province postalCode taxId")
      .populate("userId", "name email")
      // .populate("products.productId", "name")
      .populate("organizationId", "_id name taxId logo phone address district subDistrict province postalCode account_name account_no bank_name prompt_pay")
      .lean();
      // find bill template
      const billTemplate: any = await BillTemplate.findOne({ organizationId: billdata?.organizationId._id })
      .lean();

      if (!billdata) {
        throw new Error("Bill not found");
      }

      const fonts = {
        THSarabunNew: {
          normal: "src/fonts/THSarabunNew.ttf",
          bold: "src/fonts/THSarabunNew-Bold.ttf",
          italics: "src/fonts/THSarabunNew.ttf",
          bolditalics: "src/fonts/THSarabunNew.ttf",
        },
      };
      const printer = new PdfPrinter(fonts);

      let bankQrcodeBase64: string | null = null;
      if (billdata?.organizationId?.prompt_pay) {
        try {
          const QRCode = require("qrcode");
          const payload = generatePayload(billdata?.organizationId?.prompt_pay, {
            amount: billdata?.total || 0,
          });

          bankQrcodeBase64 = await QRCode.toDataURL(payload);
        } catch (error) {
          bankQrcodeBase64 = null;
        }
      }

      // Get logo base64 for watermark background
      let logoBase64: string | null = null;
      if (billTemplate?.isLogoWatermark && billdata?.organizationId?.logo) {
        logoBase64 = await getImageBase64(billdata.organizationId.logo);
      }

      const docDefinition: any = {
        pageSize: billTemplate?.typePage || "A4",
        pageMargins: billTemplate?.pageMargins || [26, 26, 26, 26],
        defaultStyle: { font: "THSarabunNew", fontSize: billTemplate?.fontSize || 14 },
        info: {
          title: `${billdata.billNumber}-ใบเสร็จรับเงิน`,
          author: "billdee",
          subject: "ใบเสร็จรับเงิน",
          keywords: `ใบเสร็จรับเงิน, ${billdata.billNumber}`,
          filename: `${billdata.billNumber}-ใบเสร็จรับเงิน.pdf`,
        },
        // Text Watermark
        ...(billTemplate?.isWatermark && billTemplate?.watermarkText ? {
          watermark: {
            text: billTemplate.watermarkText,
            color: billTemplate.watermarkColor || "#cccccc",
            opacity: 0.15,
            fontSize: 50,
            bold: true,
            angle: billTemplate.watermarkAngle === "bottomToTop" ? -45 : 45,
          }
        } : {}),
        // Logo Background Watermark
        ...(billTemplate?.isLogoWatermark && logoBase64 ? {
          background: function (currentPage: number, pageSize: any) {
            return {
              image: logoBase64,
              width: 150,
              height: 150,
              opacity: 0.08,
              absolutePosition: {
                x: (pageSize.width - 150) / 2,
                y: (pageSize.height - 150) / 2,
              },
            };
          }
        } : {}),
        footer: function (currentPage: number, pageCount: number) {
          return {
            columns: [
              {
                text: `หน้า ${currentPage} / ${pageCount}`,
                alignment: "left",
                fontSize: billTemplate?.fontSize || 12,
                width: "50%",
              },
              {
                text: "ออกแบบรายงานด้วยระบบ billdee",
                alignment: "right",
                fontSize: billTemplate?.fontSize || 12,
                width: "50%",
              },
            ],
            margin: [36, 10, 36, 0],
          };
        },
        content: [
          {
            text: "ใบเสร็จรับเงิน",
            style: "header",
            color: billTemplate?.themcolor || "#000000",
            fontSize: 28,
            bold: true,
            alignment: "center" as const,
          },
          { text: "\n" },
          {
            columns: [
              {
                width: "*",
                text: [
                  {
                    text: (billdata?.organizationId?.name || "-") + "\n",
                    bold: true,
                    fontSize: billTemplate?.fontSize || 18,
                  },


                  ...([
                      billdata?.organizationId?.address,
                      billdata?.organizationId?.subDistrict,
                      billdata?.organizationId?.district,
                      billdata?.organizationId?.province,
                      billdata?.organizationId?.postalCode
                    ].filter(Boolean).length > 0 ? [{
                    text: "ที่อยู่: " + [
                      billdata?.organizationId?.address,
                      billdata?.organizationId?.subDistrict,
                      billdata?.organizationId?.district,
                      billdata?.organizationId?.province,
                      billdata?.organizationId?.postalCode
                    ].filter(Boolean).join(" ") + "\n",
                    bold: true,
                    fontSize: billTemplate?.fontSize || 12,
                  }] : []),
                 ...(billdata?.organizationId?.taxId ? [
                  {
                    text: "เลขประจำตัวผู้เสียภาษี: " + (billdata?.organizationId?.taxId || "-") + "\n",
                    bold: true,
                    fontSize: billTemplate?.fontSize || 12,
                  },
                 ] : []),
                 ...(billdata?.organizationId?.phone ? [
                    {
                      text: "เบอร์โทร: " + (billdata?.organizationId?.phone || "-") + "\n",
                      bold: true,
                      fontSize: billTemplate?.fontSize || 12,
                    },
                  ] : []),



                ],
              },
              {
                width: "auto",
                text: [
                  { text: "วันที่: ", bold: true },
                  new Date(billdata?.date as Date).toLocaleDateString("th-TH", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }) + "\n",
                  { text: "เลขที่บิล: ", bold: true },
                  billdata?.billNumber,
                ],
                alignment: "right" as const,
              },
            ],
          },
          { text: "\n" },
          {
            columns: [
              {
                width: "*",
                text: [
                  {
                    text: "ลูกค้า: " + (billdata?.customerId?.name || billdata?.name_customer || "-") + "\n",
                    bold: true,
                    fontSize: billTemplate?.fontSize || 18,
                  },
                  ...([
                      billdata?.customerId?.address || billdata?.address_customer,
                      billdata?.customerId?.subDistrict,
                      billdata?.customerId?.district,
                      billdata?.customerId?.province,
                      billdata?.customerId?.postalCode
                    ].filter(Boolean).length > 0 ? [{
                    text: "ที่อยู่: " + [
                      billdata?.customerId?.address || billdata?.address_customer,
                      billdata?.customerId?.subDistrict,
                      billdata?.customerId?.district,
                      billdata?.customerId?.province,
                      billdata?.customerId?.postalCode
                    ].filter(Boolean).join(" ") + "\n",
                    bold: true,
                    fontSize: billTemplate?.fontSize || 12,
                  }] : []),
                  ...(billdata?.customerId?.taxId ? [
                    {
                      text: "เลขประจำตัวผู้เสียภาษี: " + (billdata?.customerId?.taxId || "-") + "\n",
                      bold: true,
                      fontSize: billTemplate?.fontSize || 12,
                    },
                   ] : []),

                  ...((billdata?.customerId?.phone || billdata?.phone_customer) ? [{
                    text: "เบอร์โทร: " + (billdata?.customerId?.phone || billdata?.phone_customer) + "\n",
                    bold: true,
                    fontSize: billTemplate?.fontSize || 12,
                  }] : []),



                ],
              },

            ],
          },
          {
            table: {
              headerRows: 1,
              widths: [50, "*", 50, 80, 80],

              body: [
                // ===== Header =====
                [
                  {
                    text: "ลำดับ",
                    style: "tableHeader",
                    fillColor: billTemplate?.tableHeaderColor || billTemplate?.themcolor || "#22c55e",
                    fillOpacity: 0.22,
                    color: billTemplate?.tableHeaderTextColor || "#111111",
                    bold: true,
                    alignment: "center",
                    margin: [2, 2, 2, 2],
                  },
                  {
                    text: "รายการ",
                    style: "tableHeader",
                    fillColor: billTemplate?.tableHeaderColor || billTemplate?.themcolor || "#22c55e",
                    fillOpacity: 0.22,
                    color: billTemplate?.tableHeaderTextColor || "#111111",
                    bold: true,
                    alignment: "left",
                    margin: [2, 2, 2, 2],
                  },
                  {
                    text: "จำนวน",
                    style: "tableHeader",
                    fillColor: billTemplate?.tableHeaderColor || billTemplate?.themcolor || "#22c55e",
                    fillOpacity: 0.22,
                    color: billTemplate?.tableHeaderTextColor || "#111111",
                    bold: true,
                    alignment: "right",
                    margin: [2, 2, 2, 2],
                  },
                  {
                    text: "ราคา",
                    style: "tableHeader",
                    fillColor: billTemplate?.tableHeaderColor || billTemplate?.themcolor || "#22c55e",
                    fillOpacity: 0.22,
                    color: billTemplate?.tableHeaderTextColor || "#111111",
                    bold: true,
                    alignment: "right",
                    margin: [2, 2, 2, 2],
                  },
                  {
                    text: "รวม",
                    style: "tableHeader",
                    fillColor: billTemplate?.tableHeaderColor || billTemplate?.themcolor || "#22c55e",
                    fillOpacity: 0.22,
                    color: billTemplate?.tableHeaderTextColor || "#111111",
                    bold: true,
                    alignment: "right",
                    margin: [2, 2, 2, 2],
                  },
                ],


                // ===== Items =====
                ...billdata?.products?.map((product: any) => [
                  { text: product.no, margin: [2, 2, 2, 2] },
                  { text: product.name, margin: [2, 2, 2, 2] },
                  { text: product.quantity.toLocaleString("th-TH", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }) || "0", alignment: "right", margin: [2, 2, 2, 2] },
                  { text: product.price.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00", alignment: "right", margin: [2, 2, 2, 2] },
                  { text: product.total.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00", alignment: "right", margin: [2, 2, 2, 2] },
                ]),


              ],
            },
            layout: "noBorders",
          },
          { text: "\n" },
          {
            columns: [
              { width: "*",  table: {
                widths: ["auto", "auto"],
                body: [

                  ...(billdata?.note ? [[
                    "หมายเหตุ:",
                    {
                      text: billdata?.note,
                      bold: true,
                    },
                  ]] : []),
                  ...(billdata?.organizationId?.account_name ? [[
                    "ชื่อบัญชี:",
                    {
                      text: billdata?.organizationId?.account_name,
                      bold: true,
                    },
                  ]] : []),
                  ...((billdata?.organizationId?.bank_name && billdata?.organizationId?.account_no) ? [[
                    "ธนาคาร:",
                    {
                      text: billdata?.organizationId?.bank_name + " เลขที่: " + billdata?.organizationId?.account_no,
                      bold: true,
                      fontSize: billTemplate?.fontSize || 16,
                    },
                  ]] : []),
                  ...(billdata?.organizationId?.prompt_pay ? [[
                    "พร้อมเพย์:",
                    {
                      text: billdata?.organizationId?.prompt_pay,
                      bold: true,
                    },
                  ]] : []),
                ...(bankQrcodeBase64 ? [
                  [
                    "qr code:",
                    {
                      image: bankQrcodeBase64 || "",
                      width:80,
                      height: 80,
                      margin: [0, 0, 0, 5],
                      alignment: "left",

                    },
                  ],
                ] : []),

                ],
              },
              layout: "noBorders", },
              {
                width: "auto",
                table: {
                  widths: ["auto", "auto"],
                  body: [
                    [
                      "ยอดรวม:",
                      {
                        text: (
                          ((billdata?.total ?? 0) + (billdata?.discount ?? 0) - (billdata?.vat ?? 0))
                        ).toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }),
                        bold: true,
                      },
                    ],

                    [
                      "ส่วนลด:",
                      {
                        text: (billdata?.discount ?? 0).toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }),
                        bold: true,
                      },
                    ],

                    [
                      "ภาษีมูลค่าเพิ่ม:",
                      {
                        text: (billdata?.vat ?? 0).toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }),
                        bold: true,
                      },
                    ],

                    [
                      "ยอดสุทธิ:",
                      {
                        text: (billdata?.total ?? 0).toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }),
                        bold: true,
                      },
                    ],
                    // ["ยอดรวม:", { text: (billdata?.total + billdata?.discount || 0).toLocaleString("th-TH", {
                    //   minimumFractionDigits: 2,
                    //   maximumFractionDigits: 2,
                    // }) || "0.00", bold: true }],
                    // ["ส่วนลด:", { text: billdata?.discount?.toLocaleString("th-TH", {
                    //   minimumFractionDigits: 2,
                    //   maximumFractionDigits: 2,
                    // }) || "0.00", bold: true }],
                    // ["ภาษีมูลค่าเพิ่ม:", { text: billdata?.vat?.toLocaleString("th-TH", {
                    //   minimumFractionDigits: 2,
                    //   maximumFractionDigits: 2,
                    // }) || "0.00", bold: true }],
                    // ["ยอดสุทธิ:", { text: ((billdata?.total - billdata?.discount || 0) + billdata?.vat || 0).toLocaleString("th-TH", {
                    //   minimumFractionDigits: 2,
                    //   maximumFractionDigits: 2,
                    // }) || "0.00", bold: true }],

                  ],
                },
                layout: "noBorders",
              },
            ],
          },
          { text: "\n" },


          {
            text: billTemplate?.footerText || "ขอบคุณสำหรับการสั่งซื้อ",
            style: "footer",
            color: billTemplate?.themcolor || "#000000",
            fontSize: 24,
            bold: true,
            alignment: "center" as const,
          },

          {
            text: billTemplate?.footerSubText || "เรียนลูกค้าที่เคารพ กรุณาถ่ายวิดีโอตั้งแต่แกะเทปเปิดลัง ตรวจเช็คสินค้า (ไซส์ น้ำหนัก สภาพ ฯลฯ) ในคลิปเดียวไม่ตัดต่อ และไม่วางทิ้งไว้ก่อนเปิด หากไม่มีคลิปตั้งแต่ต้น ทางร้านขอสงวนสิทธิ์ในการดูแลทุกกรณี",
            style: "footer",
            fontSize: 13,

            alignment: "center" as const,
          },

        ],
      };

      const pdfDoc = printer.createPdfKitDocument(docDefinition as any);
      const fileName = `${billdata?.billNumber}.pdf`;

      const chunks: any[] = [];
      pdfDoc.on("data", (chunk: any) => chunks.push(chunk));
      pdfDoc.end();

      return await new Promise<Buffer>((resolve) => {
        pdfDoc.on("end", () => {
          const pdfBuffer = Buffer.concat(chunks);
          set.headers["Content-Type"] = "application/pdf";
          set.headers["Content-Disposition"] = `inline; filename=${fileName}`;
          resolve(pdfBuffer);
        });
      });
    } catch (error) {
      throw error;
    }
  }
}
