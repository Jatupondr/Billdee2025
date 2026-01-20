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
import { useEffect } from "react";
import { toast } from "sonner";
import * as v from "valibot";

export const formSchema = v.object({
  password: v.pipe(
    v.string(""),
    v.maxLength(255, "Name must be at most 255 characters.")
  ),
  newPassword: v.pipe(
    v.string(""),
    v.maxLength(255, "Name must be at most 255 characters.")
  ),
  confirmPassword: v.pipe(
    v.string(""),
    v.maxLength(255, "Name must be at most 255 characters.")
  ),
});

type orgData = v.InferOutput<typeof formSchema>;
const defaultValues: orgData = {
  password: "",
  newPassword: "",
  confirmPassword: "",
};

export default function PasswordInfo() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  console.log("session", session);

  const form = useForm({
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),

    validators: {
      onDynamic: formSchema,
      onSubmit: formSchema,
      onSubmitAsync: async ({ value }) => {
        console.log("value", value);
        await authClient.changePassword({
          newPassword: value.newPassword, // required
          currentPassword: value.password, // required
          revokeOtherSessions: true,
        },
          {
            onSuccess: (data) => {
              console.log("data", data);
              toast.success("สำเร็จ", {
                description: "แก้ไขรหัสผ่านสำเร็จ",
              });
            },
            onError: (error) => {
              console.log("error", error);
              toast.error("เกิดข้อผิดพลาด", {
                description: error.error.message || "ไม่สามารถแก้ไขรหัสผ่านได้",
              });
            },
          },
        );
      },
    },
  });
  // useEffect(() => {
  //   if (session) {
  //     form.setFieldValue("name", session.user.name);
  //   }
  // }, [session]);

  const router = useRouter();
  return (
    <div className="flex py-8 px-6 w-full bg-white mt-4 dark:bg-zinc-900 flex-col rounded-2xl shadow-xl border border-border/50 ">
      <form
        id="form-password"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-normal tracking-widest text-foreground dark:text-foreground text-xl">
              รหัสผ่านใหม่
            </h2>
            <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-zinc-400 font-normal tracking-widest">
              เเก้ไขรหัสผ่านของคุณ
            </p>
          </div>
          <div className="sm:max-w-3xl md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="col-span-full ">
                <form.Field
                  name="password"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">
                          รหัสผ่านปัจจุบัน
                        </FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            type="password"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            className="font-normal tracking-widest"
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="รหัสผ่านใหม่"
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
                  name="newPassword"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>
                          <span className="font-normal tracking-widest">รหัสผ่านใหม่</span>
                        </FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            type="password"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            className="font-normal tracking-widest"
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="รหัสผ่านใหม่"
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
              <div className="col-span-full ">
                <form.Field
                  name="confirmPassword"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">
                          ยืนยันรหัสผ่านใหม่
                        </FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            type="password"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            className="font-normal tracking-widest"
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="ยืนยันรหัสผ่านใหม่"
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
            form="form-password"
            className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
          >
            อัพเดทรหัสผ่าน
          </Button>
        </div>
      </form>
    </div>
  );
}
