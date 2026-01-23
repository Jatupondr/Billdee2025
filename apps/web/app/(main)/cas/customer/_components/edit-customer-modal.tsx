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

export const customerSchema = v.object({
  name: v.pipe(
    v.string("กรุณากรอกชื่อลูกค้า"),
    v.nonEmpty("กรุณากรอกชื่อลูกค้า"),
    v.maxLength(255, "ชื่อลูกค้ายาวเกินไป")
  ),
  phone: v.optional(v.string()),
  address: v.optional(v.string()),
  province: v.optional(v.string()),
  district: v.optional(v.string()),
  subDistrict: v.optional(v.string()),
  postalCode: v.optional(v.string()),
});

type CustomerData = v.InferOutput<typeof customerSchema>;

interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  province?: string;
  district?: string;
  subDistrict?: string;
  postalCode?: string;
}

interface EditCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: any | null;
}

const EditCustomerModal = ({
  open,
  onOpenChange,
  customer,
}: EditCustomerModalProps) => {
  const queryClient = useQueryClient();

  const updateCustomerMutation = useMutation({
    mutationFn: async (data: CustomerData & { id: string }) => {
      const response = await api.patch(`/customers/${data.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("แก้ไขลูกค้าสำเร็จ", {
        position: "bottom-right",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด", {
        description:
          error?.response?.data?.message || "ไม่สามารถแก้ไขลูกค้าได้",
        position: "bottom-right",
      });
    },
  });

  const formCustomers = useForm({
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
        if (customer) {
          updateCustomerMutation.mutate({ ...value, id: customer._id });
        }
      },
    },
  });

  useEffect(() => {
    if (customer && open) {
      formCustomers.setFieldValue("name", customer.name);
      formCustomers.setFieldValue("phone", customer.phone || "");
      formCustomers.setFieldValue("address", customer.address || "");
      formCustomers.setFieldValue("province", customer.province || "");
      formCustomers.setFieldValue("district", customer.district || "");
      formCustomers.setFieldValue("subDistrict", customer.subDistrict || "");
      formCustomers.setFieldValue("postalCode", customer.postalCode || "");
    }
  }, [customer, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal tracking-widest">แก้ไขลูกค้า</DialogTitle>
          <DialogDescription className="text-base font-normal tracking-widest">
            แก้ไขข้อมูลลูกค้าของคุณที่นี่
          </DialogDescription>
        </DialogHeader>
        <form
          id="form-edit-customer"
          onSubmit={(e) => {
            e.preventDefault();
            formCustomers.handleSubmit();
          }}
          className="flex flex-col gap-3"
        >
          <FieldSet>
            <FieldGroup className="flex flex-col gap-6 text-left">
              <formCustomers.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">ชื่อลูกค้า</FieldLabel>
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
                          placeholder="ชื่อลูกค้า"
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
              <formCustomers.Field
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

              <formCustomers.Field
                name="address"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">
                        ที่อยู่ลูกค้า
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
                        placeholder="ที่อยู่ลูกค้า"
                        className="font-normal tracking-widest"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
              <div className="grid grid-cols-2 gap-6 w-full">
                <formCustomers.Field
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
                <formCustomers.Field
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
              <div className="grid grid-cols-2 gap-6 w-full">
                <formCustomers.Field
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
                <formCustomers.Field
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
            </FieldGroup>
          </FieldSet>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              className="font-normal tracking-widest"
              onClick={() => onOpenChange(false)}
              disabled={updateCustomerMutation.isPending}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              form="form-edit-customer"
              disabled={updateCustomerMutation.isPending}
              className="active:scale-95 duration-300 cursor-pointer font-normal tracking-widest"
            >
              {updateCustomerMutation.isPending
                ? "กำลังบันทึก..."
                : "บันทึกการแก้ไข"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerModal;
