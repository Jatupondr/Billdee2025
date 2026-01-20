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
import { useEffect, useState } from "react";
import * as v from "valibot";
import { toast } from "sonner";
import DeleteUserDialog from "./delete-user-dialog";

export const formSchema = v.object({
  name: v.pipe(
    v.string(""),
    v.maxLength(255, "Name must be at most 255 characters."),
  ),
  phoneNumber: v.pipe(
    v.string(""),
    v.maxLength(255, "Phone must be at most 255 characters."),
  ),
  email: v.pipe(
    v.string(""),
    v.maxLength(255, "Email must be at most 255 characters."),
  ),
});

type orgData = v.InferOutput<typeof formSchema>;
const defaultValues: orgData = {
  name: "",
  phoneNumber: "",
  email: "",
};

interface UserInfoProps {
  accounts: any;
}

export default function UserInfo({ accounts }: UserInfoProps) {
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const [openDeleteUserDialog, setOpenDeleteUserDialog] = useState(false);


  const form = useForm({
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),

    validators: {
      onDynamic: formSchema,
      onSubmit: formSchema,
      onSubmitAsync: async ({ value }) => {
        await authClient.updateUser(
          {
            name: value.name,
            phoneNumber: value.phoneNumber,
          },

          {
            onSuccess: (data) => {
              if (data) {
                toast.success("สำเร็จ", {
                  description: "แก้ไขข้อมูลร้านค้าสำเร็จ",
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
  useEffect(() => {
    if (session) {
      form.setFieldValue("name", session?.user?.name);
      form.setFieldValue("email", session?.user?.email);
      form.setFieldValue("phoneNumber", session?.user?.phoneNumber);
    }
  }, [session]);

  const router = useRouter();
  return (
    <div className="flex py-8 px-6 w-full bg-white mt-4 dark:bg-zinc-900 flex-col rounded-2xl shadow-xl border border-border/50 ">
      <form
        id="form-organization"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className=" text-foreground dark:text-foreground text-xl font-normal tracking-widest">
              ข้อมูลผู้ใช้
            </h2>
            <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-zinc-400 font-normal tracking-widest">
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
                        <FieldLabel
                          htmlFor={field.name}
                          className="font-normal tracking-widest"
                        >
                          ชื่อผู้ใช้
                        </FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            className="font-normal tracking-widest"
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
                  name="phoneNumber"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>
                          <span className="font-normal tracking-widest">
                            เบอร์โทรศัพท์
                          </span>
                        </FieldLabel>

                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            className="font-normal tracking-widest"
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
                            disabled
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            className="font-normal tracking-widest"
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
            <h2 className="font-normal tracking-widest text-foreground dark:text-foreground text-xl">
              สถานะอีเมล
            </h2>
            <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-zinc-400 font-normal tracking-widest">
              รายละเอียดเกี่ยวกับสถานะอีเมลของคุณ
            </p>
          </div>
          <div className="sm:max-w-3xl md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="col-span-full">
                <p className="text-base font-normal tracking-widest">
                  อีเมล: {session?.user?.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-normal tracking-widest">สถานะ:</span>
                  {session?.user?.emailVerified ? (
                    <Badge
                      variant="default"
                      className="font-normal tracking-widest"
                    >
                      <span className="flex items-center gap-1">
                        ✓ ยืนยันแล้ว
                      </span>
                    </Badge>
                  ) : (
                    <Badge
                      variant="destructive"
                      className="font-normal tracking-widest"
                    >
                      ยังไม่ยืนยัน
                    </Badge>
                  )}
                </div>
                {!session?.user?.emailVerified && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap mt-4 cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
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
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-normal tracking-widest text-foreground dark:text-foreground text-xl">
              เชื่อมต่อบัญชีโซเชียลมีเดีย
            </h2>
            <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-zinc-400 font-normal tracking-widest">
              รายละเอียดเกี่ยวกับสถานะเชื่อมต่อบัญชีโซเชียลมีเดียของคุณ
            </p>
          </div>
          <div className="sm:max-w-3xl md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="col-span-full">
                <p className="text-base font-normal tracking-widest">
                  เชื่อมต่อผ่าน:{" "}
                  {accounts.providerId === "google"
                    ? "Google"
                    : "credential"}
                </p>

              </div>
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        {accounts.providerId === "credential" && (
          <>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <div>
                <h2 className="font-normal tracking-widest text-foreground dark:text-foreground text-xl">
                  ลบบัญชีผู้ใช้
                </h2>
              </div>
              <div className="sm:max-w-3xl md:col-span-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                  <div className="col-span-full space-y-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="whitespace-nowrap   cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
                      onClick={() => {
                        setOpenDeleteUserDialog(true);
                      }}
                    >
                      ลบบัญชีผู้ใช้
                    </Button>
                    <div className="space-x-2">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 font-normal tracking-widest">
                        <span className="text-destructive tracking-wide font-medium leading-6">
                          *
                        </span>{" "}
                        หากลบบัญชีผู้ใช้แล้ว
                        ข้อมูลทั้งหมดจะถูกลบอย่างถาวรและไม่สามารถกู้คืนได้
                      </p>
                      <p className="text-sm text-zinc-600  dark:text-zinc-400 font-normal tracking-widest">
                        <span className="text-destructive tracking-wide font-medium leading-6">
                          *
                        </span>{" "}
                        หากเเพ็กแก็จยังเหลือวันใช้งานอยู่
                        ข้อมูลจะถูกลบอย่างถาวรและไม่สามารถกู้คืนได้
                      </p>
                      <p className="text-sm text-zinc-600  dark:text-zinc-400 font-normal tracking-widest">
                        <span className="text-destructive tracking-wide font-medium leading-6">
                          *
                        </span>{" "}
                        หากสมัครสมาชิกโดยใช้อีเมลเดิม ที่ลบบัญชีผู้ใช้แล้ว
                        จะถือว่าเป็นสมาชิกใหม่ และต้องสมัครเเพ็กแก็จใหม่
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
          </>
        )}
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
            form="form-organization"
            className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
          >
            อัพเดทข้อมูล
          </Button>
        </div>
      </form>
      <DeleteUserDialog
        open={openDeleteUserDialog}
        onOpenChange={setOpenDeleteUserDialog}
        user={session}
      />
    </div>
  );
}
