"use client";
import { Button } from "@/components/ui/button";
import * as v from "valibot";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useState } from "react";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BackspaceIcon,
  CalendarIcon,
  CaretDownIcon,
  FloppyDiskBackIcon,
  PlusCircleIcon,
  TrashSimpleIcon,
} from "@phosphor-icons/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/hooks/axios";
import { useDebounce } from "@/hooks/use-debounce";
import { authClient } from "@/lib/auth-client";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export const billSchema = v.object({
  name_customer: v.pipe(
    v.string("กรุณาเลอกหรือตั้งค่าลูกค้า"),
    v.nonEmpty("กรุณาเลอกหรือตั้งค่าลูกค้า"),
    v.maxLength(255, "อีเมลยาวเกินไป")
  ),
  billNumber: v.string("กรุณาใส่เลขที่บิล"),
  date: v.string("กรุณาเลือกวันที่"),
  customerId: v.optional(v.string()),
  phone_customer: v.string(),
  address_customer: v.string(),

  products: v.optional(
    v.array(
      v.object({
        no: v.optional(v.number()),
        name: v.string(),
        quantity: v.number(),
        cost: v.number(),
        price: v.number(),
        note: v.optional(v.string()),
        total: v.optional(v.number()),
      })
    ),
    []
  ),
  discountPercent: v.optional(v.number(), 0),
  taxPercent: v.optional(v.number(), 7),
  includeVat: v.optional(v.boolean(), false),
  billNote: v.optional(v.string(), ""),
  total: v.optional(v.number(), 0),
  discount: v.optional(v.number(), 0),
  vat: v.optional(v.number(), 0),
});

type billData = v.InferOutput<typeof billSchema>;
const defaultValues: billData = {
  name_customer: "",
  billNumber: "",
  date: "",
  customerId: "",
  phone_customer: "",
  address_customer: "",

  products: [
    {
      no: 1,
      name: "",
      quantity: 1,
      cost: 0,
      price: 0,
      note: "",
      total: 0,
    },
  ],
  discountPercent: 0,
  taxPercent: 7,
  includeVat: false,
  billNote: "",
  total: 0,
  discount: 0,
  vat: 0,
};

const CreateBill = () => {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [openDate, setOpenDate] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [searchProduct, setSearchProduct] = useState("");
  const debouncedSearchProduct = useDebounce(searchProduct, 500);
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: activeOrg, isPending } = authClient.useActiveOrganization();
  const getCustomers = async (search: string) => {
    const response = await api.get(
      `/customers?page=1&pageSize=50&search=${search}&organizationId=${activeOrg?.id}&typeCustomer=customer`
    );
    return response.data;
  };
  const { data: customersData, isLoading } = useQuery<any>({
    queryKey: ["customers", debouncedSearch],
    queryFn: () => getCustomers(debouncedSearch),
  });

  const getLastBillNumber = async (organizationId: string, userId: string) => {
    const response = await api.get(
      `/bills/lastbillnumber?organizationId=${organizationId}&userId=${userId}`
    );
    return response.data;
  };

  const { data: lastbill, isLoading: isLoadingLastBill } = useQuery<any>({
    queryKey: ["lastbill", activeOrg?.id, session?.user.id],
    queryFn: () =>
      getLastBillNumber(activeOrg?.id ?? "", session?.user.id ?? ""),

    enabled: !!activeOrg?.id && !!session?.user.id,
  });

  const getProducts = async (search: string) => {
    const response = await api.get(
      `/products?page=1&pageSize=50&search=${search}&organizationId=${activeOrg?.id}`
    );
    return response.data;
  };

  const { data: productsData, isLoading: isLoadingProducts } = useQuery<any>({
    queryKey: ["products", debouncedSearchProduct],
    queryFn: () => getProducts(debouncedSearchProduct),
    enabled: !!activeOrg?.id,
  });

  const createBillMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/bills", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast.success("สร้างบิลสำเร็จ", {
        position: "bottom-right",
      });
      router.push("/bill");
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด", {
        description: error?.response?.data?.message || "ไม่สามารถสร้างบิลได้",
        position: "bottom-right",
      });
    },
  });

  const form = useForm({
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),

    validators: {
      onSubmitAsync: async ({ value }) => {
        // คำนวณค่าต่างๆ ก่อน submit
        const subtotal = (value.products || []).reduce(
          (sum: number, item: any) => sum + (item.total || 0),
          0
        );
        const discountAmount = (subtotal * (value.discountPercent || 0)) / 100;
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = value.includeVat
          ? (afterDiscount * (value.taxPercent || 7)) / 100
          : 0;
        const totalAmount = afterDiscount + taxAmount;

        const formattedData = {
          billNumber: lastbill?.data?.billNumber,
          date: value.date || new Date().toISOString(),
          name_customer: value.name_customer,
          phone_customer: value.phone_customer,
          address_customer: value.address_customer,
          customerId: value.customerId,
          products: (value.products || []).map((product: any, idx: number) => ({
            no: product.no || idx + 1,
            productId: product.productId || undefined,
            name: product.name,
            quantity: product.quantity,
            cost: product.cost,
            price: product.price,
            total: product.total,
            note: product.note || "",
          })),
          discountPercent: value.discountPercent || 0,
          taxPercent: value.taxPercent || 7,
          includeVat: value.includeVat || false,

          total: totalAmount,
          discount: discountAmount,
          vat: taxAmount,
          note: value.billNote || "",
          organizationId: activeOrg?.id,
          userId: session?.user.id,
        };
        console.log(formattedData);

        createBillMutation.mutate(formattedData);
      },
    },
  });
  const customerData = customersData?.rows.map((item: any) => item.name) ?? [];
  const productData =
    productsData?.rows.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price ?? 0,
      cost: item.cost ?? 0,
    })) ?? [];

  const ListTable = [
    "ลำดับ",
    "ชื่อรายการ",
    "จำนวน",
    "ต้นทุน",
    "ราคา",
    "ราคารวม",
  ] as const;

  const addProduct = () => {
    // เกิด 12 รายการ ไม่ได้ โชว์ toast

    const currentProducts = form.getFieldValue("products") || [];
    if (currentProducts.length >= 12) {
      toast.error("ไม่สามารถเพิ่มได้ ต้องมีไม่เกิน 12 รายการ");
      return;
    }
    form.setFieldValue("products", [
      ...currentProducts,
      {
        no: currentProducts.length + 1,
        name: "",
        quantity: 1,
        cost: 0,
        price: 0,
        note: "",
        total: 0,
      },
    ]);
  };

  const removeProduct = (index: number) => {
    const currentProducts = form.getFieldValue("products") || [];
    if (currentProducts.length <= 1) {
      toast.error("ไม่สามารถลบได้ ต้องมีอย่างน้อย 1 รายการ");
      return;
    }
    form.setFieldValue(
      "products",
      currentProducts.filter((_: any, i: number) => i !== index)
    );
  };

  return (
    <>
      <Card className="p-4 shadow-md border border-border/50 ">
        <CardHeader>
          <CardTitle className="text-2xl tracking-widest">
            สร้างบิลใหม่ #{lastbill?.data?.billNumber}
          </CardTitle>
          <CardDescription className="tracking-wider">
            หากพบปัญหาในการใช้งาน กรุณาติดต่อฝ่ายสนับสนุน
          </CardDescription>
          <CardAction className="space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="tracking-wide cursor-pointer active:scale-95 duration-200 ease-in-out"
              onClick={() => router.push("/bill")}
            >
              <BackspaceIcon size={32} weight="fill" className="" />
              ย้อนกลับ
            </Button>
            <Button
              type="submit"
              form="form-create-bill"
              disabled={createBillMutation.isPending}
              size="sm"
              className="tracking-wide cursor-pointer active:scale-95 duration-200 ease-in-out"
            >
              <FloppyDiskBackIcon size={32} weight="fill" className="" />
              {createBillMutation.isPending ? "กำลังสร้าง..." : "สร้างบิล"}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form
            id="form-create-bill"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="flex flex-col gap-4 "
          >
            <FieldSet data-invalid>
              <FieldGroup className="flex flex-col  text-left">
                <div className="grid grid-cols-1">
                  <form.Field
                    name="name_customer"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>ลูกค้า</FieldLabel>

                          <Combobox
                            items={customerData}
                            onValueChange={(value: any) => {
                              field.handleChange(value);
                              const selectedCustomer = customersData?.rows.find(
                                (c: any) => c.name === value
                              );
                              if (selectedCustomer) {
                                form.setFieldValue(
                                  "customerId",
                                  selectedCustomer._id || ""
                                );
                                form.setFieldValue(
                                  "phone_customer",
                                  selectedCustomer.phone || ""
                                );
                                form.setFieldValue(
                                  "address_customer",
                                  selectedCustomer.address || ""
                                );
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
                              placeholder="เลือกหรือตั้งค่าลูกค้า"
                            />
                            <ComboboxContent>
                              <ComboboxEmpty>ไม่พบลูกค้า</ComboboxEmpty>
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
              <FieldGroup className="flex flex-col  text-left">
                <div className="grid grid-cols-1">
                  <form.Field
                    name="date"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            วันที่ออกบิล
                          </FieldLabel>
                          <Popover>
                            <PopoverTrigger
                              render={
                                <Button
                                  variant="outline"
                                  id={field.name}
                                  className="w-full justify-between font-normal"
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
                              className="w-auto overflow-hidden p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={date}
                                captionLayout="dropdown"
                                onSelect={(selectedDate) => {
                                  if (selectedDate) {
                                    setDate(selectedDate);
                                    const dateString = selectedDate
                                      .toISOString()
                                      .split("T")[0];
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

            {/* แสดงรายละเอียดลูกค้า */}
            <form.Subscribe selector={(state) => state.values.name_customer}>
              {(customerName) => {
                if (!customerName) return null;

                const selectedCustomer = customersData?.rows.find(
                  (c: any) => c.name === customerName
                );

                if (!selectedCustomer) return null;

                return (
                  <Card className="border border-border/50 bg-accent/20 w-1/2">
                    <CardContent>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              ชื่อลูกค้า:
                            </span>
                            <span className="text-base font-semibold">
                              {selectedCustomer.name}
                            </span>
                          </div>
                          {selectedCustomer.email && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                อีเมล:
                              </span>
                              <span className="text-sm">
                                {selectedCustomer.email}
                              </span>
                            </div>
                          )}
                          {selectedCustomer.phone && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                เบอร์โทร:
                              </span>
                              <span className="text-sm">
                                {selectedCustomer.phone}
                              </span>
                            </div>
                          )}
                          {selectedCustomer.address && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                ที่อยู่:
                              </span>
                              <span className="text-sm">
                                {selectedCustomer.address}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }}
            </form.Subscribe>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="mb-1 tracking-widest cursor-pointer active:scale-95 duration-200 ease-in-out"
                onClick={addProduct}
              >
                <PlusCircleIcon size={32} weight="duotone" />
                เพิ่มสินค้า
              </Button>
            </div>

            <Table>
              <TableHeader className="bg-accent">
                <TableRow>
                  {ListTable.map((header, idx: number) => (
                    <TableHead
                      className="text-base tracking-widest font-normal leading-4"
                      key={idx}
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <form.Field name="products" mode="array">
                  {(field) => (
                    <>
                      {field.state.value && field.state.value.length > 0 ? (
                        field.state.value.map((product: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-normal w-20 text-center text-base">
                              {index + 1}
                            </TableCell>
                            <form.Field name={`products[${index}].name`}>
                              {(nameField) => (
                                <TableCell className="font-medium text-base">
                                  <div className="flex flex-col justify-start min-w-0">
                                    <Combobox
                                      items={productData.map(
                                        (p: any) => p.name
                                      )}
                                      value={nameField.state.value}
                                      onValueChange={(value: any) => {
                                        nameField.handleChange(value);
                                        const selectedProduct =
                                          productData.find(
                                            (p: any) => p.name === value
                                          );
                                        if (selectedProduct) {
                                          form.setFieldValue(
                                            `products[${index}].no`,
                                            index + 1
                                          );
                                          form.setFieldValue(
                                            `products[${index}].price`,
                                            selectedProduct.price
                                          );
                                          form.setFieldValue(
                                            `products[${index}].cost`,
                                            selectedProduct.cost
                                          );
                                          const currentQty =
                                            form.getFieldValue(
                                              `products[${index}].quantity`
                                            ) || 0;
                                          form.setFieldValue(
                                            `products[${index}].total`,
                                            selectedProduct.price * currentQty
                                          );
                                        }
                                      }}
                                    >
                                      <ComboboxInput
                                        value={nameField.state.value}
                                        placeholder="เลือกหรือค้นหาสินค้า"
                                        onChange={(e) => {
                                          nameField.handleChange(
                                            e.target.value
                                          );
                                          setSearchProduct(e.target.value);
                                        }}
                                        className="h-9"
                                      />
                                      <ComboboxContent>
                                        <ComboboxEmpty>
                                          ไม่พบสินค้า
                                        </ComboboxEmpty>
                                        <ComboboxList>
                                          {(item) => (
                                            <ComboboxItem
                                              key={item}
                                              value={item}
                                            >
                                              {item}
                                            </ComboboxItem>
                                          )}
                                        </ComboboxList>
                                      </ComboboxContent>
                                    </Combobox>
                                    {/* <form.Field
                                      name={`products[${index}].note`}
                                    >
                                      {(noteField) => (
                                        <Input
                                          value={noteField.state.value || ""}
                                          onChange={(e) =>
                                            noteField.handleChange(
                                              e.target.value
                                            )
                                          }
                                          placeholder="หมายเหตุ"
                                          className="text-sm font-normal text-primary/70 mt-1 h-7 border-0 px-0 focus-visible:ring-0"
                                        />
                                      )}
                                    </form.Field> */}
                                  </div>
                                </TableCell>
                              )}
                            </form.Field>
                            <form.Field name={`products[${index}].quantity`}>
                              {(qtyField) => (
                                <TableCell className="w-28">
                                  <Input
                                    type="number"
                                    value={qtyField.state.value}
                                    onChange={(e) => {
                                      const newQty = Number(e.target.value);
                                      qtyField.handleChange(newQty);
                                      const currentPrice =
                                        form.getFieldValue(
                                          `products[${index}].price`
                                        ) || 0;
                                      form.setFieldValue(
                                        `products[${index}].total`,
                                        currentPrice * newQty
                                      );
                                    }}
                                    className="h-10 w-20"
                                    min="0"
                                  />
                                </TableCell>
                              )}
                            </form.Field>
                            <form.Field name={`products[${index}].cost`}>
                              {(costField) => (
                                <TableCell className="w-28">
                                  <Input
                                    type="number"
                                    value={costField.state.value}
                                    onChange={(e) =>
                                      costField.handleChange(
                                        Number(e.target.value)
                                      )
                                    }
                                    className="h-10 w-20"
                                    min="0"
                                  />
                                </TableCell>
                              )}
                            </form.Field>
                            <form.Field name={`products[${index}].price`}>
                              {(priceField) => (
                                <TableCell className="w-60">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      value={priceField.state.value}
                                      onChange={(e) => {
                                        const newPrice = Number(e.target.value);
                                        priceField.handleChange(newPrice);
                                        const currentQty =
                                          form.getFieldValue(
                                            `products[${index}].quantity`
                                          ) || 0;
                                        form.setFieldValue(
                                          `products[${index}].total`,
                                          newPrice * currentQty
                                        );
                                      }}
                                      min="0"
                                      className="h-9 w-32"
                                    />
                                  </div>
                                </TableCell>
                              )}
                            </form.Field>
                            <form.Field name={`products[${index}].total`}>
                              {(totalField) => (
                                <TableCell className="w-32 text-right flex items-center justify-end gap-2">
                                  <span className="text-base font-medium">
                                    {(totalField.state.value || 0).toFixed(2)}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeProduct(index)}
                                    disabled={field.state.value.length <= 1}
                                    className="border-0 flex bg-red-500 hover:bg-red-600 items-center justify-center cursor-pointer active:scale-95 transition-transform ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                                  >
                                    <TrashSimpleIcon
                                      size={18}
                                      weight="duotone"
                                      color="white"
                                      className="text-red-400"
                                    />
                                  </Button>
                                </TableCell>
                              )}
                            </form.Field>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center text-muted-foreground"
                          >
                            ไม่มีสินค้า กดปุ่ม "เพิ่มสินค้า" เพื่อเริ่มต้น
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </form.Field>
              </TableBody>
            </Table>

            {/* หมายเหตุ */}

            {/* สรุปยอด */}
            <form.Subscribe
              selector={(state) => ({
                products: state.values.products || [],
                discountPercent: state.values.discountPercent || 0,
                taxPercent: state.values.taxPercent || 7,
                includeVat: state.values.includeVat || false,
              })}
            >
              {({ products, discountPercent, taxPercent, includeVat }) => {
                const subtotal = products.reduce(
                  (sum: number, item: any) => sum + (item.total || 0),
                  0
                );
                const discountAmount = (subtotal * discountPercent) / 100;
                const afterDiscount = subtotal - discountAmount;
                const taxAmount = includeVat
                  ? (afterDiscount * taxPercent) / 100
                  : 0;
                const total = afterDiscount + taxAmount;

                return (
                  <div className="flex justify-between mt-4">
                    <div className="space-y-1">
                      <div className=" grid grid-cols-1">
                        <form.Field name="billNote">
                          {(field) => (
                            <Field>
                              <FieldLabel htmlFor="billNote">
                                หมายเหตุ
                              </FieldLabel>
                              <Textarea
                                id="billNote"
                                value={field.state.value || ""}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                placeholder="กรอกหมายเหตุเพิ่มเติม (ถ้ามี)"
                                className="min-h-25 resize-none w-full"
                              />
                            </Field>
                          )}
                        </form.Field>
                      </div>
                      <p className="tracking-widest text-sm">
                        - ตรวจสอบความถูกต้องก่อนยืนยันออกบิล
                      </p>
                      <p className="tracking-widest text-sm">
                        - ราคายังไม่รวมภาษีมูลค่าเพิ่ม (ถ้ามี)
                      </p>
                    </div>
                    <div className="w-96 space-y-3 border rounded-lg p-4 bg-accent/30">
                      <div className="flex justify-between items-center">
                        <span className="text-sm tracking-wider">
                          ยอดรวมก่อนส่วนลด
                        </span>
                        <span className="text-base font-medium">
                          {subtotal.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center gap-4">
                        <span className="text-sm tracking-wider">
                          ส่วนลด (%)
                        </span>
                        <form.Field name="discountPercent">
                          {(field) => (
                            <Input
                              type="number"
                              value={field.state.value || 0}
                              onChange={(e) =>
                                field.handleChange(Number(e.target.value))
                              }
                              className="h-9 w-24 text-right"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          )}
                        </form.Field>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm tracking-wider">
                          จำนวนส่วนลด
                        </span>
                        <span className="text-base font-medium">
                          {discountAmount.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center gap-4">
                        <span className="text-sm tracking-wider">
                          ภาษีมูลค่าเพิ่ม (7%)
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-medium">
                            {taxAmount.toFixed(2)}
                          </span>
                          <form.Field name="includeVat">
                            {(field) => (
                              <Switch
                                checked={field.state.value}
                                onCheckedChange={(checked) =>
                                  field.handleChange(checked)
                                }
                              />
                            )}
                          </form.Field>
                        </div>
                      </div>

                      <div className="border-t pt-3 flex justify-between items-center">
                        <span className="text-base font-semibold tracking-wider">
                          รวมสุทธิ
                        </span>
                        <span className="text-xl font-normal">
                          {total.toFixed(2)}
                        </span>
                      </div>
                    </div>
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

export default CreateBill;
