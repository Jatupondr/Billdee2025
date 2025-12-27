"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as v from "valibot";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import {
  Field,
  FieldContent,
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
import { EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export const productSchema = v.object({
  name: v.pipe(
    v.string("กรุณากรอกชื่อสินค้า"),
    v.nonEmpty("กรุณากรอกชื่อสินค้า"),
    v.maxLength(255, "ชื่อสินค้ายาวเกินไป")
  ),
  price: v.pipe(
    v.number("กรุณากรอกราคาสินค้า"),
    v.minValue(1, "ราคาต้องมากกว่า 0")
  ),
  cost: v.pipe(
    v.number("กรุณากรอกราคาสินค้า"),
    v.minValue(1, "ราคาต้องมากกว่า 0")
  ),
  description: v.pipe(
    v.string("กรุณากรอกชื่อสินค้า"),
    v.nonEmpty("กรุณากรอกชื่อสินค้า"),
    v.maxLength(255, "ชื่อสินค้ายาวเกินไป")
  ),
  isRecommended: v.optional(v.boolean()),
});

type productData = v.InferOutput<typeof productSchema>;
const defaultValues: productData = {
  name: "",
  price: 0,
  cost: 0,
  description: "",
  isRecommended: false,
};

const Products = () => {
  const formProducts = useForm({
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),

    validators: {
      onDynamic: productSchema,
      onSubmit: productSchema,
      onSubmitAsync: async ({ value }) => {
        toast.success("สร้างสินค้าสำเร็จ", {
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
      <Card className="shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">สินค้า</CardTitle>
          <CardDescription className="text-base">
            เพื่อสินค้าของคุณที่นี่
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="form-products"
            onSubmit={(e) => {
              e.preventDefault();
              formProducts.handleSubmit();
            }}
            className="flex flex-col gap-3"
          >
            <FieldSet data-invalid>
              <FieldGroup className="flex flex-col gap-6 text-left">
                <formProducts.Field
                  name="name"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>ชื่อสินค้า</FieldLabel>
                        <InputGroup className="h-12">
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
                            placeholder="ชื่อสินค้า"
                            autoComplete="email"
                          />
                          <InputGroupAddon>
                            <EnvelopeSimpleIcon
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
                <div className="grid grid-cols-2 gap-4 flex-wrap">
                  <formProducts.Field
                    name="price"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>ราคาขาย</FieldLabel>
                          <InputGroup className="h-12">
                            <InputGroupInput
                              id={field.name}
                              name={field.name}
                              type="number"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(Number(e.target.value))
                              }
                              aria-invalid={
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                              }
                              placeholder="ราคาขาย"
                            />
                          </InputGroup>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  />

                  <formProducts.Field
                    name="cost"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>ต้นทุน</FieldLabel>
                          <InputGroup className="h-12">
                            <InputGroupInput
                              id={field.name}
                              name={field.name}
                              type="number"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(Number(e.target.value))
                              }
                              aria-invalid={
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                              }
                              placeholder="ต้นทุน"
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

                <formProducts.Field
                  name="description"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>รายละเอียด</FieldLabel>
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
                          placeholder="รายละเอียดสินค้า"
                          rows={4}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                <formProducts.Field
                  name="isRecommended"
                  children={(field) => (
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldLabel htmlFor="form-tanstack-switch-twoFactor">
                          สินค้าแนะนำ
                        </FieldLabel>
                        <FieldDescription>
                          ถ้าเปิดใช้งานจะสามารถแสดงสรายการสินค้าในหน้าสร้างบิล
                        </FieldDescription>
                        {/* {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )} */}
                      </FieldContent>
                      <Switch
                        id="form-tanstack-switch-twoFactor"
                        name={field.name}
                        className="h-8 w-14"
                        checked={field.state.value}
                        onCheckedChange={field.handleChange}
                        // aria-invalid={isInvalid}
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldSet>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            form="form-products"
            className="active:scale-95 duration-300 cursor-pointer flex justify-center gap-2 py-3 px-2 h-11 w-full"
          >
            {/* <SignInIcon
              size={32}
              weight="fill"
              className="size-5 dark:text-gray-100"
            /> */}
            <p className="text-base tracking-widest">สร้างสินค้า</p>
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default Products;
