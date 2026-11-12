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
  CheckIcon,
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
  const [legacyOpen, setLegacyOpen] = useState(false);
  const perks = [
    "ออกบิลในไม่กี่วินาที ส่งเข้าแชทลูกค้าได้ทันที",
    "สรุปยอดรายเดือน ส่งออก Excel / PDF",
    "PostHub ส่งรายการสินค้าเข้าทุกกลุ่มในคลิกเดียว",
  ];
  return (
    // เต็มจอ ทับกรอบเล็กของ layout หน้า auth
    <div className="fixed inset-0 z-10 overflow-y-auto bg-[#070c1c] text-[#eef2ff]">
      <div className="grid min-h-full lg:grid-cols-2">
        <section className="relative hidden overflow-hidden border-r border-[#141c3a] bg-[#0b1230] px-16 py-14 lg:flex lg:flex-col lg:justify-between">
          <div aria-hidden className="pointer-events-none absolute -left-52 top-32 size-[900px] rounded-full bg-[radial-gradient(closest-side,rgba(59,91,255,0.3),transparent)]" />
          <div className="relative flex items-center gap-3">
            <Image src="/logo.png" alt="" width={40} height={40} className="rounded-[10px]" />
            <span className="text-[22px] font-semibold">Billdee</span>
          </div>
          <div className="relative flex flex-col gap-6">
            <h2 className="text-[46px] font-medium leading-tight">
              ออกบิลไว ส่งของเข้ากลุ่ม
              <br />
              <span className="text-[#8ea6ff]">จบในที่เดียว</span>
            </h2>
            <ul className="flex flex-col gap-3.5 text-[17px] text-[#c7d0ee]">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <CheckIcon size={22} weight="bold" className="text-[#5fd39a]" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <span className="relative text-sm text-[#8b96bd]">© 2026 Billdee</span>
        </section>

        <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-12 lg:min-h-0">
          <div aria-hidden className="pointer-events-none absolute -top-44 left-1/2 size-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,91,255,0.3),transparent)] lg:hidden" />
          <div className="relative flex w-full max-w-[420px] flex-col items-center gap-7 text-center">
            <Image src="/logo.png" alt="Billdee" width={84} height={84} priority />
            <div className="flex flex-col gap-2.5">
              <h1 className="text-[34px] font-medium lg:text-[40px]">Billdee บิลดี</h1>
              <p className="text-[16px] leading-relaxed text-[#a8b3d6] lg:text-[17px]">
                เข้าสู่ระบบ หรือสมัครใหม่ ด้วยบัญชี Google
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex h-[60px] w-full items-center justify-center gap-3.5 rounded-2xl bg-white text-[18px] font-semibold text-[#1f2937] shadow-[0_14px_36px_rgba(0,0,0,0.4)] transition-transform active:scale-[0.98]"
            >
              <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
              ดำเนินการต่อด้วย Google
            </button>

            <div className="flex w-full flex-col gap-2.5 rounded-2xl border border-[#222c55] bg-[#0e1530] px-[18px] py-4 text-left text-sm leading-relaxed text-[#a8b3d6]">
              <span className="flex gap-2.5"><span className="text-[#8ea6ff]">•</span>ยังไม่มีบัญชี? กดปุ่มเดียวกัน ระบบสมัครให้อัตโนมัติ</span>
              <span className="flex gap-2.5"><span className="text-[#8ea6ff]">•</span>ใช้ Google บัญชีเดียวกับ PostHub ข้อมูลแพ็กเกจจะเชื่อมกันเอง</span>
            </div>

            <p className="text-[13px] leading-relaxed text-[#8b96bd]">
              เมื่อดำเนินการต่อ ถือว่าคุณยอมรับ{" "}
              <a href="/privacy" className="text-[#9db4ff] hover:underline">นโยบายความเป็นส่วนตัว</a>
            </p>

            {/* บัญชีเก่าที่สมัครด้วยอีเมล+รหัสผ่าน (ช่วงเปลี่ยนผ่าน) */}
            <div className="w-full border-t border-[#141c3a] pt-4">
              <button
                type="button"
                onClick={() => setLegacyOpen((v) => !v)}
                aria-expanded={legacyOpen}
                className="min-h-11 text-sm text-[#8b96bd] underline-offset-4 hover:text-[#c7d4ff] hover:underline"
              >
                เคยสมัครด้วยอีเมล? เข้าสู่ระบบแบบเดิม
              </button>
              {legacyOpen && (
                <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-[#222c55] bg-[#0e1530] p-4 text-left">
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

                  <Button
                    type="submit"
                    form="form-login"
                    className="h-11 w-full font-normal tracking-widest"
                  >
                    <SignInIcon size={20} weight="fill" />
                    เข้าสู่ระบบด้วยอีเมล
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginComponent;
