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
  UserCircleIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter, useSearchParams } from "next/navigation";

export const formSchema = v.pipe(
  v.object({
    email: v.pipe(
      v.string("กรุณากรอกอีเมล"),
      v.nonEmpty("กรุณากรอกอีเมล"),
      v.maxLength(255, "อีเมลยาวเกินไป"),
      v.email("รูปแบบอีเมลไม่ถูกต้อง"),
    ),
    name: v.pipe(
      v.string("กรุณากรอกชื่อ"),
      v.nonEmpty("กรุณากรอกชื่อ"),
      v.maxLength(255, "ชื่อยาวเกินไป"),
    ),
    password: v.pipe(
      v.string("กรุณากรอกรหัสผ่าน"),
      v.nonEmpty("กรุณากรอกรหัสผ่าน"),
      v.minLength(6, "รหัสผ่านอย่างน้อย 6 ตัวอักษร"),
    ),
    confirmPassword: v.pipe(
      v.string("กรุณายืนยันรหัสผ่าน"),
      v.nonEmpty("กรุณายืนยันรหัสผ่าน"),
    ),
    acceptNewsletter: v.boolean("กรุณายอมรับการรับข่าวสาร"),
    referralCode: v.optional(v.string()),
  }),
  v.forward(
    v.partialCheck(
      [["password"], ["confirmPassword"]],
      (input) => input.password === input.confirmPassword,
      "รหัสผ่านไม่ตรงกัน",
    ),
    ["confirmPassword"],
  ),
);

type loginData = v.InferOutput<typeof formSchema>;
const defaultValues: loginData = {
  email: "",
  password: "",
  name: "",
  confirmPassword: "",
  acceptNewsletter: false,
  referralCode: "",
};

const RegisterComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCodeParam = searchParams.get("referalCode");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const formLogin = useForm({
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),

    validators: {
      onDynamic: formSchema,
      onSubmit: formSchema,
      onSubmitAsync: async ({ value }) => {
        authClient.signUp.email(
          {
            email: value.email.trim(),
            password: value.password.trim(),
            name: value.name.trim(),
            referralCode: referralCodeParam || "",
            phoneNumber: "",
            callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}`,
          },
          {
            onSuccess: (data) => {


              if (data) {
                toast.success("สมัครสมาชิกสำเร็จ", {
                  description: "ยินดีต้อนรับเข้าสู่ระบบ กรุณาตรวจสอบอีเมล์ของคุณ",
                });
                router.push("/login");
              }
            },
            onError: (error) => {
              toast.error(error.error.message || error.error.statusText, {
                description: error.error.message || "กรุณาลองใหม่อีกครั้ง",
              });
            },
          },
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
              สมัครสมาชิก
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
                      </Field>
                    );
                  }}
                />
                <formLogin.Field
                  name="confirmPassword"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel
                          htmlFor={field.name}
                          className="font-normal tracking-widest"
                        >
                          ยืนยันรหัสผ่าน
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            type={showConfirmPassword ? "text" : "password"}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="ยืนยันรหัสผ่าน"
                            className="font-normal tracking-widest"
                          />
                          <InputGroupAddon>
                            <PasswordIcon
                              size={32}
                              className="size-5 dark:text-gray-100"
                            />
                          </InputGroupAddon>

                          <InputGroupAddon
                            align="inline-end"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="cursor-pointer active:scale-95 duration-300"
                          >
                            <div className="transition-all duration-200 ease-in-out">
                              {showConfirmPassword ? (
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
                      </Field>
                    );
                  }}
                />
                <formLogin.Field
                  name="name"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel
                          htmlFor={field.name}
                          className="font-normal tracking-widest"
                        >
                          ชื่อ-นามสกุล
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
                            placeholder="ชื่อ-นามสกุล"
                            className="font-normal tracking-widest "
                          />
                          <InputGroupAddon>
                            <UserCircleIcon
                              size={32}
                              className="size-5 dark:text-gray-100"
                            />
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
                  name="acceptNewsletter"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={field.name}
                            name={field.name}
                            checked={field.state.value}
                            onBlur={field.handleBlur}
                            onCheckedChange={field.handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          />
                          <FieldLabel
                            htmlFor={field.name}
                            className="font-normal tracking-widest cursor-pointer mb-0"
                          >
                            ฉันต้องการรับข่าวสารและโปรโมชั่นจาก Billdee
                          </FieldLabel>
                        </div>
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
              form="form-login"
              className="active:scale-95 bg-green-500 hover:bg-green-600 duration-300 cursor-pointer flex justify-center gap-2 py-3 px-2 h-11 w-full font-normal tracking-widest  "
            >
              <SignInIcon
                size={32}
                weight="fill"
                className="size-5 dark:text-gray-100"
              />
              <p className="text-base font-normal tracking-widest">
                สมัครสมาชิก
              </p>
            </Button>
          </Field>
        </FieldGroup>

        <FieldDescription className=" flex justify-center items-center gap-2  font-normal tracking-widest">
          <span className="text-sm font-normal tracking-widest text-center">
            หากคุณมีบัญชี
          </span>
          <a href="/login" className="text-sm font-normal tracking-widest">
            เข้าสู่ระบบที่นี่
          </a>
        </FieldDescription>
      </div>
    </>
  );
};

export default RegisterComponent;
