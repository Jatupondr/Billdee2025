"use client";
import React, { useEffect } from "react";
import * as v from "valibot";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Field, FieldDescription, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
export const formSchema = v.object({
  fullName: v.pipe(
    v.string("กรุณากรอกชื่อร้านค้า"),
    v.nonEmpty("กรุณากรอกชื่อร้านค้า"),
    v.maxLength(255, "ชื่อร้านค้าต้องไม่เกิน 255 ตัวอักษร"),
  ),
  slug: v.pipe(
    v.string("กรุณากรอกชื่อโดเมนร้านค้า"),
    v.nonEmpty("กรุณากรอกชื่อโดเมนร้านค้า"),
    v.regex(
      /^[a-zA-Z-]+$/,
      "ชื่อโดเมนร้านค้าต้องเป็นภาษาอังกฤษและขีด (-) เท่านั้น",
    ),
    v.maxLength(100, "ชื่อโดเมนร้านค้าต้องไม่เกิน 100 ตัวอักษร"),
  ),
});

type formOrgData = v.InferOutput<typeof formSchema>;
const defaultValues: formOrgData = {
  fullName: "",
  slug: "",
};

const CreateOrg = () => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const formCreateOrg = useForm({
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),

    validators: {
      onDynamic: formSchema,
      onSubmit: formSchema,
      onSubmitAsync: async ({ value }) => {
        await authClient.organization.create(
          {
            name: value.fullName, // required
            slug: value.slug, // required
            logo: "",
            // metadata,
            userId: session?.user.id,
          },
          {
            onSuccess: () => {
              toast.success("สร้างร้านค้าสำเร็จ");
              router.push("/");
            },
            onError: (error) => {
              toast.error(error.error.message);
            },
          },
        );
        // toast("You submitted the following values:", {
        //   description: (
        //     <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
        //       <code>{JSON.stringify(value, null, 2)}</code>
        //     </pre>
        //   ),
        //   position: "bottom-right",
        //   classNames: {
        //     content: "flex flex-col gap-2",
        //   },
        //   style: {
        //     "--border-radius": "calc(var(--radius)  + 4px)",
        //   } as React.CSSProperties,
        // });
      },
    },
  });
  const generateSlug = (name: string) => {
    // Check if name contains Thai characters
    const hasThaiCharacters = /[\u0E00-\u0E7F]/.test(name);

    if (hasThaiCharacters) {
      // Generate random slug with timestamp
      const randomStr = Math.random().toString(36).substring(2, 8);
      const timestamp = Date.now().toString(36);
      return `store-${randomStr}-${timestamp}`;
    }

    // Generate slug from name only use alphabet and number and -
    return name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/^-+|-+$/g, "");
  };
  return (
    <>
      <div className="flex items-center justify-center p-10">
        <div className="w-full sm:mx-auto sm:max-w-4xl">
          <h3 className="text-2xl font-normal tracking-widest text-foreground dark:text-foreground">
            สร้างร้านค้าของคุณ
          </h3>
          <p className="mt-1 text-sm font-normal tracking-widest  text-muted-foreground dark:text-muted-foreground">
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
                        <FieldLabel
                          htmlFor={field.name}
                          className="font-normal tracking-widest"
                        >
                          ชื่อร้านค้า
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.handleChange(value);
                              formCreateOrg.setFieldValue(
                                "slug",
                                generateSlug(value),
                              );
                            }}
                            aria-invalid={isInvalid}
                            placeholder="ชื่อร้านค้าของคุณ"
                            className="font-normal tracking-widest"
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

              {/* Slug Field */}
              <div className="col-span-full">
                <formCreateOrg.Field
                  name="slug"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field className="gap-2" data-invalid={isInvalid}>
                        <FieldLabel
                          htmlFor={field.name}
                          className="font-normal tracking-widest"
                        >
                          ชื่อโดเมนร้านค้า
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            disabled={true}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="my-store"
                            className="font-normal tracking-widest"
                          />
                        </InputGroup>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                        <FieldDescription className="font-normal tracking-widest">
                          Slug จะถูกสร้างขึ้นโดยอัตโนมัติจากชื่อร้านค้า หากชื่อร้านค้ามีภาษาไทย จะถูกสร้างขึ้นโดยอัตโนมัติ
                        </FieldDescription>
                      </Field>
                    );
                  }}
                />
              </div>
            </div>

            <Button
              type="submit"
              form="form-create-org"
              className="active:scale-95 duration-300 cursor-pointer flex justify-center gap-2 py-3 px-2 h-11 w-full mt-6 font-normal tracking-widest "
            >
              <p className="text-base font-normal tracking-widest">
                สร้างร้านค้า
              </p>
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateOrg;
