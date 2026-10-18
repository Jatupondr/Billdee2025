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
import { authClient } from "@/lib/auth-client";

export const formSchema = v.object({
  email: v.pipe(
    v.string("กรุณากรอกอีเมล"),
    v.nonEmpty("กรุณากรอกอีเมล"),
    v.maxLength(255, "อีเมลยาวเกินไป"),
    v.email("รูปแบบอีเมลไม่ถูกต้อง"),
  ),
  password: v.pipe(
    v.string("กรุณากรอกรหัสผ่าน"),
    v.nonEmpty("กรุณากรอกรหัสผ่าน"),
    v.minLength(6, "รหัสผ่านอย่างน้อย 6 ตัวอักษร"),
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
        authClient.signIn.email(
          {
            email: value.email.trim(),
            password: value.password.trim(),
            callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}`,
            rememberMe: true,
          },
          {
            onSuccess: (data) => {


              if (data) {
                toast.success("เข้าสู่ระบบสำเร็จ", {
                  description: "ยินดีต้อนรับเข้าสู่ระบบ",
                });
              }
            },
            onError: (error) => {
              toast.error(error.error.message || error.error.statusText, {
                description: "กรุณาลองใหม่อีกครั้ง",
              });
            },
          },
        );
      },
    },
  });

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social(
        {
          provider: "google",
          callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}`,
        },
        {
          onSuccess: () => {
            toast.success("Successfully signed in with Google");
          },
          onError: (error) => {
            toast.error(error.error.message || "Failed to sign in with Google");
          },
        },
      );
    } catch (error) {
      toast.error("An error occurred during sign-in");
    }
  };
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
            <h1 className="text-4xl font-normal tracking-widest text-caption ">
              Billdee บิลดี
            </h1>
            <FieldDescription className=" text-xl font-normal tracking-widest">
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
                        <FieldLabel
                          htmlFor={field.name}
                          className="font-normal tracking-widest"
                        >
                          อีเมล
                        </FieldLabel>

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
                            className="font-normal tracking-widest "
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
                        <FieldLabel
                          htmlFor={field.name}
                          className="font-normal tracking-widest"
                        >
                          รหัสผ่าน
                        </FieldLabel>
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
                            className="font-normal tracking-widest"
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
                        <FieldDescription className=" text-right font-normal tracking-widest">
                          <a
                            href="/forgot-password"
                            className="text-sm font-normal tracking-widest"
                          >
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
              className="active:scale-95 duration-300 cursor-pointer flex justify-center gap-2 py-3 px-2 h-11 w-full font-normal tracking-widest  "
            >
              <SignInIcon
                size={32}
                weight="fill"
                className="size-5 dark:text-gray-100"
              />
              <p className="text-base font-normal tracking-widest">
                เข้าสู่ระบบ
              </p>
            </Button>
          </Field>
          <FieldSeparator className="font-normal tracking-widest">
            หรือ
          </FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-1">
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              type="button"
              className="active:scale-95 duration-300 cursor-pointer py-3 px-2 h-11 w-full flex justify-center gap-2 font-normal tracking-widest"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              <p className="font-normal tracking-widest">
                Continue with Google
              </p>
            </Button>
          </Field>
        </FieldGroup>

        <FieldDescription className=" flex justify-center items-center gap-2  font-normal tracking-widest">
          <span className="text-sm font-normal tracking-widest text-center">
            หากคุณยังไม่มีบัญชี
          </span>
          <a href="/register" className="text-sm font-normal tracking-widest">
            สามารถสมัครสมาชิกได้ที่นี่
          </a>
        </FieldDescription>

        <FieldDescription className="px-6 text-center font-normal tracking-widest">
          เมื่อคลิก “เข้าสู่ระบบ”คุณยอมรับ{" "}
          <a href="#" className="font-normal tracking-widest">
            ข้อตกลงการให้บริการ
          </a>{" "}
          และ{" "}
          <a href="#" className="font-normal tracking-widest">
            นโยบายความเป็นส่วนตัว
          </a>
          .
        </FieldDescription>
      </div>
    </>
  );
};

export default LoginComponent;
