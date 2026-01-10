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
import { authClient } from "@/lib/auth-client";
import { useForm, revalidateLogic } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import * as v from "valibot";

export const formSchema = v.object({
  name: v.pipe(
    v.string(""),
    v.maxLength(255, "Name must be at most 255 characters.")
  ),
  foterText: v.pipe(
    v.string(""),
    v.maxLength(500, "Footer text must be at most 500 characters.")
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
  foterText: "ขอบคุณที่ใช้บริการของเรา",
  themcolor: "#000000",
  fontSize: "12",
};

export default function BillTem() {
  const form = useForm({
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),

    validators: {
      onDynamic: formSchema,
      onSubmit: formSchema,
      onSubmitAsync: async ({ value }) => {},
    },
  });

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
            <h2 className="font-semibold text-foreground dark:text-foreground text-xl">
              ตั่งค่าข้อมูลรูปแบบบิล
            </h2>
            <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-muted-foreground">
              รายละเอียดเกี่ยวกับรูปแบบบิลของคุณ
            </p>
          </div>
          <div className="sm:max-w-3xl md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
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
                          aria-invalid={
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          }
                          placeholder="ข้อความท้ายบิล เช่น ขอบคุณที่ใช้บริการของเรา"
                        />

                        {isInvalid ? (
                          <FieldError errors={field.state.meta.errors} />
                        ) : (
                          <>
                            <FieldDescription>
                              หมายเหตุ:
                              ข้อมูลนี้จะแสดงอยู่ด้านล่างสุดของบิลที่พิมพ์ออกมา
                            </FieldDescription>
                          </>
                        )}
                      </Field>
                    );
                  }}
                />
              </div>
              <div className="col-span-full ">
                <form.Field
                  name="themcolor"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>ธีมสีหลัก</FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            type="color"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="สีหลักของบิล เช่น #ff0000"
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
              <div className="col-span-full ">
                <form.Field
                  name="fontSize"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>ขนาดฟ้อนต์</FieldLabel>

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
                            placeholder="ขนาดฟ้อนต์ เช่น 12px, 14px"
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
            ย้อนกลับ
          </Button>
          <Button
            type="submit"
            size="lg"
            form="form-organization"
            className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out"
          >
            บันทึกข้อมูล
          </Button>
        </div>
      </form>
    </div>
  );
}
