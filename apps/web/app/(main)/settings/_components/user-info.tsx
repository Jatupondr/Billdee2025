"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import * as v from "valibot";

export const formSchema = v.object({
  name: v.pipe(
    v.string(""),
    v.maxLength(255, "Name must be at most 255 characters.")
  ),
  phone: v.pipe(
    v.string(""),
    v.maxLength(255, "Phone must be at most 255 characters.")
  ),
  email: v.pipe(
    v.string(""),
    v.maxLength(255, "Email must be at most 255 characters.")
  ),
});

type orgData = v.InferOutput<typeof formSchema>;
const defaultValues: orgData = {
  name: "",
  phone: "",
  email: "",
};

export default function UserInfo() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  console.log("session", session);

  const form = useForm({
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),

    validators: {
      onDynamic: formSchema,
      onSubmit: formSchema,
      onSubmitAsync: async ({ value }) => {
        alert("Submitted value: " + JSON.stringify(value, null, 2));
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
  useEffect(() => {
    if (session) {
      form.setFieldValue("name", session?.user?.name);
      form.setFieldValue("email", session?.user?.email);
    }
  }, [session]);

  const router = useRouter();
  return (
    <div className="flex py-8 px-6 w-full bg-white mt-4 dark:bg-black flex-col rounded-2xl shadow-xl border border-border/50 ">
      <form
        id="form-organization"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-semibold text-foreground dark:text-foreground text-xl">
              ข้อมูลผู้ใช้
            </h2>
            <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-muted-foreground">
              รายละเอียดเกี่ยวกับข้อมูลผู้ใช้
            </p>
          </div>
          <div className="sm:max-w-3xl md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="col-span-full sm:col-span-3">
                <form.Field
                  name="name"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>ชื่อผู้ใช้</FieldLabel>

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
                            placeholder="ชื่อร้านค้าของคุณ"
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
              <div className="col-span-full sm:col-span-3">
                <form.Field
                  name="phone"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>
                          เบอร์โทรศัพท์
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
                            placeholder="เบอร์โทรศัพท์ของคุณ"
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
              <div className="col-span-full sm:col-span-3">
                <form.Field
                  name="email"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>อีเมล</FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            disabled
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                            placeholder="อีเมลของคุณ"
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
            </div>
          </div>
        </div>

        <Separator className="my-4" />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-semibold text-foreground dark:text-foreground text-xl">
              สถานะอีเมล
            </h2>
            <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-muted-foreground">
              รายละเอียดเกี่ยวกับสถานะอีเมลของคุณ
            </p>
          </div>
          <div className="sm:max-w-3xl md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="col-span-full">
                <p className="text-base">อีเมล: {session?.user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span>สถานะ:</span>
                  {session?.user?.emailVerified ? (
                    <Badge variant="default">
                      <span className="flex items-center gap-1">
                        ✓ ยืนยันแล้ว
                      </span>
                    </Badge>
                  ) : (
                    <Badge variant="destructive">ยังไม่ยืนยัน</Badge>
                  )}
                </div>
                {!session?.user?.emailVerified && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap mt-4 cursor-pointer active:scale-95 duration-200 ease-in-out"
                    onClick={() => {
                      alert("ส่งอีเมลยืนยันไปยัง " + session?.user?.email);
                    }}
                  >
                    ส่งอีเมลยืนยันใหม่
                  </Button>
                )}
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
            className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out"
            onClick={() => router.back()}
          >
            ย้อนกลับ
          </Button>
          <Button
            type="submit"
            size="lg"
            form="form-organization"
            className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out"
          >
            บันทึกข้อมูล
          </Button>
        </div>
      </form>
    </div>
  );
}
