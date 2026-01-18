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

export const supplierSchema = v.object({
  name: v.pipe(
    v.string("กรุณากรอกชื่อซัพพลายเออร์"),
    v.nonEmpty("กรุณากรอกชื่อซัพพลายเออร์"),
    v.maxLength(255, "ชื่อซัพพลายเออร์ยาวเกินไป")
  ),
  phone: v.optional(v.string()),
  address: v.optional(v.string()),
  province: v.optional(v.string()),
  district: v.optional(v.string()),
  subDistrict: v.optional(v.string()),
  postalCode: v.optional(v.string()),
});

type SupplierData = v.InferOutput<typeof supplierSchema>;

interface Supplier {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  province?: string;
  district?: string;
  subDistrict?: string;
  postalCode?: string;
}

interface EditSupplierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: any | null;
}

const EditSupplierModal = ({
  open,
  onOpenChange,
  supplier,
}: EditSupplierModalProps) => {
  const queryClient = useQueryClient();

  const updateSupplierMutation = useMutation({
    mutationFn: async (data: SupplierData & { id: string }) => {
      const response = await api.patch(`/customers/${data.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("แก้ไขซัพพลายเออร์สำเร็จ", {
        position: "bottom-right",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด", {
        description:
          error?.response?.data?.message || "ไม่สามารถแก้ไขซัพพลายเออร์ได้",
        position: "bottom-right",
      });
    },
  });

  const formSuppliers = useForm({
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      province: "",
      district: "",
      subDistrict: "",
      postalCode: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onSubmitAsync: async ({ value }) => {
        if (supplier) {
          updateSupplierMutation.mutate({ ...value, id: supplier.id });
        }
      },
    },
  });

  useEffect(() => {
    if (supplier && open) {
      formSuppliers.setFieldValue("name", supplier.name);
      formSuppliers.setFieldValue("phone", supplier.phone || "");
      formSuppliers.setFieldValue("address", supplier.address || "");
      formSuppliers.setFieldValue("province", supplier.province || "");
      formSuppliers.setFieldValue("district", supplier.district || "");
      formSuppliers.setFieldValue("subDistrict", supplier.subDistrict || "");
      formSuppliers.setFieldValue("postalCode", supplier.postalCode || "");
    }
  }, [supplier, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal tracking-widest">แก้ไขซัพพลายเออร์</DialogTitle>
          <DialogDescription className="text-base font-normal tracking-widest">
            แก้ไขข้อมูลซัพพลายเออร์ของคุณที่นี่
          </DialogDescription>
        </DialogHeader>
        <form
          id="form-edit-supplier"
          onSubmit={(e) => {
            e.preventDefault();
            formSuppliers.handleSubmit();
          }}
          className="flex flex-col gap-3"
        >
          <FieldSet>
            <FieldGroup className="flex flex-col gap-6 text-left">
              <formSuppliers.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">
                        ชื่อซัพพลายเออร์
                      </FieldLabel>
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
                          placeholder="ชื่อซัพพลายเออร์"
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
              <formSuppliers.Field
                name="phone"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">
                        เบอร์โทรศัพท์
                      </FieldLabel>
                      <InputGroup className="h-12">
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          type="text"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          }
                          placeholder="เบอร์โทรศัพท์"
                        />
                      </InputGroup>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <formSuppliers.Field
                name="address"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">
                        ที่อยู่ซัพพลายเออร์
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
                        placeholder="ที่อยู่ซัพพลายเออร์"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
              <div className="grid grid-cols-2 gap-6 w-full">
                <formSuppliers.Field
                  name="province"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">จังหวัด</FieldLabel>
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
                            placeholder="จังหวัด"
                          />
                        </InputGroup>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
                <formSuppliers.Field
                  name="district"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">เขต/อำเภอ</FieldLabel>
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
                            placeholder="เขต/อำเภอ"
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
              <div className="grid grid-cols-2 gap-6 w-full">
                <formSuppliers.Field
                  name="subDistrict"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">ตำบล/แขวง</FieldLabel>
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
                            placeholder="ตำบล/แขวง"
                          />
                        </InputGroup>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
                <formSuppliers.Field
                  name="postalCode"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">
                          รหัสไปรษณีย์
                        </FieldLabel>
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
                            placeholder="รหัสไปรษณีย์"
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
            </FieldGroup>
          </FieldSet>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateSupplierMutation.isPending}
              className="font-normal tracking-widest"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              form="form-edit-supplier"
              disabled={updateSupplierMutation.isPending}

              className="active:scale-95 duration-300 cursor-pointer font-normal tracking-widest"
            >
              {updateSupplierMutation.isPending
                ? "กำลังบันทึก..."
                : "บันทึกการแก้ไข"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSupplierModal;
