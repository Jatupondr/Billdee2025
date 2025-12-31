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
import * as v from "valibot";

export const formSchema = v.object({
  name: v.pipe(
    v.string(""),
    v.maxLength(255, "Name must be at most 255 characters.")
  ),
  slug: v.pipe(
    v.string(""),
    v.maxLength(255, "Slug must be at most 255 characters.")
  ),
  phone: v.pipe(
    v.string(""),
    v.maxLength(20, "Phone number must be at most 20 characters.")
  ),
  taxId: v.pipe(
    v.string(""),
    v.maxLength(50, "Tax ID must be at most 50 characters.")
  ),
  email: v.pipe(
    v.string(""),
    v.maxLength(255, "Email must be at most 255 characters.")
  ),
  address: v.pipe(
    v.string(""),
    v.maxLength(500, "Address must be at most 500 characters.")
  ),
  province: v.pipe(
    v.string(""),
    v.maxLength(100, "Province must be at most 100 characters.")
  ),
  district: v.pipe(
    v.string(""),
    v.maxLength(100, "District must be at most 100 characters.")
  ),
  subDistrict: v.pipe(
    v.string(""),
    v.maxLength(100, "Sub-district must be at most 100 characters.")
  ),
  postalCode: v.pipe(
    v.string(""),
    v.maxLength(20, "Postal code must be at most 20 characters.")
  ),
});

type orgData = v.InferOutput<typeof formSchema>;
const defaultValues: orgData = {
  name: "",
  slug: "",
  phone: "",
  taxId: "",
  email: "",
  address: "",
  province: "",
  district: "",
  subDistrict: "",
  postalCode: "",
};

export default function ShopInfo() {
  const { data: activeOrg, isPending } = authClient.useActiveOrganization();
  console.log("organizations", activeOrg);

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
    if (activeOrg) {
      form.setFieldValue("name", activeOrg.name);
      form.setFieldValue("slug", activeOrg.slug);
    }
  }, [activeOrg]);

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
        {/* <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-semibold text-foreground dark:text-foreground">
              Personal information
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground dark:text-muted-foreground">
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
            </p>
          </div>
          <div className="sm:max-w-3xl md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="col-span-full sm:col-span-3">
                <Field className="gap-2">
                  <FieldLabel htmlFor="first-name">First name</FieldLabel>
                  <Input
                    type="text"
                    id="first-name"
                    name="first-name"
                    autoComplete="given-name"
                    placeholder="Emma"
                  />
                </Field>
              </div>
              <div className="col-span-full sm:col-span-3">
                <Field className="gap-2">
                  <FieldLabel htmlFor="last-name">Last name</FieldLabel>
                  <Input
                    type="text"
                    id="last-name"
                    name="last-name"
                    autoComplete="family-name"
                    placeholder="Crown"
                  />
                </Field>
              </div>
              <div className="col-span-full">
                <Field className="gap-2">
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    placeholder="emma@company.com"
                  />
                </Field>
              </div>
              <div className="col-span-full sm:col-span-3">
                <Field className="gap-2">
                  <FieldLabel htmlFor="birthyear">Birth year</FieldLabel>
                  <Input
                    type="number"
                    id="birthyear"
                    name="year"
                    placeholder="1990"
                  />
                </Field>
              </div>
              <div className="col-span-full sm:col-span-3">
                <Field className="gap-2">
                  <FieldLabel htmlFor="role">Role</FieldLabel>
                  <Input
                    type="text"
                    id="role"
                    name="role"
                    placeholder="Senior Manager"
                    disabled
                  />
                  <FieldDescription>
                    Roles can only be changed by system admin.
                  </FieldDescription>
                </Field>
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-8" /> */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-semibold text-foreground dark:text-foreground text-xl">
              ตั่งค่าข้อมูลร้านค้า
            </h2>
            <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-muted-foreground">
              รายละเอียดเกี่ยวกับร้านค้าของคุณ
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
                        <FieldLabel htmlFor={field.name}>
                          ชื่อร้านค้า
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
                  name="slug"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>slug</FieldLabel>

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
                            placeholder="slug"
                          />
                          {/* <InputGroupAddon>
                            <EnvelopeSimpleIcon
                              size={32}
                              className="size-5 dark:text-gray-100"
                            />

                          </InputGroupAddon> */}
                        </InputGroup>
                        {/* description */}
                        <FieldDescription>
                          Slug จะถูกสร้างขึ้นโดยอัตโนมัติจากชื่อร้านค้า
                        </FieldDescription>

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
                          เบอร์โทรศัพท์ร้านค้า
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
                            placeholder="เบอร์โทรศัพท์ร้านค้า"
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
                  name="taxId"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>
                          เลขประจำตัวผู้เสียภาษี
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
                            placeholder="เลขประจำตัวผู้เสียภาษี"
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
              <div className="col-span-full">
                <Field className="gap-2">
                  <FieldLabel htmlFor="workspace-description">
                    Workspace description
                  </FieldLabel>
                  <Textarea
                    id="workspace-description"
                    name="workspace-description"
                    rows={4}
                  />
                  <FieldDescription>
                    Note: description provided will not be displayed externally.
                  </FieldDescription>
                </Field>
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-semibold text-foreground dark:text-foreground text-xl">
              ที่อยู่ร้านค้า
            </h2>
            <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-muted-foreground">
              รายละเอียดที่อยู่สำหรับร้านค้าของคุณ
            </p>
          </div>
          <div className="sm:max-w-3xl md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="col-span-full">
                <form.Field
                  name="address"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>
                          ที่อยู่ร้านค้า
                        </FieldLabel>

                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          }
                          placeholder="ที่อยู่ร้านค้า"
                        />

                        {isInvalid ? (
                          <FieldError errors={field.state.meta.errors} />
                        ) : (
                          <>
                            <FieldDescription>
                              หมายเหตุ:
                              ที่อยู่จะไม่แสดงผลภายนอกแต่จะแสดงในเอกสารต่างๆ
                            </FieldDescription>
                          </>
                        )}
                      </Field>
                    );
                  }}
                />
              </div>

              <div className="col-span-full sm:col-span-3">
                <form.Field
                  name="province"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>จังหวัด</FieldLabel>

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
                            placeholder="จังหวัด"
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
                  name="district"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>อำเภอ</FieldLabel>

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
                            placeholder="อำเภอ"
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
                  name="subDistrict"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>ตำบล</FieldLabel>

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
                            placeholder="ตำบล"
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
                  name="postalCode"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>
                          รหัสไปรษณีย์
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
                            placeholder="รหัสไปรษณีย์"
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
              {/* <div className="col-span-full sm:col-span-3">
                <Field className="gap-2">
                  <FieldLabel htmlFor="visibility">Visibility</FieldLabel>
                  <Select name="visibility" defaultValue="private">
                    <SelectTrigger id="visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div> */}
            </div>
          </div>
          {/* <div className="sm:max-w-3xl md:col-span-2">
            <fieldset>
              <legend className="text-sm font-medium text-foreground dark:text-foreground">
                Newsletter
              </legend>
              <FieldDescription
                id="newsletter-description"
                className="mt-2 leading-6"
              >
                Change how often you want to receive updates from our
                newsletter.
              </FieldDescription>
              <RadioGroup defaultValue="never" className="mt-6">
                <div className="flex items-center gap-x-3">
                  <RadioGroupItem
                    id="every-week"
                    value="every-week"
                    aria-describedby="newsletter-description"
                  />
                  <FieldLabel htmlFor="every-week" className="font-normal">
                    Every week
                  </FieldLabel>
                </div>
                <div className="flex items-center gap-x-3">
                  <RadioGroupItem
                    id="every-month"
                    value="every-month"
                    aria-describedby="newsletter-description"
                  />
                  <FieldLabel htmlFor="every-month" className="font-normal">
                    Every month
                  </FieldLabel>
                </div>
                <div className="flex items-center gap-x-3">
                  <RadioGroupItem
                    id="never"
                    value="never"
                    aria-describedby="newsletter-description"
                  />
                  <FieldLabel htmlFor="never" className="font-normal">
                    Never
                  </FieldLabel>
                </div>
              </RadioGroup>
            </fieldset>
          </div> */}
        </div>
        <Separator className="my-8" />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-semibold text-foreground dark:text-foreground text-xl">
              บัญชีและการเงิน
            </h2>
            <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-muted-foreground">
              รายละเอียดทสำหรับข้อมุลบัญชีเเละการเงินของร้านค้า
            </p>
          </div>
          <div className="sm:max-w-3xl md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="col-span-full sm:col-span-3">
                <Field className="gap-2">
                  <FieldLabel htmlFor="workspace-name">
                    Workspace name
                  </FieldLabel>
                  <Input
                    type="text"
                    id="workspace-name"
                    name="workspace-name"
                    placeholder="Test workspace"
                  />
                </Field>
              </div>
              <div className="col-span-full sm:col-span-3">
                <Field className="gap-2">
                  <FieldLabel htmlFor="visibility">Visibility</FieldLabel>
                  <Select name="visibility" defaultValue="private">
                    <SelectTrigger id="visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="col-span-full">
                <Field className="gap-2">
                  <FieldLabel htmlFor="workspace-description">
                    Workspace description
                  </FieldLabel>
                  <Textarea
                    id="workspace-description"
                    name="workspace-description"
                    rows={4}
                  />
                  <FieldDescription>
                    Note: description provided will not be displayed externally.
                  </FieldDescription>
                </Field>
              </div>
            </div>
          </div>
          {/* <div className="sm:max-w-3xl md:col-span-2">
            <fieldset>
              <legend className="text-sm font-medium text-foreground dark:text-foreground">
                Newsletter
              </legend>
              <FieldDescription
                id="newsletter-description"
                className="mt-2 leading-6"
              >
                Change how often you want to receive updates from our
                newsletter.
              </FieldDescription>
              <RadioGroup defaultValue="never" className="mt-6">
                <div className="flex items-center gap-x-3">
                  <RadioGroupItem
                    id="every-week"
                    value="every-week"
                    aria-describedby="newsletter-description"
                  />
                  <FieldLabel htmlFor="every-week" className="font-normal">
                    Every week
                  </FieldLabel>
                </div>
                <div className="flex items-center gap-x-3">
                  <RadioGroupItem
                    id="every-month"
                    value="every-month"
                    aria-describedby="newsletter-description"
                  />
                  <FieldLabel htmlFor="every-month" className="font-normal">
                    Every month
                  </FieldLabel>
                </div>
                <div className="flex items-center gap-x-3">
                  <RadioGroupItem
                    id="never"
                    value="never"
                    aria-describedby="newsletter-description"
                  />
                  <FieldLabel htmlFor="never" className="font-normal">
                    Never
                  </FieldLabel>
                </div>
              </RadioGroup>
            </fieldset>
          </div> */}
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
