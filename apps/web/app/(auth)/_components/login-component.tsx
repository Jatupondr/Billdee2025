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
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { toast } from "sonner";
import {
  EnvelopeSimpleIcon,
  EyeIcon,
  EyeSlashIcon,
  PasswordIcon,
  SignInIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

export const formSchema = v.object({
  email: v.pipe(
    v.string("กรุณากรอกอีเมล"),
    v.nonEmpty("กรุณากรอกอีเมล"),
    v.maxLength(255, "อีเมลยาวเกินไป"),
    v.email("รูปแบบอีเมลไม่ถูกต้อง")
  ),
  password: v.pipe(
    v.string("กรุณากรอกรหัสผ่าน"),
    v.nonEmpty("กรุณากรอกรหัสผ่าน"),
    v.minLength(6, "รหัสผ่านอย่างน้อย 6 ตัวอักษร")
  ),
});

type loginData = v.InferOutput<typeof formSchema>;
const defaultValues: loginData = {
  email: "",
  password: "",
};

const LoginComponent = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const formLogin = useForm({
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
              Billdee บิลดี
            </h1>
            <FieldDescription className="tracking-wider">
              ล็อกอินเข้าสู่ระบบ
            </FieldDescription>
          </div>
          <form
            id="form-login"
            onSubmit={(e) => {
              e.preventDefault();
              formLogin.handleSubmit();
            }}
            className="flex flex-col gap-3"
          >
            <FieldSet data-invalid>
              <FieldGroup className="flex flex-col gap-6 text-left">
                <formLogin.Field
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
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="อีเมลหรือชื่อผู้ใช้"
                            autoComplete="email"
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
                <formLogin.Field
                  name="password"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>รหัสผ่าน</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            type={showPassword ? "text" : "password"}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="รหัสผ่าน"
                            className="tracking-widest"
                          />
                          <InputGroupAddon>
                            <PasswordIcon
                              size={32}
                              className="size-5 dark:text-gray-100"
                            />
                            {/* <CircleUserRound className="size-5 dark:text-gray-100" /> */}
                          </InputGroupAddon>

                          <InputGroupAddon
                            align="inline-end"
                            onClick={() => setShowPassword(!showPassword)}
                            className="cursor-pointer active:scale-95 duration-300"
                          >
                            <div className="transition-all duration-200 ease-in-out">
                              {showPassword ? (
                                <EyeSlashIcon
                                  size={32}
                                  className="size-5 dark:text-gray-100"
                                />
                              ) : (
                                <EyeIcon
                                  size={32}
                                  className="size-5 dark:text-gray-100"
                                />
                              )}
                            </div>
                          </InputGroupAddon>
                        </InputGroup>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                        <FieldDescription className="text-right">
                          <a href="/forgot" className="text-sm ">
                            ลืมรหัสผ่าน?
                          </a>
                        </FieldDescription>
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
              form="form-login"
              className="active:scale-95 duration-300 cursor-pointer flex justify-center gap-2 py-3 px-2 h-11 w-full"
            >
              <SignInIcon
                size={32}
                weight="fill"
                className="size-5 dark:text-gray-100"
              />
              <p className="text-base tracking-widest">เข้าสู่ระบบ</p>
            </Button>
          </Field>
          <FieldSeparator>หรือ</FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-1">
            <Button
              variant="outline"
              type="button"
              className="active:scale-95 duration-300 cursor-pointer py-3 px-2 h-11 w-full flex justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>

        <FieldDescription className="px-6 text-center">
          เมื่อคลิก “เข้าสู่ระบบ”คุณยอมรับ <a href="#">ข้อตกลงการให้บริการ</a>{" "}
          และ <a href="#">นโยบายความเป็นส่วนตัว</a>.
        </FieldDescription>
      </div>
    </>
  );
};

export default LoginComponent;
