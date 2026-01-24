"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BackspaceIcon,
  CaretDownIcon,
  FloppyDiskBackIcon,
  PlusCircleIcon,
  TrashSimpleIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/hooks/axios";
import * as v from "valibot";
import { authClient } from "@/lib/auth-client";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileDropzone } from "@/components/dropzone";

export const billExpenseSchema = v.object({
  billExpenseNumber: v.string("กรุณาใส่เลขที่บิลค่าใช้จ่าย"),
  name: v.string("กรุณากรอกชื่อซัพลายเออร์/ผู้รับเงิน"),
  date: v.string("กรุณาเลือกวันที่"),
  customerId: v.optional(v.string()),
  description: v.string("กรุณากรอกรายละเอียด"),
  slipUrl: v.optional(v.string()),
  items: v.optional(
    v.array(
      v.object({
        no: v.optional(v.number()),
        productId: v.optional(v.string()),
        name: v.string(),
        quantity: v.number(),
        price: v.number(),
        total: v.optional(v.number()),
      }),
    ),
    [],
  ),
});

type billExpenseData = v.InferOutput<typeof billExpenseSchema>;

interface EditBillExpProps {
  id: string;
}

const EditBillExp = ({ id }: EditBillExpProps) => {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [openDate, setOpenDate] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { data: activeOrg, isPending } = authClient.useActiveOrganization();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
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

  // ดึงข้อมูลบิลค่าใช้จ่ายที่จะแก้ไข
  const getBillExpenseById = async (billId: string) => {
    const response = await api.get(`/exp/${billId}`);
    return response.data;
  };

  const { data: billExpenseData, isLoading: isLoadingBillExpense } =
    useQuery<any>({
      queryKey: ["bill-expense", id],
      queryFn: () => getBillExpenseById(id),
      enabled: !!id,
    });



  const getCustomers = async (search: string) => {
    const response = await api.get(
      `/customers?page=1&pageSize=50&search=${search}&organizationId=${activeOrg?.id}&typeCustomer=supplier`,
    );
    return response.data;
  };

  const { data: customersData, isLoading } = useQuery<any>({
    queryKey: ["customers", debouncedSearch],
    queryFn: () => getCustomers(debouncedSearch),
  });

  const updateBillExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch(`/exp/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exps"] });
      queryClient.invalidateQueries({ queryKey: ["bill-expense", id] });
      toast.success("แก้ไขบิลค่าใช้จ่ายสำเร็จ", {
        position: "bottom-right",
      });
      router.push("/bill-expense");
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด", {
        description:
          error?.response?.data?.message || "ไม่สามารถแก้ไขบิลค่าใช้จ่ายได้",
        position: "bottom-right",
      });
    },
  });

  const form = useForm({
    defaultValues: {
      billExpenseNumber: "",
      name: "",
      date: "",
      customerId: "",
      description: "",
      slipUrl: "",
      items: [
        {
          no: 1,
          name: "",
          quantity: 0,
          price: 0,
          total: 0,
        },
      ],
    },
    validationLogic: revalidateLogic(),
    validators: {
      onSubmitAsync: async ({ value }) => {

        let slipUrl = value.slipUrl || "";

        // upload image to cloudinary (ถ้ามีไฟล์ใหม่)
        if (uploadedFiles.length > 0 && uploadedFiles[0]) {
          try {
            const formData = new FormData();
            formData.append("file", uploadedFiles[0]);
            formData.append("width", "800");
            formData.append("quality", "auto");

            const response = await api.post("/cloudinary/upload", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });

            if (response?.data?.url) {
              slipUrl = response.data.url;

              // ลบไฟล์เก่า (ถ้ามี) - ใช้ try-catch เพื่อไม่ให้ส่งผลต่อการอัพโหลดไฟล์ใหม่
              if (value.slipUrl) {
                try {
                  await api.delete("/cloudinary/delete-by-url", {
                    data: {
                      url: value.slipUrl,
                    },
                  });
                } catch (deleteError) {
                  // Log error แต่ไม่ throw เพื่อไม่ให้ส่งผลต่อการอัพโหลด
                  console.warn("Failed to delete old logo:", deleteError);

                }
              }
            } else {
              toast.error("อัพโหลดรูปภาพไม่สำเร็จ", {
                description: "ไม่ได้รับ URL จากเซิร์ฟเวอร์",
                position: "bottom-right",
              });

              return;
            }
          } catch (uploadError: any) {
            toast.error("อัพโหลดรูปภาพไม่สำเร็จ", {
              description: uploadError?.response?.data?.message || "กรุณาลองใหม่อีกครั้ง",
              position: "bottom-right",
            });

            return;
          }
        }


        const subtotal = (value.items || []).reduce(
          (sum: number, item: any) => sum + (item.total || 0),
          0,
        );

        const formattedData = {
          billExpenseNumber: value.billExpenseNumber,
          date: value.date || new Date().toISOString(),
          name: value.name,
          customerId: value.customerId,
          description: value.description,
          slipUrl: slipUrl,
          items: value.items,
          organizationId: activeOrg?.id,
          total: subtotal,
          userId: session?.user?.id,

        };

        updateBillExpenseMutation.mutate(formattedData);
      },
    },
  });

  // โหลดข้อมูลบิลเข้าฟอร์ม


  const customerData = customersData?.rows.map((item: any) => item.name) ?? [];

  const ListTable = [
    "ลำดับ",
    "ชื่อรายการ",
    "จำนวน",
    "ราคา/หน่วย",
    "ราคารวม",
  ] as const;

  const addProduct = () => {
    const currentProducts = form.getFieldValue("items") || [];
    form.setFieldValue("items", [
      ...currentProducts,
      {
        no: currentProducts.length + 1,
        name: "",
        quantity: 0,
        price: 0,
        total: 0,
      },
    ]);
  };

  const removeProduct = (index: number) => {
    const currentProducts = form.getFieldValue("items") || [];
    if (currentProducts.length <= 1) {
      toast.error("ไม่สามารถลบได้ ต้องมีอย่างน้อย 1 รายการ");
      return;
    }
    form.setFieldValue(
      "items",
      currentProducts.filter((_: any, i: number) => i !== index),
    );
  };

  const clearAllProducts = () => {
    form.setFieldValue("items", [
      {
        no: 1,
        name: "",
        quantity: 0,
        price: 0,
        total: 0,
      },
    ]);
    toast.success("เคลียร์รายการทั้งหมดแล้ว");
  };

  useEffect(() => {
    if (billExpenseData?.data) {
      const billExp = billExpenseData.data;


      form.setFieldValue("billExpenseNumber", billExp.billExpenseNumber || "");
      form.setFieldValue(
        "name", billExp.customerId?.name,
      );
      form.setFieldValue("date", billExp.date || "");
      form.setFieldValue(
        "customerId",
        billExp.customerId?._id || billExp.customerId || "",
      );
      form.setFieldValue("description", billExp.description || "");
      form.setFieldValue("slipUrl", billExp.slipUrl || "");
      form.setFieldValue(
        "items",
        billExp.items || [
          {
            no: 1,
            name: "",
            quantity: 0,
            price: 0,
            total: 0,
          },
        ],
      );

      if (billExp.date) {
        setDate(new Date(billExp.date));
      }
    }
  }, [billExpenseData]);

  if (isLoadingBillExpense) {
    return (
      <Card className="p-4 shadow-md border border-border/50 dark:bg-zinc-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-4 shadow-md border border-border/50 dark:bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-2xl font-normal tracking-widest">
            แก้ไขบิลค่าใช้จ่าย #{billExpenseData?.data?.billExpenseNumber}
          </CardTitle>
          <CardDescription className="font-normal tracking-widest">
            หากพบปัญหาในการใช้งาน กรุณาติดต่อฝ่ายสนับสนุน
          </CardDescription>
          <CardAction className="space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
              onClick={() => router.push("/bill-expense")}
            >
              <BackspaceIcon size={32} weight="fill" />
              ย้อนกลับ
            </Button>
            <Button
              type="submit"
              form="form-edit-bill-expense"
              disabled={updateBillExpenseMutation.isPending}
              size="sm"
              className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
            >
              <FloppyDiskBackIcon size={32} weight="fill" />
              {updateBillExpenseMutation.isPending
                ? "กำลังบันทึก..."
                : "บันทึกการแก้ไข"}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form
            id="form-edit-bill-expense"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="flex flex-col gap-4"
          >
            <FieldSet data-invalid>
              <FieldGroup className="flex flex-col text-left">
                <div className="grid grid-cols-1">
                  <form.Field
                    name="name"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel
                            htmlFor={field.name}
                            className="font-normal tracking-widest"
                          >
                            ซัพลายเออร์/ผู้รับเงิน
                          </FieldLabel>
                          <Combobox
                            items={customerData}
                            onValueChange={(value: any) => {
                              field.handleChange(value);
                              const selectedCustomer = customersData?.rows.find(
                                (c: any) => c.name === value,
                              );
                              if (selectedCustomer) {
                                form.setFieldValue(
                                  "customerId",
                                  selectedCustomer._id || "",
                                );
                              } else {
                                form.setFieldValue("customerId", "");
                                form.setFieldValue("name", "");
                              }
                            }}
                          >
                            <ComboboxInput
                              id={field.name}
                              name={field.name}
                              value={field.state.value ?? ""}
                              onBlur={field.handleBlur}
                              onChange={(e) => {
                                field.handleChange(e.target.value);
                                setSearch(e.target.value);
                              }}
                              aria-invalid={
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                              }
                              placeholder="เลือกหรือตั้งค่าซัพลายเออร์/ผู้รับเงิน"
                              className="font-normal tracking-widest"
                            />
                            <ComboboxContent>
                              <ComboboxEmpty>
                                ไม่พบซัพลายเออร์/ผู้รับเงิน
                              </ComboboxEmpty>
                              <ComboboxList>
                                {(item) => (
                                  <ComboboxItem key={item} value={item}>
                                    {item}
                                  </ComboboxItem>
                                )}
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  />
                </div>
              </FieldGroup>
            </FieldSet>

            <FieldSet data-invalid>
              <FieldGroup className="flex flex-col text-left">
                <div className="grid grid-cols-1">
                  <form.Field
                    name="date"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel
                            htmlFor={field.name}
                            className="font-normal tracking-widest"
                          >
                            วันที่
                          </FieldLabel>
                          <Popover>
                            <PopoverTrigger
                              render={
                                <Button
                                  variant="outline"
                                  id={field.name}
                                  className="w-full justify-between font-normal tracking-widest"
                                  type="button"
                                >
                                  {date
                                    ? date.toLocaleDateString("th-TH", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                    : "เลือกวันที่"}
                                  <CaretDownIcon
                                    className="ml-2 h-4 w-4 opacity-50"
                                    size={32}
                                  />
                                </Button>
                              }
                            />
                            <PopoverContent
                              className="w-auto overflow-hidden p-0 font-normal tracking-widest"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={date}
                                captionLayout="dropdown"
                                onSelect={(selectedDate) => {
                                  if (selectedDate) {
                                    setDate(selectedDate);
                                    const dateString =
                                      selectedDate.toISOString();
                                    field.handleChange(dateString);
                                    setOpenDate(false);
                                  }
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  />
                </div>
              </FieldGroup>
            </FieldSet>

            <FieldSet data-invalid>
              <FieldGroup className="flex flex-col text-left">
                <div className="grid grid-cols-1">
                  <form.Field
                    name="description"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel
                            htmlFor={field.name}
                            className="font-normal tracking-widest"
                          >
                            รายละเอียด
                          </FieldLabel>
                          <Textarea
                            id={field.name}
                            name={field.name}
                            value={field.state.value ?? ""}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="กรอกรายละเอียด"
                            className="font-normal tracking-widest"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  />
                </div>
              </FieldGroup>
            </FieldSet>

            <form.Subscribe selector={(state) => state.values.items || []}>
              {(items) => {
                const hasItems =
                  items.length > 1 || (items.length === 1 && items[0].name);
                return (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="mb-1 font-normal tracking-widest cursor-pointer active:scale-95 duration-200 ease-in-out"
                      onClick={addProduct}
                    >
                      <PlusCircleIcon size={32} weight="duotone" />
                      เพิ่มรายการ
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="mb-1 font-normal tracking-widest cursor-pointer active:scale-95 duration-200 ease-in-out text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                      onClick={clearAllProducts}
                      disabled={!hasItems}
                    >
                      <TrashSimpleIcon size={32} weight="duotone" />
                      เคลียร์รายการ
                    </Button>
                  </div>
                );
              }}
            </form.Subscribe>

            <Table>
              <TableHeader className="bg-accent">
                <TableRow>
                  {ListTable.map((header, idx: number) => (
                    <TableHead
                      className="text-base font-normal tracking-widest leading-4"
                      key={idx}
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <form.Field name="items" mode="array">
                  {(field) => (
                    <>
                      {field.state.value && field.state.value.length > 0 ? (
                        field.state.value.map((item: any, index: number) => (
                          <TableRow key={`item-${index}`}>
                            <TableCell className="font-normal tracking-widest w-20 text-center text-base">
                              {index + 1}
                            </TableCell>
                            <form.Field name={`items[${index}].name`}>
                              {(nameField) => (
                                <TableCell className="font-normal tracking-widest w-full text-base">
                                  <Input
                                    value={nameField.state.value ?? ""}
                                    onChange={(e) =>
                                      nameField.handleChange(e.target.value)
                                    }
                                    placeholder="ชื่อรายการ"
                                    className="h-9 font-normal tracking-widest"
                                  />
                                </TableCell>
                              )}
                            </form.Field>
                            <form.Field name={`items[${index}].quantity`}>
                              {(qtyField) => (
                                <TableCell className="w-28 font-normal tracking-widest">
                                  <Input
                                    type="number"
                                    value={qtyField.state.value ?? 0}
                                    onChange={(e) => {
                                      const newQty = parseFloat(e.target.value) || 0;
                                      qtyField.handleChange(newQty);
                                      const currentPrice =
                                        form.getFieldValue(
                                          `items[${index}].price`,
                                        ) || 0;
                                      form.setFieldValue(
                                        `items[${index}].total`,
                                        currentPrice * newQty,
                                      );
                                    }}
                                    className="h-10 w-20 font-normal tracking-widest"
                                    min="0"
                                    step="any"
                                  />
                                </TableCell>
                              )}
                            </form.Field>
                            <form.Field name={`items[${index}].price`}>
                              {(priceField) => (
                                <TableCell className="w-60">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      value={priceField.state.value ?? 0}
                                      onChange={(e) => {
                                        const newPrice = parseFloat(e.target.value) || 0;
                                        priceField.handleChange(newPrice);
                                        const currentQty =
                                          form.getFieldValue(
                                            `items[${index}].quantity`,
                                          ) || 0;
                                        form.setFieldValue(
                                          `items[${index}].total`,
                                          newPrice * currentQty,
                                        );
                                      }}
                                      min="0"
                                      step="any"
                                      className="h-9 w-32 font-normal tracking-widest"
                                    />
                                  </div>
                                </TableCell>
                              )}
                            </form.Field>
                            <form.Field name={`items[${index}].total`}>
                              {(totalField) => (
                                <TableCell className="w-56 min-w-56 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <span className="text-base font-normal tracking-widest whitespace-nowrap">
                                      {(totalField.state.value || 0).toFixed(2)}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => removeProduct(index)}
                                      disabled={field.state.value.length <= 1}
                                      className="border-0 flex bg-red-500 hover:bg-red-600 items-center justify-center cursor-pointer active:scale-95 transition-transform ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 font-normal tracking-widest"
                                    >
                                      <TrashSimpleIcon
                                        size={18}
                                        weight="duotone"
                                        color="white"
                                        className="text-red-400"
                                      />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </form.Field>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center font-normal tracking-widest text-muted-foreground"
                          >
                            ไม่มีรายการ กดปุ่ม "เพิ่มรายการ" เพื่อเริ่มต้น
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </form.Field>
              </TableBody>
            </Table>
            {/* preview slip url */}
            <form.Subscribe selector={(state) => state.values.slipUrl || ""}>
              {(slipUrl) => (
                slipUrl ? (
                  <div className="flex flex-col gap-2 justify-start mt-4">
                    <label className="text-sm font-normal tracking-widest text-zinc-900 dark:text-zinc-100">หลักฐานการชำระเงิน</label>
                    <img src={slipUrl} alt="slip" width={800} height={400} className="object-cover rounded-lg" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 justify-start mt-4">
                    <label className="text-sm font-normal tracking-widest text-zinc-900 dark:text-zinc-100">หลักฐานการชำระเงิน</label>
                    <p className="text-sm font-normal tracking-widest text-zinc-900 dark:text-zinc-100">ไม่มีหลักฐานการชำระเงิน</p>
                  </div>
                )
              )}
            </form.Subscribe>


            <FileDropzone
              fileInputRef={fileInputRef}
              handleBoxClick={handleBoxClick}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleFileSelect={handleFileSelect}
              uploadedFiles={uploadedFiles}
              onRemoveFile={removeFile}
              mode={fileMode}
              label="อัพโหลดรูปภาพสลีป"
            />

            {/* สรุปยอด */}
            <form.Subscribe
              selector={(state) => ({ items: state.values.items || [] })}
            >
              {({ items }) => {
                const total = items.reduce(
                  (sum: number, item: any) => sum + (item.total || 0),
                  0,
                );
                return (
                  <div className="flex justify-end mt-4">
                    <Card className="border border-border/50 bg-accent/20">
                      <CardContent className="p-4">
                        <div className="space-y-2 min-w-[200px]">
                          <div className="flex justify-between">
                            <span className="text-lg font-normal tracking-widest">
                              ยอดรวม:
                            </span>
                            <span className="text-lg font-normal tracking-widest text-primary">
                              {total.toFixed(2)} บาท
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              }}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default EditBillExp;
