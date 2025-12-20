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
import { EnvelopeSimpleIcon, SignInIcon } from "@phosphor-icons/react";
export const formSchema = v.object({
  email: v.pipe(
    v.string("กรุณากรอกอีเมล"),
    v.nonEmpty("กรุณากรอกอีเมล"),
    v.maxLength(255, "อีเมลยาวเกินไป"),
    v.email("รูปแบบอีเมลไม่ถูกต้อง")
  ),
});

type loginData = v.InferOutput<typeof formSchema>;
const defaultValues: loginData = {
  email: "",
};
const ForgotPasswordComponent = () => {
  const formForgotPassword = useForm({
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
              Billdee ลืมรหัสผ่าน
            </h1>
            <FieldDescription className="tracking-wider">
              รีเซ็ตรหัสผ่านด้วยอีเมลที่ใช้งาน
            </FieldDescription>
          </div>
          <form
            id="form-login"
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
              </FieldGroup>
            </FieldSet>
          </form>

          <Field>
            <Button
              type="submit"
              form="form-login"
              className="active:scale-95 duration-300 cursor-pointer flex justify-center gap-2 py-3 px-2 h-9 w-full"
              onClick={() => {
                formForgotPassword.reset();
              }}
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
