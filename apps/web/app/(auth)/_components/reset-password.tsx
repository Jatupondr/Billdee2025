

"use client";
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
import { LockSimpleIcon, SignInIcon } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
export const formSchema = v.object({
  password: v.pipe(
    v.string("กรุณากรอกรหัสผ่านใหม่"),
    v.minLength(6, "รหัสผ่านอย่างน้อย 6 ตัวอักษร"),
  ),
  confirmPassword: v.pipe(
    v.string("กรุณากรอกรหัสผ่านยืนยัน"),
    v.minLength(6, "รหัสผ่านอย่างน้อย 6 ตัวอักษร"),
  ),
});

type resetPasswordData = v.InferOutput<typeof formSchema>;
const defaultValues: resetPasswordData = {
  password: "",
  confirmPassword: "",
};
const ResetPasswordComponent = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errortoken = searchParams.get("error");
  const formResetPassword = useForm({
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),

    validators: {
      onDynamic: formSchema,
      onSubmit: formSchema,
      onSubmitAsync: async ({ value }) => {

        await authClient.resetPassword(
          {
            newPassword: value.password.trim(), // required
            token: token || "", // required
          },
          {
            onSuccess: (data) => {
              toast.success("รีเซ็ตรหัสผ่านสำเร็จ");
              router.push(`/login`);
            },
            onError: (error: any) => {
              const message =
                error?.response?.data?.message ||
                error?.message ||
                "เกิดข้อผิดพลาด";
              toast.error("ไม่สามารถรีเซ็ตรหัสผ่านได้", {
                description: message,
              });
            },
          }
        );
      },
    },
  });
  useEffect(() => {
    if (errortoken) {
      router.push(`/login`);
    }
  }, [errortoken]);
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
                <svg
                  width="96"
                  height="68"
                  viewBox="0 0 48 34"
                  xmlns="http://www.w3.org/2000/svg"
                  data-logo="logo"
                >
                  <g
                    transform="translate(0, 0) rotate(0)"
                    id="logogram"
                    style={{ opacity: 1 }}
                  >
                    <path
                      fill="#123C68"
                      d="M15.4992 0H36.5808L21.0816 22.9729H0L15.4992 0Z"
                    ></path>
                    <path
                      fill="#B0B0B0"
                      d="M16.4224 25.102L10.4192 34H32.5008L48 11.0271H31.7024L22.2064 25.102H16.4224Z"
                    ></path>
                  </g>
                  <g
                    transform="translate(48, 17)"
                    id="logotype"
                    style={{ opacity: 1 }}
                  ></g>
                </svg>
              </div>
              <span className="sr-only">Acme Inc.</span>
            </a>
            <h1 className="text-2xl font-normal tracking-widest text-caption">
              Billdee ตั้งค่ารหัสผ่านใหม่
            </h1>
            <FieldDescription className="tracking-wider font-normal">
              ตั้งค่ารหัสผ่านใหม่ด้วยอีเมลที่ใช้งาน
            </FieldDescription>
          </div>
          <form
            id="form-reset-password"
            onSubmit={(e) => {
              e.preventDefault();
              formResetPassword.handleSubmit();
            }}
            className="flex flex-col gap-3"
          >
            <FieldSet data-invalid>
              <FieldGroup className="flex flex-col gap-2 text-left">
                <formResetPassword.Field
                  name="password"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>รหัสผ่านใหม่</FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}

                            onChange={(e) => field.handleChange(e.target.value)}
                            type="password"
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="รหัสผ่านใหม่"

                          />
                          <InputGroupAddon>
                            <LockSimpleIcon
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
                <formResetPassword.Field
                  name="confirmPassword"
                  validators={{
                    onChange: ({ value, fieldApi }) => {
                      const password = fieldApi.form.getFieldValue("password");
                      if (value && password && value !== password) {
                        return { message: "รหัสผ่านยืนยันไม่ตรงกับรหัสผ่านใหม่" };
                      }
                      return undefined;
                    },
                  }}
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>ยืนยันรหัสผ่านใหม่</FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            type="password"
                            value={field.state.value}
                            onBlur={field.handleBlur}

                            onChange={(e) => field.handleChange(e.target.value)}

                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="ยืนยันรหัสผ่านใหม่"

                          />
                          <InputGroupAddon>
                            <LockSimpleIcon
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
              form="form-reset-password"
              className="active:scale-95 duration-300 cursor-pointer flex justify-center gap-2 py-3 px-2 h-9 w-full"
            >
              <SignInIcon
                size={32}
                weight="fill"
                className="size-5 dark:text-gray-100 tracking-widest font-normal"
              />
              ตั้งค่ารหัสผ่านใหม่
            </Button>
          </Field>
        </FieldGroup>
      </div>
    </>
  );
};

export default ResetPasswordComponent;
