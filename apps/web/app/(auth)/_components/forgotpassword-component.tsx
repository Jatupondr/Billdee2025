"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import * as v from "valibot";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { toast } from "sonner";
import { EnvelopeSimpleIcon, SignInIcon } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
export const formSchema = v.object({
  email: v.pipe(
    v.string("กรุณากรอกอีเมล"),


  ),
});

type loginData = v.InferOutput<typeof formSchema>;
const defaultValues: loginData = {
  email: "",
};
const ForgotPasswordComponent = () => {
  const router = useRouter();
  const formForgotPassword = useForm({
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),

    validators: {
      onDynamic: formSchema,
      onSubmit: formSchema,
      onSubmitAsync: async ({ value }) => {

        await authClient?.requestPasswordReset(
          {
            email: value.email.trim(),
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
          },
          {
            onSuccess: () => {
              toast.success("รีเซ็ตรหัสผ่านสำเร็จ", {
                description: "กรุณาตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน",
              });

            },
            onError: (error) => {
              const errorMessage =
                error.error?.message ||
                error.error?.statusText ||
                "An error occurred during reset password";
              toast.error("รีเซ็ตรหัสผ่านไม่สำเร็จ", {
                description: errorMessage,
              });
            },
          }
        );
      },
    },
  });
  return (
    <>
      <div className={cn("flex flex-col gap-6")}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="/login"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-20 items-center justify-center rounded-md">
                {/* <GalleryVerticalEnd className="size-6" /> */}
                <Image
                  src="/logo.png"
                  alt="Billdee"
                  width={80}
                  height={80}
                  priority
                />
              </div>
              <span className="sr-only">Billdee</span>
            </a>
            <h1 className="text-2xl font-normal tracking-widest text-caption">
              Billdee ลืมรหัสผ่าน
            </h1>
            <FieldDescription className="tracking-wider">
              รีเซ็ตรหัสผ่านด้วยอีเมลที่ใช้งาน
            </FieldDescription>
          </div>
          <form
            id="form-forgot-password"
            onSubmit={(e) => {
              e.preventDefault();
              formForgotPassword.handleSubmit();
            }}
            className="flex flex-col gap-3"
          >
            <FieldSet data-invalid>
              <FieldGroup className="flex flex-col gap-2 text-left">
                <formForgotPassword.Field
                  name="email"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>อีเมล</FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}

                            onChange={(e) => field.handleChange(e.target.value)}
                            autoComplete="email"
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="อีเมลหรือชื่อผู้ใช้"

                          />
                          <InputGroupAddon>
                            <EnvelopeSimpleIcon
                              size={32}
                              className="size-5 dark:text-gray-100"
                            />
                            {/* <CircleUserRound className="size-5 dark:text-gray-100" /> */}
                          </InputGroupAddon>
                        </InputGroup>

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </FieldGroup>
            </FieldSet>
          </form>

          <Field>
            <Button
              type="submit"
              form="form-forgot-password"
              className="active:scale-95 duration-300 cursor-pointer flex justify-center gap-2 py-3 px-2 h-9 w-full"
            >
              <SignInIcon
                size={32}
                weight="fill"
                className="size-5 dark:text-gray-100"
              />
              <p className="text-sm tracking-widest">รีเซ็ตรหัสผ่าน</p>
            </Button>
          </Field>
        </FieldGroup>
      </div>
    </>
  );
};

export default ForgotPasswordComponent;
