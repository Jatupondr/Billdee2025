"use client";
import React from "react";
import * as v from "valibot";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Field, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
export const formSchema = v.object({
  fullName: v.pipe(
    v.string("กรุณากรอกชื่อร้านค้า"),
    v.nonEmpty("กรุณากรอกชื่อร้านค้า"),
    v.maxLength(255, "ชื่อร้านค้าต้องไม่เกิน 255 ตัวอักษร")
  ),
  address: v.pipe(
    v.string("กรุณากรอกที่อยู่ร้านค้า"),
    v.nonEmpty("กรุณากรอกที่อยู่ร้านค้า"),
    v.maxLength(500, "ที่อยู่ร้านค้าต้องไม่เกิน 500 ตัวอักษร")
  ),
  city: v.pipe(v.string(), v.maxLength(1, "ชื่อเมืองต้องไม่เกิน 100 ตัวอักษร")),
  state: v.pipe(
    v.string(),
    v.maxLength(1, "ชื่อจังหวัดต้องไม่เกิน 100 ตัวอักษร")
  ),
  postalCode: v.pipe(
    v.string(),
    v.maxLength(5, "รหัสไปรษณีย์ต้องไม่เกิน 5 ตัวอักษร")
  ),
});

type formOrgData = v.InferOutput<typeof formSchema>;
const defaultValues: formOrgData = {
  fullName: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
};

const CreateOrg = () => {
  const formCreateOrg = useForm({
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),

    validators: {
      onDynamic: formSchema,
      onSubmit: formSchema,
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
  return (
    <>
      <div className="flex items-center justify-center p-10">
        <div className="sm:mx-auto sm:max-w-2xl">
          <h3 className="text-2xl font-semibold text-foreground dark:text-foreground">
            สร้างร้านค้าของคุณ
          </h3>
          <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">
            ใช้เวลาสักครู่เพื่อสมัครใช้งานระบบร้านค้าของคุณ
          </p>
          <form
            id="form-create-org"
            onSubmit={(e) => {
              e.preventDefault();
              formCreateOrg.handleSubmit();
            }}
            className="mt-8"
          >
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
              {/* Store Name Field */}
              <div className="col-span-full">
                <formCreateOrg.Field
                  name="fullName"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field className="gap-2" data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          ชื่อร้านค้า
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
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

              {/* Address Field */}
              <div className="col-span-full">
                <formCreateOrg.Field
                  name="address"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field className="gap-2" data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          ที่อยู่ร้านค้า
                        </FieldLabel>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="ที่อยู่ร้านค้าของคุณ"
                          className="min-h-25"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </div>

              {/* City Field */}
              <div className="col-span-full sm:col-span-2">
                <formCreateOrg.Field
                  name="city"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field className="gap-2" data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>เมือง</FieldLabel>
                        <Input
                          type="text"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          autoComplete="address-level2"
                          placeholder="เมือง"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </div>

              {/* State Field */}
              <div className="col-span-full sm:col-span-2">
                <formCreateOrg.Field
                  name="state"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field className="gap-2" data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>จังหวัด</FieldLabel>
                        <Input
                          type="text"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          autoComplete="address-level1"
                          placeholder="จังหวัด"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </div>

              {/* Postal Code Field */}
              <div className="col-span-full sm:col-span-2">
                <formCreateOrg.Field
                  name="postalCode"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field className="gap-2" data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          รหัสไปรษณีย์
                        </FieldLabel>
                        <Input
                          type="text"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          autoComplete="postal-code"
                          placeholder="รหัสไปรษณีย์"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </div>
            </div>

            <Button
              type="submit"
              form="form-create-org"
              className="active:scale-95 duration-300 cursor-pointer flex justify-center gap-2 py-3 px-2 h-11 w-full mt-6"
            >
              <p className="text-base tracking-widest">สร้างร้านค้า</p>
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateOrg;
