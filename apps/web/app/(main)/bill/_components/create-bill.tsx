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
import React from "react";
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
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { TrashSimpleIcon } from "@phosphor-icons/react";

export const billSchema = v.object({
  name_customer: v.pipe(
    v.string("กรุณาเลอกหรือตั้งค่าลูกค้า"),
    v.nonEmpty("กรุณาเลอกหรือตั้งค่าลูกค้า"),
    v.maxLength(255, "อีเมลยาวเกินไป")
  ),
});

type billData = v.InferOutput<typeof billSchema>;
const defaultValues: billData = {
  name_customer: "",
};

const CreateBill = () => {
  const form = useForm({
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),

    validators: {
      onDynamic: billSchema,
      onSubmit: billSchema,
      onSubmitAsync: async ({ value }) => {
        toast("You submitted the following values:", {
          description: (
            <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
              <code>{JSON.stringify(value, null, 2)}</code>
            </pre>
          ),
          position: "bottom-right",
          classNames: {
            content: "flex flex-col gap-2",
          },
          style: {
            "--border-radius": "calc(var(--radius)  + 4px)",
          } as React.CSSProperties,
        });
      },
    },
  });
  const frameworks = [
    "ร้าน A",
    "ร้าน B",
    "ร้าน C",
    "ร้าน D",
    "ร้าน E",
  ] as const;

  const ListTable = ["ลำดับ", "ชื่อรายการ", "จำนวน", "ต้นทุน", "ราคา"] as const;

  return (
    <>
      <Card className="p-4 shadow-md border border-border/50 ">
        <CardHeader>
          <CardTitle className="text-2xl tracking-widest">
            สร้างบิลใหม่ #RE202500001
          </CardTitle>
          <CardDescription className="tracking-wider">
            หากพบปัญหาในการใช้งาน กรุณาติดต่อฝ่ายสนับสนุน
          </CardDescription>
          <CardAction>
            {/* <Button variant="link" className="tracking-wider cursor-pointer">
              เลขที่บิล
            </Button> */}
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
                <div className="grid grid-cols-3">
                  <form.Field
                    name="name_customer"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>ลูกค้า</FieldLabel>

                          <Combobox
                            items={frameworks}
                            onValueChange={(value: any) => {
                              field.handleChange(value);
                            }}
                          >
                            <ComboboxInput
                              id={field.name}
                              name={field.name}
                              value={field.state.value ?? ""}
                              onBlur={field.handleBlur}
                              onChange={(e) => {
                                field.handleChange(e.target.value);
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

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="mb-2 tracking-widest cursor-pointer"
              >
                เพิ่มสินค้า
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="mb-2 tracking-widest cursor-pointer"
              >
                รายการสินค้า
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
                <TableRow>
                  <TableCell className="font-normal w-20 text-center text-base">
                    1
                  </TableCell>
                  <TableCell className="font-medium text-base">
                    <div className="flex flex-col justify-start min-w-0">
                      <p> Wireless Mouse</p>
                      <div className="text-sm font-normal text-primary/70 mt-1 cursor-copy">
                        หมายเหตุ:
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="w-28">
                    <Input
                      type="number"
                      defaultValue="1"
                      className="h-10 w-20"
                      min="0"
                    />
                  </TableCell>
                  <TableCell className="w-28">
                    <Input
                      type="number"
                      defaultValue="1"
                      className="h-10 w-20"
                      min="0"
                    />
                  </TableCell>
                  <TableCell className="w-80">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        defaultValue="299"
                        min="0"
                        className="h-9 w-60"
                      />

                      <Button
                        variant="outline"
                        size="icon"
                        className="border-0 flex bg-red-500 hover:bg-red-600 items-center justify-center cursor-pointer active:scale-95 transition-transform ease-in-out duration-150"
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
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>Total</TableCell>
                  <TableCell className="text-right">$2,500.00</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </form>
        </CardContent>
        <CardAction className="justify-end">
          <p className="tracking-widest text-sm">
            - ตรวจสอบความถูกต้องก่อนยืนยันออกบิล
          </p>
          <p className="tracking-widest text-sm">
            - ราคายังไม่รวมภาษีมูลค่าเพิ่ม (ถ้ามี)
          </p>
          {/* <Button type="submit" form="form-create-bill">
            สร้างบิล
          </Button> */}
        </CardAction>
        {/* <CardFooter className="pt-0 border-t border-t-border/50">

        </CardFooter> */}
      </Card>
    </>
  );
};

export default CreateBill;
