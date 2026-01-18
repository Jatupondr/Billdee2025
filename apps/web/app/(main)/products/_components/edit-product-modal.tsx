"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as v from "valibot";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldContent,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { PackageIcon } from "@phosphor-icons/react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/hooks/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

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
    v.number("กรุณากรอกราคาต้นทุน"),
    v.minValue(0, "ราคาต้องไม่น้อยกว่า 0")
  ),
  description: v.optional(v.string("")),
  isRecommended: v.optional(v.boolean()),
  updatedBy: v.string("กรุณากรอกชื่อผู้แก้ไข"),
});

type ProductData = v.InferOutput<typeof productSchema>;

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  description: string;
  recommended: boolean;
}

interface EditProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any | null;
}

const EditProductModal = ({
  open,
  onOpenChange,
  product,
}: EditProductModalProps) => {
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductData & { id: string }) => {
      const response = await api.patch(`/products/${data.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("แก้ไขสินค้าสำเร็จ", {
        position: "bottom-right",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด", {
        description:
          error?.response?.data?.message || "ไม่สามารถแก้ไขสินค้าได้",
        position: "bottom-right",
      });
    },
  });

  const formProducts = useForm({
    defaultValues: {
      name: "",
      price: 0,
      cost: 0,
      description: "",
      isRecommended: false,
    },
    validationLogic: revalidateLogic(),
    validators: {
      onSubmitAsync: async ({ value }) => {
        if (product) {
          updateProductMutation.mutate({
            ...value,
            id: product._id,
            isRecommended: value.isRecommended || false,
            updatedBy: session?.user?.id || "",
          });
        }
      },
    },
  });

  useEffect(() => {
    if (product && open) {
      formProducts.setFieldValue("name", product.name);
      formProducts.setFieldValue("price", Number(product.price));
      formProducts.setFieldValue("cost", Number(product.cost));
      formProducts.setFieldValue("description", product.description || "");
      formProducts.setFieldValue(
        "isRecommended",
        product.isRecommended || false
      );
    }
  }, [product, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal tracking-widest">แก้ไขสินค้า</DialogTitle>
          <DialogDescription className="text-base font-normal tracking-widest">
            แก้ไขข้อมูลสินค้าของคุณที่นี่
          </DialogDescription>
        </DialogHeader>
        <form
          id="form-edit-product"
          onSubmit={(e) => {
            e.preventDefault();
            formProducts.handleSubmit();
          }}
          className="flex flex-col gap-3"
        >
          <FieldSet>
            <FieldGroup className="flex flex-col gap-6 text-left">
              <formProducts.Field
                name="name"
                validators={{
                  onChange: v.pipe(
                    v.string("กรุณากรอกชื่อสินค้า"),
                    v.nonEmpty("กรุณากรอกชื่อสินค้า"),
                    v.maxLength(255, "ชื่อสินค้ายาวเกินไป")
                  ),
                }}
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">ชื่อสินค้า</FieldLabel>
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
                          className="font-normal tracking-widest"
                        />
                        <InputGroupAddon>
                          <PackageIcon size={32} className="size-5" />
                        </InputGroupAddon>
                      </InputGroup>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
              <div className="grid grid-cols-2 gap-4">
                <formProducts.Field
                  name="price"
                  validators={{
                    onChange: v.pipe(
                      v.number("กรุณากรอกราคาสินค้า"),
                      v.minValue(1, "ราคาต้องมากกว่า 0")
                    ),
                  }}
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">ราคาขาย</FieldLabel>
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
                            className="font-normal tracking-widest"
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
                  validators={{
                    onChange: v.pipe(
                      v.number("กรุณากรอกราคาต้นทุน"),
                      v.minValue(0, "ราคาต้องไม่น้อยกว่า 0")
                    ),
                  }}
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">ต้นทุน</FieldLabel>
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
                            className="font-normal tracking-widest"
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
                      <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">รายละเอียด</FieldLabel>
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
                        className="font-normal tracking-widest"
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
                      <FieldLabel htmlFor="isRecommended-edit" className="font-normal tracking-widest">
                        สินค้าแนะนำ
                      </FieldLabel>
                      <FieldDescription className="font-normal tracking-widest" >
                        ถ้าเปิดใช้งานจะสามารถแสดงรายการสินค้าในหน้าสร้างบิล
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id="isRecommended-edit"
                      name={field.name}
                      className="h-8 w-14"
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              className="font-normal tracking-widest"
              onClick={() => onOpenChange(false)}
              disabled={updateProductMutation.isPending}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              form="form-edit-product"
              disabled={updateProductMutation.isPending}
              className="active:scale-95 duration-300 cursor-pointer font-normal tracking-widest"
            >
              {updateProductMutation.isPending
                ? "กำลังบันทึก..."
                : "บันทึกการแก้ไข"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;
