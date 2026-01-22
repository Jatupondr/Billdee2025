"use client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { useForm, revalidateLogic } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import * as v from "valibot";
import { THAI_BANKS } from "./thbank";
import { FileDropzone } from "@/components/dropzone";

export const formSchema = v.object({
  name: v.pipe(
    v.string(""),
    v.maxLength(255, "Name must be at most 255 characters.")
  ),
  slug: v.pipe(
    v.string(""),
    v.maxLength(255, "Slug must be at most 255 characters.")
  ),
  phone: v.pipe(
    v.string(""),
    v.maxLength(20, "Phone number must be at most 20 characters.")
  ),
  taxId: v.pipe(
    v.string(""),
    v.maxLength(50, "Tax ID must be at most 50 characters.")
  ),
  email: v.pipe(
    v.string(""),
    v.maxLength(255, "Email must be at most 255 characters.")
  ),
  note: v.pipe(
    v.string(""),
    v.maxLength(500, "Note must be at most 500 characters.")
  ),
  address: v.pipe(
    v.string(""),
    v.maxLength(500, "Address must be at most 500 characters.")
  ),
  province: v.pipe(
    v.string(""),
    v.maxLength(100, "Province must be at most 100 characters.")
  ),
  district: v.pipe(
    v.string(""),
    v.maxLength(100, "District must be at most 100 characters.")
  ),
  subDistrict: v.pipe(
    v.string(""),
    v.maxLength(100, "Sub-district must be at most 100 characters.")
  ),
  postalCode: v.pipe(
    v.string(""),
    v.maxLength(20, "Postal code must be at most 20 characters.")
  ),
  account_no: v.pipe(
    v.string(""),
    v.maxLength(50, "Account number must be at most 50 characters.")
  ),
  account_name: v.pipe(
    v.string(""),
    v.maxLength(100, "Account name must be at most 100 characters.")
  ),
  prompt_pay: v.pipe(
    v.string(""),
    v.maxLength(20, "PromptPay must be at most 20 characters.")
  ),
  bank_name: v.pipe(
    v.string(""),
    v.maxLength(100, "Bank name must be at most 100 characters.")
  ),
});

type orgData = v.InferOutput<typeof formSchema>;
const defaultValues: orgData = {
  name: "",
  slug: "",
  phone: "",
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
};

export default function ShopInfo() {
  const { data: activeOrg, isPending } = authClient.useActiveOrganization();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileProgresses, setFileProgresses] = useState<Record<string, number>>(
    {}
  );
  const fileMode = "single" as const; // กำหนด mode เป็น single

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);

    // ตรวจสอบว่าเป็น single mode หรือไม่
    // ใน single mode ถ้ามีไฟล์อยู่แล้ว ให้ replace ไฟล์เดิม
    if (fileMode === "single" && uploadedFiles.length > 0) {
      // Single mode: replace ไฟล์เดิม
      setUploadedFiles(newFiles);
      setFileProgresses({}); // เคลียร์ progress เก่า
    } else {
      // Multiple mode หรือยังไม่มีไฟล์: เพิ่มไฟล์เข้าไป
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }

    newFiles.forEach((file) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setFileProgresses((prev) => ({
          ...prev,
          [file.name]: Math.min(progress, 100),
        }));
      }, 300);
    });
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // FileDropzone จะจัดการ drop เองผ่าน handleDropWrapper
  };

  const removeFile = (filename: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.name !== filename));
    setFileProgresses((prev) => {
      const newProgresses = { ...prev };
      delete newProgresses[filename];
      return newProgresses;
    });
  };

  const form = useForm({
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),

    validators: {
      onDynamic: formSchema,
      onSubmit: formSchema,
      onSubmitAsync: async ({ value }) => {
        await authClient.organization.update(
          {
            data: {
              name: value.name,
              slug: value.slug,
              phone: value.phone,
              taxId: value.taxId,
              email: value.email,
              note: value.note,
              address: value.address,
              province: value.province,
              district: value.district,
              subDistrict: value.subDistrict,
              postalCode: value.postalCode,
              account_no: value.account_no,
              account_name: value.account_name,
              prompt_pay: value.prompt_pay,
              bank_name: value.bank_name,
            },
            organizationId: activeOrg?.id || "",
          },
          {
            onSuccess: (data) => {
              if (data) {
                toast.success("สำเร็จ", {
                  description: "แก้ไขข้อมูลร้านค้าสำเร็จ",
                });
              }
            },
            onError: (error) => {
              toast.error(error.error.message || error.error.statusText, {
                description: "กรุณาลองใหม่อีกครั้ง",
              });
            },
          }
        );
      },
    },
  });
  useEffect(() => {
    if (activeOrg) {
      form.setFieldValue("name", activeOrg.name);
      form.setFieldValue("slug", activeOrg.slug);
      form.setFieldValue("phone", activeOrg.phone || "");
      form.setFieldValue("taxId", activeOrg.taxId || "");
      form.setFieldValue("email", activeOrg.email || "");
      form.setFieldValue("note", activeOrg.note || "");
      form.setFieldValue("address", activeOrg.address || "");
      form.setFieldValue("province", activeOrg.province || "");
      form.setFieldValue("district", activeOrg.district || "");
      form.setFieldValue("subDistrict", activeOrg.subDistrict || "");
      form.setFieldValue("postalCode", activeOrg.postalCode || "");
      form.setFieldValue("account_no", activeOrg.account_no || "");
      form.setFieldValue("account_name", activeOrg.account_name || "");
      form.setFieldValue("prompt_pay", activeOrg.prompt_pay || "");
      form.setFieldValue("bank_name", activeOrg.bank_name || "");
    }
  }, [activeOrg]);

  const router = useRouter();
  return (
    <div className="flex py-8 px-6 w-full bg-white mt-4 dark:bg-zinc-900 flex-col rounded-2xl shadow-xl border border-border/50 ">
      <form
        id="form-organization"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-normal tracking-widest text-foreground dark:text-foreground text-xl">
              ข้อมูลร้านค้า
            </h2>
            <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-muted-foreground font-normal tracking-widest">
              รายละเอียดเกี่ยวกับร้านค้าของคุณ
            </p>
          </div>
          <div className="sm:max-w-3xl md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="col-span-full sm:col-span-3">
                <form.Field
                  name="name"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">
                          ชื่อร้านค้า
                        </FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="font-normal tracking-widest"
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="ชื่อร้านค้าของคุณ"
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
              <div className="col-span-full sm:col-span-3">
                <form.Field
                  name="slug"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">slug</FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            disabled
                            className="font-normal tracking-widest"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="slug"
                          />
                        </InputGroup>

                        <FieldDescription className="font-normal tracking-widest">
                          Slug จะถูกสร้างขึ้นโดยอัตโนมัติจากชื่อร้านค้า
                        </FieldDescription>

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </div>
              <div className="col-span-full sm:col-span-3">
                <form.Field
                  name="phone"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">
                          เบอร์โทรศัพท์ร้านค้า
                        </FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="font-normal tracking-widest"
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="เบอร์โทรศัพท์ร้านค้า"
                          />
                          {/* <InputGroupAddon>
                            <EnvelopeSimpleIcon
                              size={32}
                              className="size-5 dark:text-gray-100"
                            />

                          </InputGroupAddon> */}
                        </InputGroup>

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </div>
              <div className="col-span-full sm:col-span-3">
                <form.Field
                  name="taxId"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">
                          เลขประจำตัวผู้เสียภาษี
                        </FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="font-normal tracking-widest"
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="เลขประจำตัวผู้เสียภาษี"
                          />
                          {/* <InputGroupAddon>
                            <EnvelopeSimpleIcon
                              size={32}
                              className="size-5 dark:text-gray-100"
                            />

                          </InputGroupAddon> */}
                        </InputGroup>

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </div>
              <div className="col-span-full sm:col-span-3">
                <form.Field
                  name="email"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">
                          อีเมลร้านค้า
                        </FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="font-normal tracking-widest"
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="อีเมลร้านค้า"
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
                  name="note"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">หมายเหตุ</FieldLabel>

                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="font-normal tracking-widest"
                          aria-invalid={
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          }
                          placeholder="หมายเหตุต่างๆเกี่ยวกับร้านค้า"
                        />

                        {isInvalid ? (
                          <FieldError errors={field.state.meta.errors} />
                        ) : (
                          <>
                            <FieldDescription className="font-normal tracking-widest">
                              หมายเหตุ:
                              ข้อมูลนี้จะไม่แสดงผลภายนอกแต่จะเก็บไว้เป็นข้อมูล
                            </FieldDescription>
                          </>
                        )}
                      </Field>
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-normal tracking-widest text-foreground dark:text-foreground text-xl">
              โปรไฟล์ร้านค้า
            </h2>
            <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-muted-foreground font-normal tracking-widest">
              รายละเอียดเกี่ยวกับโปรไฟล์ร้านค้าของคุณ
            </p>
          </div>
          <div className="sm:max-w-3xl md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="col-span-full ">

                <FileDropzone
                  fileInputRef={fileInputRef}
                  handleBoxClick={handleBoxClick}
                  handleDragOver={handleDragOver}
                  handleDrop={handleDrop}
                  handleFileSelect={handleFileSelect}
                  uploadedFiles={uploadedFiles}
                  onRemoveFile={removeFile}
                  mode={fileMode}
                  label="อัพโหลดรูปภาพโปรไฟล์ร้านค้า"
                />



              </div>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-normal tracking-widest text-foreground dark:text-foreground text-xl">
              ที่อยู่ร้านค้า
            </h2>
            <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-muted-foreground font-normal tracking-widest   ">
              รายละเอียดที่อยู่สำหรับร้านค้าของคุณ
            </p>
          </div>
          <div className="sm:max-w-3xl md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="col-span-full">
                <form.Field
                  name="address"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">
                          ที่อยู่ร้านค้า
                        </FieldLabel>

                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="font-normal tracking-widest"
                          aria-invalid={
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          }
                          placeholder="ที่อยู่ร้านค้า"
                        />

                        {isInvalid ? (
                          <FieldError errors={field.state.meta.errors} />
                        ) : (
                          <>
                            <FieldDescription className="font-normal tracking-widest">
                              หมายเหตุ:
                              ที่อยู่จะไม่แสดงผลภายนอกแต่จะแสดงในเอกสารต่างๆ
                            </FieldDescription>
                          </>
                        )}
                      </Field>
                    );
                  }}
                />
              </div>

              <div className="col-span-full sm:col-span-3">
                <form.Field
                  name="province"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">จังหวัด</FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="font-normal tracking-widest"
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="จังหวัด"
                          />
                          {/* <InputGroupAddon>
                            <EnvelopeSimpleIcon
                              size={32}
                              className="size-5 dark:text-gray-100"
                            />

                          </InputGroupAddon> */}
                        </InputGroup>

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </div>
              <div className="col-span-full sm:col-span-3">
                <form.Field
                  name="district"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">อำเภอ</FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="font-normal tracking-widest"
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="อำเภอ"
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
              <div className="col-span-full sm:col-span-3">
                <form.Field
                  name="subDistrict"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">ตำบล</FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="font-normal tracking-widest"
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="ตำบล"
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
              <div className="col-span-full sm:col-span-3">
                <form.Field
                  name="postalCode"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">
                          รหัสไปรษณีย์
                        </FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="รหัสไปรษณีย์"
                          />
                          {/* <InputGroupAddon>
                            <EnvelopeSimpleIcon
                              size={32}
                              className="size-5 dark:text-gray-100"
                            />

                          </InputGroupAddon> */}
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
        </div>
        <Separator className="my-8" />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-normal tracking-widest text-foreground dark:text-foreground text-xl">
              บัญชีและการเงิน
            </h2>
            <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-muted-foreground font-normal tracking-widest">
              รายละเอียดทสำหรับข้อมุลบัญชีเเละการเงินของร้านค้า
            </p>
          </div>
          <div className="sm:max-w-3xl md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="col-span-full sm:col-span-3">
                <form.Field
                  name="account_no"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">
                          หมายเลขบัญชีธนาคาร
                        </FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="font-normal tracking-widest"
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="หมายเลขบัญชีธนาคาร"
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
              <div className="col-span-full sm:col-span-3">
                <form.Field
                  name="bank_name"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">ธนาคาร</FieldLabel>
                        <Select
                          name="bank_name"
                          key={`bankName-${field.state.value || ""}`}
                          value={field.state.value || undefined}
                          onValueChange={(value: any) => {
                            field.handleChange(value);
                          }}
                        >
                          <SelectTrigger
                            id={field.name}
                            aria-invalid={isInvalid}
                            className="w-full"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {THAI_BANKS.map((bank: any) => (
                              <SelectItem
                                key={bank.code}
                                value={bank.name.toString()}
                              >
                                {bank.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </div>
              <div className="col-span-full sm:col-span-3">
                <form.Field
                  name="account_name"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest"    >
                          ชื่อเจ้าของบัญชีธนาคาร
                        </FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="font-normal tracking-widest"
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="ชื่อบัญชี"
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
              <div className="col-span-full sm:col-span-3">
                <form.Field
                  name="prompt_pay"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">
                          หมายเลขพร้อมเพย์ (ถ้ามี)
                        </FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            className="font-normal tracking-widest"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}

                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="หมายเลขพร้อมเพย์"
                          />
                        </InputGroup>

                        <FieldDescription className="font-normal tracking-widest text-sm">
                          qrcode จะแสดงในหน้าใบแจ้งหนี้/หรือใบเสร็จรับเงิน
                        </FieldDescription>

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
        </div>
        <Separator className="my-4" />
        <div className="flex items-center justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
            onClick={() => router.back()}
          >
            ย้อนกลับ
          </Button>
          <Button
            type="submit"
            size="lg"
            form="form-organization"
            className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
          >
            บันทึกข้อมูล
          </Button>
        </div>
      </form >
    </div >
  );
}
