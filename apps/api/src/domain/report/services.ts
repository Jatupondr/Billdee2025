
import { Bill } from "../../../models/model";
import generatePayload from "promptpay-qr";
const PdfPrinter = require("pdfmake/src/printer");
export abstract class reportService {
  static async receipt(id: string, set: any, query: any) {
    try {
      const billdata:any = await Bill.findOne({ _id: id, isDeleted: false })
      .populate("customerId", "name email phone address district subDistrict province postalCode")
      .populate("userId", "name email")
      // .populate("products.productId", "name")
      .populate("organizationId", "name  phone address district subDistrict province postalCode account_name account_no bank_name prompt_pay")
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

      const docDefinition = {
        pageSize: "A4",
        pageMargins: [26, 26, 36, 36],
        defaultStyle: { font: "THSarabunNew", fontSize: 14 },
        info: {
          title: `${billdata.billNumber}-ใบเสร็จรับเงิน`,
          author: "billdee",
          subject: "ใบเสร็จรับเงิน",
          keywords: `ใบเสร็จรับเงิน, ${billdata.billNumber}`,
          filename: `${billdata.billNumber}-ใบเสร็จรับเงิน.pdf`,
        },
        footer: function (currentPage: number, pageCount: number) {
          return {
            columns: [
              {
                text: `หน้า ${currentPage} / ${pageCount}`,
                alignment: "left",
                fontSize: 12,
                width: "50%",
              },
              {
                text: "ออกแบบรายงานด้วยระบบ billdee",
                alignment: "right",
                fontSize: 12,
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
            color:  "#000000",
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
                    text: billdata?.organizationId?.name + "\n" || "-" ,
                    bold: true,
                    fontSize: 18,
                  },
                  {
                    text: "ที่อยู่: " + billdata?.organizationId?.address + " " + billdata?.organizationId?.subDistrict + " " + billdata?.organizationId?.district + " " + billdata?.organizationId?.province + " " +  billdata?.organizationId?.postalCode + "\n" || "-" ,
                    bold: true,
                    fontSize: 12,
                  },
                  {
                    text: "เบอร์โทร: " + billdata?.organizationId?.phone + "\n" || "-" ,
                    bold: true,
                    fontSize: 12,
                  },


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
                    text: "ลูกค้า: " + billdata?.customerId?.name + "\n" || "-" ,
                    bold: true,
                    fontSize: 18,
                  },
                  {
                    text: "ที่อยู่: " + billdata?.customerId?.address + " " + billdata?.customerId?.subDistrict + " " + billdata?.customerId?.district + " " + billdata?.customerId?.province + " " +  billdata?.customerId?.postalCode + "\n" || "-" ,
                    bold: true,
                    fontSize: 12,
                  },
                  {
                    text: "เบอร์โทร: " + billdata?.customerId?.phone + "\n" || "-" ,
                    bold: true,
                    fontSize: 12,
                  },



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
                    fillColor: "#000000",
                    color: "#ffffff",
                    alignment: "left",
                    margin: [5, 2, 5, 2],
                  },
                  {
                    text: "รายการ",
                    style: "tableHeader",
                    fillColor: "#000000",
                    color: "#FFFFFF",
                    margin: [5, 2, 5, 2],
                  },
                  {
                    text: "จำนวน",
                    style: "tableHeader",
                    fillColor: "#000000",
                    color: "#ffffff",
                    alignment: "right",
                    margin: [5, 2, 5, 2],
                  },
                  {
                    text: "ราคา",
                    style: "tableHeader",
                    fillColor: "#000000",
                    color: "#ffffff",
                    alignment: "right",
                    margin: [5, 2, 5, 2],
                  },
                  {
                    text: "รวม",
                    style: "tableHeader",
                    fillColor: "#000000",
                    color: "#ffffff",
                    alignment: "right",
                    margin: [5, 2, 5, 2],
                  },
                ],

                // ===== Items =====
                ...billdata?.products?.map((product: any) => [
                  { text: product.no, margin: [5, 6, 5, 6] },
                  { text: product.name, margin: [5, 6, 5, 6] },
                  { text: product.quantity.toLocaleString("th-TH", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }) || "0", alignment: "right", margin: [5, 6, 5, 6] },
                  { text: product.price.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00", alignment: "right", margin: [5, 6, 5, 6] },
                  { text: product.total.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00", alignment: "right", margin: [5, 6, 5, 6] },
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

                  [
                    "หมายเหตุ:",
                    {
                      text:billdata?.note || "-",
                      bold: true,
                    },
                  ],
                  [
                    "ชื่อบัญชี:",
                    {
                      text:billdata?.organizationId?.account_name || "-",
                      bold: true,
                    },
                  ],
                  [
                    "ธนาคาร:",
                    {
                      text:   billdata?.organizationId?.bank_name + " เลขที่: " + billdata?.organizationId?.account_no || "-",
                      bold: true,
                      fontSize: 16,
                    },
                  ],

                  [
                    "พร้อมเพย์:",
                    {
                      text:billdata?.organizationId?.prompt_pay || "-",
                      bold: true,
                    },
                  ],
                  [
                    "qr code:",
                    {
                      image: bankQrcodeBase64,
                      width:80,
                      height: 80,
                      margin: [0, 0, 0, 5],
                      alignment: "left",

                    },
                  ],


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
            text: "ขอบคุณสำหรับการสั่งซื้อ",
            style: "footer",
            fontSize: 18,
            alignment: "center" as const,
          },

          {
            text: "ขอบคุณสำหรับการสั่งซื้อ",
            style: "footer",

            fontSize: 16,
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
