"use client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

import { InputGroup, InputGroupInput } from "@/components/ui/input-group";

import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useForm, revalidateLogic } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import * as v from "valibot";

export const formSchema = v.object({
  name: v.pipe(
    v.string(""),
    v.maxLength(255, "Name must be at most 255 characters.")
  ),
  templateType: v.picklist(
    ["basic", "pro"],
    "Template type must be basic or pro"
  ),
  foterText: v.pipe(
    v.string(""),
    v.maxLength(500, "Footer text must be at most 500 characters.")
  ),
  footerSubText: v.pipe(
    v.string(""),
    v.maxLength(500, "Footer sub text must be at most 500 characters.")
  ),
  themcolor: v.pipe(
    v.string(""),
    v.maxLength(7, "Color must be at most 7 characters.")
  ),
  fontSize: v.pipe(
    v.string(""),
    v.maxLength(18, "Font size must be at most 18 characters.")
  ),
});

type orgData = v.InferOutput<typeof formSchema>;
const defaultValues: orgData = {
  name: "",
  templateType: "basic",
  foterText: "Thank you for your business",
  footerSubText: "Thank you for your business",
  themcolor: "#000000",
  fontSize: "12",
};

export default function BillTem() {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const pdfMakeRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();

  const form = useForm({
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: formSchema,
      onSubmit: formSchema,
      onSubmitAsync: async ({ value }) => {},
    },
  });

  const createDocDefinition = useCallback((values: orgData) => {
    // Basic Template - Simple and Clean
    if (values.templateType === "basic") {
      return {
        content: [
          {
            text: "ใบเสร็จรับเงิน",
            style: "header",
            color: values.themcolor || "#000000",
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
                    text: "บริษัท ตัวอย่าง จำกัด\n",
                    bold: true,
                    fontSize: 18,
                  },
                  "123 กรุงเทพมหานคร 10110\n",
                  "โทร: 02-123-4567",
                ],
              },
              {
                width: "auto",
                text: [
                  { text: "วันที่: ", bold: true },
                  new Date().toLocaleDateString("th-TH", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }) + "\n",
                  { text: "เลขที่บิล: ", bold: true },
                  "RE-001",
                ],
                alignment: "right" as const,
              },
            ],
          },
          { text: "\n" },
          {
            table: {
              headerRows: 1,
              widths: ["*", 50, 80, 80],
              body: [
                // ===== Header =====
                [
                  {
                    text: "รายการ",
                    style: "tableHeader",
                    fontSize: parseInt(values.fontSize) || 12,
                    fillColor: values.themcolor || "#444444",
                    color: "#FFFFFF",

                    margin: [5, 2, 5, 2],
                  },
                  {
                    text: "จำนวน",
                    style: "tableHeader",
                    fillColor: values.themcolor || "#000000",
                    color: "#ffffff",
                    alignment: "right",
                    margin: [5, 2, 5, 2],
                  },
                  {
                    text: "ราคา",
                    style: "tableHeader",
                    fillColor: values.themcolor || "#000000",
                    color: "#ffffff",
                    alignment: "right",
                    margin: [5, 2, 5, 2],
                  },
                  {
                    text: "รวม",
                    style: "tableHeader",
                    fillColor: values.themcolor || "#000000",
                    color: "#ffffff",
                    alignment: "right",
                    margin: [5, 2, 5, 2],
                  },
                ],

                // ===== Items =====
                [
                  { text: "สินค้า A", margin: [5, 6, 5, 6] },
                  { text: "2", alignment: "right", margin: [5, 6, 5, 6] },
                  { text: "100.00", alignment: "right", margin: [5, 6, 5, 6] },
                  { text: "200.00", alignment: "right", margin: [5, 6, 5, 6] },
                ],
                [
                  { text: "สินค้า B", margin: [5, 6, 5, 6] },
                  { text: "1", alignment: "right", margin: [5, 6, 5, 6] },
                  { text: "500.00", alignment: "right", margin: [5, 6, 5, 6] },
                  { text: "500.00", alignment: "right", margin: [5, 6, 5, 6] },
                ],
                [
                  { text: "สินค้า C", margin: [5, 6, 5, 6] },
                  { text: "3", alignment: "right", margin: [5, 6, 5, 6] },
                  { text: "50.00", alignment: "right", margin: [5, 6, 5, 6] },
                  { text: "150.00", alignment: "right", margin: [5, 6, 5, 6] },
                ],
              ],
            },
            layout: "noBorders",
          },
          { text: "\n" },
          {
            columns: [
              { width: "*", text: "" },
              {
                width: "auto",
                table: {
                  widths: ["auto", "auto"],
                  body: [
                    ["ส่วนลด:", { text: "850.00 บาท", bold: true }],
                    ["ภาษีมูลค่าเพิ่ม:", { text: "850.00 บาท", bold: true }],
                    ["ยอดรวม:", { text: "850.00 บาท", bold: true }],
                  ],
                },
                layout: "noBorders",
              },
            ],
          },

          { text: "\n" },
          {
            text: values.foterText || "Thank you for your business",
            style: "footer",
            fontSize: 18,
            alignment: "center" as const,
          },

          {
            text: values.footerSubText || "Thank you for your business",
            style: "footer",

            fontSize: 16,
            alignment: "center" as const,
          },
        ],
        defaultStyle: {
          fontSize: parseInt(values.fontSize) || 16,
          font: "THSarabunNew",
        },
        styles: {
          footer: { fontSize: parseInt(values.fontSize) || 12, italics: true },
        },
      };
    }

    // Pro Template - Advanced with more details
    return {
      content: [
        {
          columns: [
            {
              width: "*",
              stack: [
                {
                  text: "ใบเสร็จรับเงิน",
                  style: "header",
                  color: values.themcolor || "#000000",
                },
                // {
                //   text: "แบบฟอร์มแบบมืออาชีพ",
                //   style: "subheader",
                //   color: "#666666",
                // },
              ],
            },
            {
              image:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
              width: 60,
              height: 60,
            },
          ],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 5,
              x2: 515,
              y2: 5,
              lineWidth: 2,
              lineColor: values.themcolor || "#000000",
            },
          ],
        },
        { text: "\n" },
        {
          columns: [
            {
              width: "50%",
              stack: [
                { text: "จาก:", style: "sectionHeader" },
                { text: "บริษัท ตัวอย่าง จำกัด", bold: true, fontSize: 16 },
                { text: "123 ถนนกรุงเทพ" },
                { text: "กรุงเทพมหานคร 10110, ประเทศไทย" },
                { text: "โทร: 02-123-4567" },
                { text: "อีเมล: info@company.com" },
              ],
            },
            {
              width: "50%",
              stack: [
                { text: "รายละเอียดบิล:", style: "sectionHeader" },
                {
                  table: {
                    widths: ["auto", "*"],
                    body: [
                      [{ text: "เลขที่:", bold: true }, "INV-001"],
                      [{ text: "วันที่:", bold: true }, "17/01/2026"],
                      [{ text: "ครบกำหนด:", bold: true }, "31/01/2026"],
                      [{ text: "เงื่อนไขชำระ:", bold: true }, "Net 30"],
                    ],
                  },
                  layout: "noBorders",
                },
              ],
            },
          ],
        },
        { text: "\n" },
        {
          table: {
            headerRows: 1,
            widths: ["*", 60, 80, 80, 100],
            body: [
              [
                {
                  text: "รายละเอียด",
                  style: "tableHeader",
                  fillColor: values.themcolor || "#000000",
                  color: "#ffffff",
                },
                {
                  text: "จำนวน",
                  style: "tableHeader",
                  fillColor: values.themcolor || "#000000",
                  color: "#ffffff",
                  alignment: "center" as const,
                },
                {
                  text: "ราคาต่อหน่วย",
                  style: "tableHeader",
                  fillColor: values.themcolor || "#000000",
                  color: "#ffffff",
                  alignment: "right" as const,
                },
                {
                  text: "ส่วนลด",
                  style: "tableHeader",
                  fillColor: values.themcolor || "#000000",
                  color: "#ffffff",
                  alignment: "right" as const,
                },
                {
                  text: "จำนวนเงิน",
                  style: "tableHeader",
                  fillColor: values.themcolor || "#000000",
                  color: "#ffffff",
                  alignment: "right" as const,
                },
              ],
              [
                { text: "สินค้า A\nสินค้าคุณภาพดี", fontSize: 14 },
                { text: "2", alignment: "center" as const },
                { text: "100.00", alignment: "right" as const },
                { text: "0.00", alignment: "right" as const },
                { text: "200.00", alignment: "right" as const, bold: true },
              ],
              [
                { text: "สินค้า B\nสินค้ามาตรฐาน", fontSize: 14 },
                { text: "1", alignment: "center" as const },
                { text: "500.00", alignment: "right" as const },
                { text: "0.00", alignment: "right" as const },
                { text: "500.00", alignment: "right" as const, bold: true },
              ],
              [
                { text: "Product C\nEconomy Pack", fontSize: 10 },
                { text: "3", alignment: "center" as const },
                { text: "50.00", alignment: "right" as const },
                { text: "0.00", alignment: "right" as const },
                { text: "150.00", alignment: "right" as const, bold: true },
              ],
            ],
          },
        },
        { text: "\n" },
        {
          columns: [
            { width: "*", text: "" },
            {
              width: 200,
              table: {
                widths: ["*", "auto"],
                body: [
                  ["Subtotal:", "850.00"],
                  ["Tax (0%):", "0.00"],
                  [
                    { text: "Total:", bold: true, fontSize: 14 },
                    {
                      text: "850.00 Baht",
                      bold: true,
                      fontSize: 14,
                      color: values.themcolor || "#000000",
                    },
                  ],
                ],
              },
              layout: {
                hLineWidth: (i: number) => (i === 2 ? 1 : 0),
                vLineWidth: () => 0,
                hLineColor: () => "#cccccc",
              },
            },
          ],
        },
        { text: "\n\n" },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 1,
              lineColor: "#cccccc",
            },
          ],
        },
        { text: "\n" },
        {
          text: values.foterText || "Thank you for your business",
          style: "footer",
          alignment: "center" as const,
        },
        {
          text: "For any questions, please contact us at info@company.com",
          fontSize: 8,
          alignment: "center" as const,
          color: "#999999",
        },
      ],
      defaultStyle: {
        fontSize: parseInt(values.fontSize) || 16,
        font: "THSarabunNew",
      },
      styles: {
        header: { fontSize: 32, bold: true, margin: [0, 0, 0, 5] },
        subheader: { fontSize: 10, italics: true, margin: [0, 0, 0, 10] },
        sectionHeader: {
          fontSize: 12,
          bold: true,
          margin: [0, 0, 0, 5],
          color: values.themcolor || "#000000",
        },
        tableHeader: {
          bold: true,
          fontSize: parseInt(values.fontSize) || 11,
        },
        footer: {
          fontSize: parseInt(values.fontSize) || 11,
          bold: true,
          margin: [0, 5, 0, 5],
        },
      },
    };
  }, []);

  const generatePDF = useCallback(
    async (values: orgData) => {
      const pdfMake = pdfMakeRef.current;
      if (!pdfMake) {
        toast.error("PDF library not loaded yet");
        return;
      }

      try {
        const docDefinition = createDocDefinition(values);
        const pdfDoc = pdfMake.createPdf(docDefinition, null, pdfMake.fonts);

        pdfDoc.getBlob((blob: Blob) => {
          if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
          }
          const newUrl = URL.createObjectURL(blob);
          setPdfUrl(newUrl);
        });
      } catch (err) {
        toast.error("Failed to generate PDF");
      }
    },
    [createDocDefinition, pdfUrl]
  );

  // Load pdfMake on mount
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // Load pdfmake via script tags for better compatibility
        const loadScript = (src: string): Promise<void> => {
          return new Promise((resolve, reject) => {
            // Check if already loaded
            if (document.querySelector(`script[src="${src}"]`)) {
              resolve();
              return;
            }
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
          });
        };

        // Load from CDN
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js"
        );

        // Wait for pdfMake to be available on window
        let pdfMake = (window as any).pdfMake;
        let attempts = 0;
        while (!pdfMake && attempts < 50) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          pdfMake = (window as any).pdfMake;
          attempts++;
        }

        if (!pdfMake) {
          throw new Error("pdfMake not found on window after loading");
        }

        // Load custom Thai font after pdfMake is ready
        await loadScript("/fonts/vfs_fonts.js");

        // Wait for vfs to be available
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Configure Thai fonts
        pdfMake.fonts = {
          THSarabunNew: {
            normal: "THSarabunNew.ttf",
            bold: "THSarabunNew.ttf",
            italics: "THSarabunNew.ttf",
            bolditalics: "THSarabunNew.ttf",
          },
          Roboto: {
            normal: "Roboto-Regular.ttf",
            bold: "Roboto-Medium.ttf",
            italics: "Roboto-Italic.ttf",
            bolditalics: "Roboto-MediumItalic.ttf",
          },
        };

        if (!mounted) return;

        pdfMakeRef.current = pdfMake;
        setIsLoading(false);

        // Generate initial preview using default values
        const docDefinition = createDocDefinition(defaultValues);
        const pdfDoc = pdfMake.createPdf(docDefinition, null, pdfMake.fonts);
        pdfDoc.getBlob((blob: Blob) => {
          if (!mounted) return;

          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        });
      } catch (err) {
        console.error("Failed to load pdfMake:", err);
        if (mounted) {
          setError("Failed to load PDF library: " + (err as Error).message);
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const handlePreview = () => {
    if (!pdfMakeRef.current) {
      toast.error("PDF library is still loading...");
      return;
    }
    generatePDF(form.state.values);
  };

  const handleSaveAndPreview = async () => {
    if (!pdfMakeRef.current) {
      toast.error("PDF library is still loading...");
      return;
    }
    await form.handleSubmit();
    generatePDF(form.state.values);
    toast.success("Settings saved successfully");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-8 px-6 w-full">
      {/* Left Side - Form */}
      <div className="bg-white dark:bg-zinc-900 flex-col rounded-2xl shadow-xl border border-border/50 p-6">
        <form
          id="form-organization"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-normal tracking-widest text-foreground dark:text-foreground text-xl">
                ตั้งค่ารูปแบบบิล
              </h2>
              <p className="mt-1 text-base font-normal tracking-widest leading-6 text-muted-foreground dark:text-muted-foreground">
                ตั้งค่ารูปแบบบิลของคุณ
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="col-span-full">
                <form.Field
                  name="templateType"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-3">
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-base font-semibold"
                        >
                          รูปแบบบิล
                        </FieldLabel>
                        <div className="grid grid-cols-2 gap-6">
                          <button
                            type="button"
                            onClick={() => field.handleChange("basic")}
                            className={`
                              group relative h-36 rounded-2xl border-2 transition-all duration-300 ease-out
                              ${
                                field.state.value === "basic"
                                  ? "border-primary bg-linear-to-br from-primary/10 via-primary/5 to-transparent shadow-lg shadow-primary/20 scale-[1.02]"
                                  : "border-border/60 bg-white dark:bg-zinc-900 hover:border-primary/40 hover:shadow-md hover:scale-[1.01]"
                              }
                            `}
                          >
                            <div className="flex flex-col items-center justify-center h-full space-y-2">
                              <div
                                className={`
                                w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300
                                ${
                                  field.state.value === "basic"
                                    ? "bg-primary/10"
                                    : "bg-muted group-hover:bg-primary/5"
                                }
                              `}
                              >
                                <svg
                                  className={`w-8 h-8 transition-colors ${
                                    field.state.value === "basic"
                                      ? "text-primary"
                                      : "text-muted-foreground group-hover:text-primary"
                                  }`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              </div>
                              <span
                                className={`text-2xl font-semibold transition-colors ${
                                  field.state.value === "basic"
                                    ? "text-primary"
                                    : "text-foreground group-hover:text-primary"
                                }`}
                              >
                                พื้นฐาน
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Simple & Clean
                              </span>
                            </div>
                            {field.state.value === "basic" && (
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-linear-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                                <svg
                                  className="w-5 h-5 text-white"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="3"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path d="M5 13l4 4L19 7"></path>
                                </svg>
                              </div>
                            )}
                          </button>
                          {/* <button
                            type="button"
                            onClick={() => field.handleChange("pro")}
                            className={`
                              group relative h-36 rounded-2xl border-2 transition-all duration-300 ease-out
                              ${
                                field.state.value === "pro"
                                  ? "border-primary bg-linear-to-br from-primary/10 via-primary/5 to-transparent shadow-lg shadow-primary/20 scale-[1.02]"
                                  : "border-border/60 bg-white dark:bg-zinc-900 hover:border-primary/40 hover:shadow-md hover:scale-[1.01]"
                              }
                            `}
                          >
                            <div className="flex flex-col items-center justify-center h-full space-y-2">
                              <div
                                className={`
                                w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300
                                ${
                                  field.state.value === "pro"
                                    ? "bg-primary/10"
                                    : "bg-muted group-hover:bg-primary/5"
                                }
                              `}
                              >
                                <svg
                                  className={`w-8 h-8 transition-colors ${
                                    field.state.value === "pro"
                                      ? "text-primary"
                                      : "text-muted-foreground group-hover:text-primary"
                                  }`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                  />
                                </svg>
                              </div>
                              <span
                                className={`text-2xl font-semibold transition-colors ${
                                  field.state.value === "pro"
                                    ? "text-primary"
                                    : "text-foreground group-hover:text-primary"
                                }`}
                              >
                                ขั้นสูง
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Advanced Features
                              </span>
                            </div>
                            {field.state.value === "pro" && (
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-linear-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                                <svg
                                  className="w-5 h-5 text-white"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="3"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path d="M5 13l4 4L19 7"></path>
                                </svg>
                              </div>
                            )}
                          </button> */}
                        </div>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </div>
              <div className="col-span-full">
                <form.Field
                  name="foterText"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>
                          ข้อความท้ายบิล
                        </FieldLabel>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          className="h-24"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="e.g., Thank you for your business"
                        />
                        {isInvalid ? (
                          <FieldError errors={field.state.meta.errors} />
                        ) : (
                          <FieldDescription>
                            ข้อความท้ายบิลจะปรากฏด้านล่างของบิล
                          </FieldDescription>
                        )}
                      </Field>
                    );
                  }}
                />
              </div>
              <div className="col-span-full">
                <form.Field
                  name="footerSubText"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>
                          ข้อความท้ายบิลย่อย
                        </FieldLabel>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          className="h-24"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="e.g., Thank you for your business"
                        />
                        {isInvalid ? (
                          <FieldError errors={field.state.meta.errors} />
                        ) : (
                          <FieldDescription>
                            ข้อความท้ายบิลย่อยจะปรากฏด้านล่างของข้อความท้ายบิล
                          </FieldDescription>
                        )}
                      </Field>
                    );
                  }}
                />
              </div>
              <div className="col-span-full">
                <form.Field
                  name="themcolor"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>
                          Theme Color
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            type="color"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                          />
                        </InputGroup>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </div>
              <div className="col-span-full">
                <form.Field
                  name="fontSize"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>Font Size</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="e.g., 12"
                          />
                        </InputGroup>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </div>
            </div>

            <Separator className="my-4" />
            <div className="flex items-center justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out"
                onClick={() => router.back()}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out"
                onClick={handlePreview}
                disabled={isLoading}
              >
                Preview
              </Button>
              <Button
                type="button"
                size="lg"
                className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out"
                onClick={handleSaveAndPreview}
                disabled={isLoading}
              >
                Save & Preview
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Right Side - PDF Preview */}
      <div className="bg-white dark:bg-zinc-900 flex-col rounded-2xl shadow-xl border border-border/50 p-6">
        <div className="flex flex-col gap-4 h-full">
          <div>
            <h2 className="font-semibold text-foreground dark:text-foreground text-xl">
              Bill Preview
            </h2>
            <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-muted-foreground">
              PDF preview of your bill template
            </p>
          </div>

          <div className="flex-1 border border-border/50 rounded-lg overflow-hidden bg-gray-50 dark:bg-zinc-800 min-h-150">
            {error ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-red-500">{error}</p>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading PDF library...</p>
              </div>
            ) : pdfUrl ? (
              <iframe
                ref={iframeRef}
                src={pdfUrl}
                className="w-full h-full"
                title="PDF Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  Click "Preview" or "Save & Preview" to see the bill
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
