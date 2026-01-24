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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import api from "@/hooks/axios";
import { authClient } from "@/lib/auth-client";
import { useForm, revalidateLogic } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import * as v from "valibot";

export const formSchema = v.object({
  templateType: v.picklist(
    ["basic", "pro"],
    "Template type must be basic or pro",
  ),
  foterText: v.pipe(
    v.string(""),
    v.maxLength(500, "Footer text must be at most 500 characters."),
  ),
  footerSubText: v.pipe(
    v.string(""),
    v.maxLength(500, "Footer sub text must be at most 500 characters."),
  ),
  themcolor: v.pipe(
    v.string(""),
    v.maxLength(7, "Color must be at most 7 characters."),
  ),
  fontSize: v.pipe(
    v.string(""),
    v.maxLength(18, "Font size must be at most 18 characters."),
  ),
  pageSize: v.picklist(
    ["A3", "A4", "A5", "A6"],
    "Page size must be A3, A4, A5, or A6",
  ),
  pageOrientation: v.picklist(
    ["portrait", "landscape"],
    "Page orientation must be portrait or landscape",
  ),
  marginTop: v.pipe(
    v.string(""),
    v.maxLength(10, "Margin must be at most 10 characters."),
  ),
  marginBottom: v.pipe(
    v.string(""),
    v.maxLength(10, "Margin must be at most 10 characters."),
  ),
  marginLeft: v.pipe(
    v.string(""),
    v.maxLength(10, "Margin must be at most 10 characters."),
  ),
  marginRight: v.pipe(
    v.string(""),
    v.maxLength(10, "Margin must be at most 10 characters."),
  ),
  isWatermark: v.optional(v.boolean()),
  tableHeaderColor: v.optional(v.string()),
  tableHeaderTextColor: v.optional(v.string()),
});

type orgData = v.InferOutput<typeof formSchema>;
const defaultValues: orgData = {
  templateType: "basic",
  foterText: "ขอบพระคุณลูกค้าที่ไว้วางใจและเลือกซื้อสินค้าจากเรา",
  footerSubText: "เรียบลูกค้าที่เคารพ กรุณาถ่ายวิดีโอตั้งแต่แกะเทปเปิดลัง ตรวจเช็คสินค้า (ไซส์ น้ำหนัก สภาพ ฯลฯ) ในคลิปเดียวไม่ตัดต่อ และไม่วางทิ้งไว้ก่อนเปิด หากไม่มีคลิปตั้งแต่ต้น ทางร้านขอสงวนสิทธิ์ในการดูแลทุกกรณี",
  themcolor: "",
  fontSize: "14",
  pageSize: "A4",
  pageOrientation: "portrait",
  marginTop: "40",
  marginBottom: "40",
  marginLeft: "40",
  marginRight: "40",
  tableHeaderColor: "#000000",
  tableHeaderTextColor: "#FFFFFF",

  isWatermark: false,
};

export default function BillTem() {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: billTemplate } = useQuery({
    queryKey: ["bill-template", activeOrg?.id],
    queryFn: async () => {
      const response = await api.get(`/bill-template/${activeOrg?.id}`);
      return response.data?.data;
    },
    enabled: !!activeOrg?.id,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const pdfMakeRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const updateBillTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch(`/bill-template/${activeOrg?.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bill-template"] });
      toast.success("แก้ไขรายการใบเสร็จรับเงินสำเร็จ", {
        position: "top-right",
      });
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด", {
        description:
          error?.response?.data?.message ||
          "ไม่สามารถแก้ไขรายการใบเสร็จรับเงินได้",
        position: "top-right",
      });
    },
  });

  const form = useForm({
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: formSchema,
      onSubmit: formSchema,
      onSubmitAsync: async ({ value }) => {
        const formatData = {
          organizationId: activeOrg?.id || "",
          type: value.templateType,
          footerText: value.foterText,
          footerSubText: value.footerSubText,
          themcolor: value.themcolor,
          fontSize: parseInt(value.fontSize),
          typePage: value.pageSize,
          pageOrientation: value.pageOrientation,
          pageMargins: {
            top: parseInt(value.marginTop),
            right: parseInt(value.marginRight),
            bottom: parseInt(value.marginBottom),
            left: parseInt(value.marginLeft),
          },
          tableHeaderColor: value.tableHeaderColor,
          tableHeaderTextColor: value.tableHeaderTextColor,
          isWatermark: value.isWatermark,
        };

        updateBillTemplateMutation.mutate(formatData);
      },
    },
  });

  const createDocDefinition = useCallback((values: orgData) => {
    const margins = [
      parseInt(values.marginLeft) || 26,
      parseInt(values.marginTop) || 26,
      parseInt(values.marginRight) || 26,
      parseInt(values.marginBottom) || 26,
    ];

    // Basic Template - Simple and Clean
    if (values.templateType === "basic") {
      return {
        pageSize: values.pageSize || "A4",
        pageOrientation: values.pageOrientation || "portrait",
        pageMargins: margins,
        info: {
          title: "RE-001-ใบเสร็จรับเงิน",
          author: "billdee",
          subject: "ใบเสร็จรับเงิน",
        },
        footer: function (currentPage: number, pageCount: number) {
          return {
            columns: [
              {
                text: `หน้า ${currentPage} / ${pageCount}`,
                alignment: "left",
                fontSize: parseInt(values.fontSize) || 12,
                width: "50%",
              },
              {
                text: "ออกแบบรายงานด้วยระบบ billdee",
                alignment: "right",
                fontSize: parseInt(values.fontSize) || 12,
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
                    fontSize: parseInt(values.fontSize) || 18,
                  },
                  {
                    text: "ที่อยู่: XXX ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ XXXX\n",
                    bold: true,
                    fontSize: parseInt(values.fontSize) || 12,
                  },
                  {
                    text: "เบอร์โทร: XXX-XXX-XXXX\n",
                    bold: true,
                    fontSize: parseInt(values.fontSize) || 12,
                  },
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
            columns: [
              {
                width: "*",
                text: [
                  {
                    text: "ลูกค้า: คุณทดสอบ ระบบ\n",
                    bold: true,
                    fontSize: parseInt(values.fontSize) || 18,
                  },
                  {
                    text: "ที่อยู่: XXX ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400\n",
                    bold: true,
                    fontSize: parseInt(values.fontSize) || 12,
                  },
                  {
                    text: "เบอร์โทร: XXX-234-5678\n",
                    bold: true,
                    fontSize: parseInt(values.fontSize) || 12,
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
                    fillColor: values.tableHeaderColor || "#22c55e",
                    fillOpacity: 0.22,
                    color: values.tableHeaderTextColor || "#111111",
                    bold: true,
                    alignment: "center",
                    margin: [2, 2, 2, 2],
                  },
                  {
                    text: "รายการ",
                    style: "tableHeader",
                    fillColor: values.tableHeaderColor || "#22c55e",
                    fillOpacity: 0.22,
                    color: values.tableHeaderTextColor || "#111111",
                    bold: true,
                    alignment: "left",
                    margin: [2, 2, 2, 2],
                  },
                  {
                    text: "จำนวน",
                    style: "tableHeader",
                    fillColor: values.tableHeaderColor || "#22c55e",
                    fillOpacity: 0.22,
                    color: values.tableHeaderTextColor || "#111111",
                    bold: true,
                    alignment: "right",
                    margin: [2, 2, 2, 2],
                  },
                  {
                    text: "ราคา",
                    style: "tableHeader",
                    fillColor: values.tableHeaderColor || "#22c55e",
                    fillOpacity: 0.22,
                    color: values.tableHeaderTextColor || "#111111",
                    bold: true,
                    alignment: "right",
                    margin: [2, 2, 2, 2],
                  },
                  {
                    text: "รวม",
                    style: "tableHeader",
                    fillColor: values.tableHeaderColor || "#22c55e",
                    fillOpacity: 0.22,
                    color: values.tableHeaderTextColor || "#111111",
                    bold: true,
                    alignment: "right",
                    margin: [2, 2, 2, 2],
                  },
                ],

                // ===== Items =====
                [
                  { text: "1", alignment: "center", margin: [2, 2, 2, 2] },
                  { text: "สินค้า A", margin: [2, 2, 2, 2] },
                  { text: "2", alignment: "right", margin: [2, 2, 2, 2] },
                  { text: "100.00", alignment: "right", margin: [2, 2, 2, 2] },
                  { text: "200.00", alignment: "right", margin: [2, 2, 2, 2] },
                ],
                [
                  { text: "2", alignment: "center", margin: [2, 2, 2, 2] },
                  { text: "สินค้า B", margin: [2, 2, 2, 2] },
                  { text: "1", alignment: "right", margin: [2, 2, 2, 2] },
                  { text: "500.00", alignment: "right", margin: [2, 2, 2, 2] },
                  { text: "500.00", alignment: "right", margin: [2, 2, 2, 2] },
                ],
                [
                  { text: "3", alignment: "center", margin: [2, 2, 2, 2] },
                  { text: "สินค้า C", margin: [2, 2, 2, 2] },
                  { text: "3", alignment: "right", margin: [2, 2, 2, 2] },
                  { text: "50.00", alignment: "right", margin: [2, 2, 2, 2] },
                  { text: "150.00", alignment: "right", margin: [2, 2, 2, 2] },
                ],
              ],
            },
            layout: "noBorders",
          },
          { text: "\n" },
          {
            columns: [
              {
                width: "*",
                table: {
                  widths: ["auto", "auto"],
                  body: [
                    [
                      "หมายเหตุ:",
                      { text: "ขอบคุณที่ใช้บริการ", bold: true },
                    ],
                    [
                      "ชื่อบัญชี:",
                      { text: "บริษัท ตัวอย่าง จำกัด", bold: true },
                    ],
                    [
                      "ธนาคาร:",
                      { text: "XXXXXX เลขที่: XXX-XXXX-XXXX", bold: true, fontSize: parseInt(values.fontSize) || 16 },
                    ],
                    [
                      "พร้อมเพย์:",
                      { text: "XXXXXXXXX", bold: true },
                    ],
                  ],
                },
                layout: "noBorders",
              },
              {
                width: "auto",
                table: {
                  widths: ["auto", "auto"],
                  body: [
                    [
                      "ยอดรวม:",
                      { text: "850.00", bold: true },
                    ],
                    [
                      "ส่วนลด:",
                      { text: "0.00", bold: true },
                    ],
                    [
                      "ภาษีมูลค่าเพิ่ม:",
                      { text: "0.00", bold: true },
                    ],
                    [
                      "ยอดสุทธิ:",
                      { text: "850.00", bold: true },
                    ],
                  ],
                },
                layout: "noBorders",
              },
            ],
          },
          { text: "\n" },
          {
            text: values.foterText || "ขอบคุณสำหรับการสั่งซื้อ",
            style: "footer",
            fontSize: 16,
            alignment: "center" as const,
          },
          {
            text: values.footerSubText || "เรียนลูกค้าที่เคารพ กรุณาตรวจสอบสินค้าก่อนรับ",
            style: "footer",
            fontSize: 13,
            alignment: "center" as const,
          },
        ],
        defaultStyle: {
          fontSize: parseInt(values.fontSize) || 14,
          font: "THSarabunNew",
        },
        styles: {
          footer: { fontSize: parseInt(values.fontSize) || 12, italics: true },
        },
      };
    }
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
    [createDocDefinition, pdfUrl],
  );
  useEffect(() => {
    if (billTemplate) {
      form.setFieldValue("templateType", billTemplate.type);
      form.setFieldValue("foterText", billTemplate.footerText);
      form.setFieldValue("footerSubText", billTemplate.footerSubText || "");
      form.setFieldValue("themcolor", billTemplate.themcolor || "");
      form.setFieldValue("fontSize", billTemplate.fontSize.toString() || "");
      form.setFieldValue("pageSize", billTemplate.typePage || "");
      form.setFieldValue("pageOrientation", billTemplate.pageOrientation || "");
      form.setFieldValue(
        "marginTop",
        billTemplate.pageMargins.top.toString() || "",
      );
      form.setFieldValue(
        "marginBottom",
        billTemplate.pageMargins.bottom.toString() || "",
      );
      form.setFieldValue(
        "marginLeft",
        billTemplate.pageMargins.left.toString() || "",
      );
      form.setFieldValue(
        "marginRight",
        billTemplate.pageMargins.right.toString() || "",
      );
      form.setFieldValue(
        "tableHeaderColor",
        billTemplate.tableHeaderColor || "#000000",
      );
      form.setFieldValue(
        "tableHeaderTextColor",
        billTemplate.tableHeaderTextColor || "#FFFFFF",
      );
      form.setFieldValue(
        "isWatermark",
        billTemplate.isWatermark || false,
      );

      // Generate PDF with loaded data
      setTimeout(() => {
        if (pdfMakeRef.current) {
          generatePDF(form.state.values);
        }
      }, 100);
    }
  }, [billTemplate]); // Only depend on billTemplate

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
          "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js",
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

        // Generate initial preview using current form values
        const docDefinition = createDocDefinition(form.state.values);
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
    // Manually generate PDF after save
    generatePDF(form.state.values);
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
                              ${field.state.value === "basic"
                                ? "border-primary bg-linear-to-br from-primary/10 via-primary/5 to-transparent shadow-lg shadow-primary/20 scale-[1.02]"
                                : "border-border/60 bg-white dark:bg-zinc-900 hover:border-primary/40 hover:shadow-md hover:scale-[1.01]"
                              }
                            `}
                          >
                            <div className="flex flex-col items-center justify-center h-full space-y-2">
                              <div
                                className={`
                                w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300
                                ${field.state.value === "basic"
                                    ? "bg-primary/10"
                                    : "bg-muted group-hover:bg-primary/5"
                                  }
                              `}
                              >
                                <svg
                                  className={`w-8 h-8 transition-colors ${field.state.value === "basic"
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
                                className={`text-2xl font-semibold transition-colors ${field.state.value === "basic"
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
                        <FieldLabel htmlFor={field.name} className="text-base font-normal">
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
                          <FieldDescription className="text-base font-normal">
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
                        <FieldLabel htmlFor={field.name} className="text-base font-normal">
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
                          <FieldDescription className="text-base font-normal">
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
                        <FieldLabel htmlFor={field.name} className="text-base font-normal">
                          สีหัวข้อใบเสร็จรับเงิน
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
                  name="tableHeaderColor"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="text-base font-normal">
                          สีพื้นหลังหัวตาราง

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
                        {isInvalid ? (
                          <FieldError errors={field.state.meta.errors} />
                        ) : (
                          <FieldDescription className="text-base font-normal">
                            สีพื้นหลังของหัวตารางรายการสินค้า
                          </FieldDescription>
                        )}
                      </Field>
                    );
                  }}
                />
              </div>
              <div className="col-span-full">
                <form.Field
                  name="tableHeaderTextColor"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="text-base font-normal">
                          สีตัวอักษรหัวตาราง
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
                        {isInvalid ? (
                          <FieldError errors={field.state.meta.errors} />
                        ) : (
                          <FieldDescription>
                            สีตัวอักษรของหัวตารางรายการสินค้า
                          </FieldDescription>
                        )}
                      </Field>
                    );
                  }}
                />
              </div>
              <div className="col-span-full">
                <form.Field
                  name="isWatermark"
                  children={(field) => {
                    return (
                      <Field className="gap-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <FieldLabel htmlFor={field.name} className="text-base font-normal">
                              ลายน้ำ (Watermark)
                            </FieldLabel>
                            <FieldDescription className="text-base font-normal">
                              แสดงลายน้ำบนใบเสร็จรับเงินจะเป็นโลโก้ของร้านค้า
                            </FieldDescription>
                          </div>
                          <Switch
                            id={field.name}
                            checked={field.state.value || false}
                            onCheckedChange={(checked) => field.handleChange(checked)}
                          />
                        </div>
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
                        <FieldLabel htmlFor={field.name} className="text-base font-normal">ขนาดฟอนต์</FieldLabel>
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

              <Separator className="my-2" />
              <div className="col-span-full">
                <h3 className="font-normal text-foreground text-base mb-3">
                  ตั้งค่ากระดาษ
                </h3>
              </div>

              <div className="col-span-full">
                <form.Field
                  name="pageSize"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="text-base font-normal"  >ขนาดกระดาษ</FieldLabel>
                        <div className="grid grid-cols-4 gap-3">
                          {["A3", "A4", "A5", "A6"].map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => field.handleChange(size as any)}
                              className={`
                                h-20 rounded-lg border-2 transition-all duration-200
                                ${field.state.value === size
                                  ? "border-primary bg-primary/10 shadow-md"
                                  : "border-border/60 bg-white dark:bg-zinc-900 hover:border-primary/40"
                                }
                              `}
                            >
                              <div className="flex flex-col items-center justify-center h-full">
                                <span
                                  className={`text-lg font-semibold ${field.state.value === size
                                    ? "text-primary"
                                    : "text-foreground"
                                    }`}
                                >
                                  {size}
                                </span>
                              </div>
                            </button>
                          ))}
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
                  name="pageOrientation"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="text-base font-normal">แนวกระดาษ</FieldLabel>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => field.handleChange("portrait")}
                            className={`
                              h-32 rounded-lg border-2 transition-all duration-200
                              ${field.state.value === "portrait"
                                ? "border-primary bg-primary/10 shadow-md"
                                : "border-border/60 bg-white dark:bg-zinc-900 hover:border-primary/40"
                              }
                            `}
                          >
                            <div className="flex flex-col items-center justify-center h-full space-y-2">
                              <div
                                className={`w-12 h-16 border-2 rounded ${field.state.value === "portrait"
                                  ? "border-primary"
                                  : "border-muted-foreground"
                                  }`}
                              />
                              <span
                                className={`text-base font-medium ${field.state.value === "portrait"
                                  ? "text-primary"
                                  : "text-foreground"
                                  }`}
                              >
                                แนวตั้ง
                              </span>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => field.handleChange("landscape")}
                            className={`
                              h-32 rounded-lg border-2 transition-all duration-200
                              ${field.state.value === "landscape"
                                ? "border-primary bg-primary/10 shadow-md"
                                : "border-border/60 bg-white dark:bg-zinc-900 hover:border-primary/40"
                              }
                            `}
                          >
                            <div className="flex flex-col items-center justify-center h-full space-y-2">
                              <div
                                className={`w-16 h-12 border-2 rounded ${field.state.value === "landscape"
                                  ? "border-primary"
                                  : "border-muted-foreground"
                                  }`}
                              />
                              <span
                                className={`text-base font-medium ${field.state.value === "landscape"
                                  ? "text-primary"
                                  : "text-foreground"
                                  }`}
                              >
                                แนวนอน
                              </span>
                            </div>
                          </button>
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
                <FieldLabel className="mb-3 text-base font-normal">ระยะขอบกระดาษ (px)</FieldLabel>
                <div className="grid grid-cols-2 gap-4">
                  <form.Field
                    name="marginTop"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid} className="gap-2">
                          <FieldLabel htmlFor={field.name} className="text-base font-normal">
                            ขอบบน
                          </FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              id={field.name}
                              name={field.name}
                              type="number"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="40"
                            />
                          </InputGroup>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  />
                  <form.Field
                    name="marginBottom"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid} className="gap-2">
                          <FieldLabel htmlFor={field.name} className="text-base font-normal ">
                            ขอบล่าง
                          </FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              id={field.name}
                              name={field.name}
                              type="number"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="40"
                            />
                          </InputGroup>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  />
                  <form.Field
                    name="marginLeft"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid} className="gap-2">
                          <FieldLabel htmlFor={field.name} className="text-base font-normal">
                            ขอบซ้าย
                          </FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              id={field.name}
                              name={field.name}
                              type="number"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="40"
                            />
                          </InputGroup>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  />
                  <form.Field
                    name="marginRight"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid} className="gap-2">
                          <FieldLabel htmlFor={field.name} className="text-base font-normal ">
                            ขอบขวา
                          </FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              id={field.name}
                              name={field.name}
                              type="number"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="40"
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
            </div>

            <Separator className="my-4" />
            <div className="flex items-center justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out font-semibold tracking-widest"
                onClick={() => router.back()}
              >
                ย้อนกลับ
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out font-semibold tracking-widest"
                onClick={handlePreview}
                disabled={isLoading}
              >
                พรีวิว
              </Button>
              <Button
                type="button"
                size="lg"
                className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out font-semibold tracking-widest"
                onClick={handleSaveAndPreview}
                disabled={isLoading}
              >
                บันทึกและพรีวิว
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Right Side - PDF Preview */}
      <div className="lg:sticky lg:top-8 lg:self-start bg-white dark:bg-zinc-900 flex-col rounded-2xl shadow-xl border border-border/50 p-6 h-fit">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="font-normal tracking-widest text-foreground dark:text-foreground text-xl">
              พรีวิวใบเสร็จรับเงิน
            </h2>
            <p className="mt-1 text-base font-normal tracking-widest leading-6 text-muted-foreground dark:text-muted-foreground">
              พรีวิวใบเสร็จรับเงินของคุณ
            </p>
          </div>

          <div className="border border-border/50 rounded-lg overflow-hidden bg-gray-50 dark:bg-zinc-800 h-[calc(100vh-16rem)]">
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
                  คลิก "พรีวิว" หรือ "บันทึกและพรีวิว" เพื่อดูใบเสร็จรับเงิน
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
