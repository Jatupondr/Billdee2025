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
import { authClient } from "@/lib/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const productSchema = v.object({
  name: v.pipe(
    v.string("กรุณากรอกชื่อสินค้า"),
    v.nonEmpty("กรุณากรอกชื่อสินค้า"),
    v.maxLength(255, "ชื่อสินค้ายาวเกินไป")
  ),
  phone: v.optional(v.string()),
  address: v.optional(v.string()),
  province: v.optional(v.string()),
  district: v.optional(v.string()),
  subDistrict: v.optional(v.string()),
  postalCode: v.optional(v.string()),
  taxId: v.optional(v.string()),
});

type ProductData = v.InferOutput<typeof productSchema>;

const defaultValues: ProductData = {
  name: "",
  phone: "",
  address: "",
  province: "",
  district: "",
  subDistrict: "",
  postalCode: "",
  taxId: "",
};

interface CreateSupplierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateSupplierModal = ({
  open,
  onOpenChange,
}: CreateSupplierModalProps) => {
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const queryClient = useQueryClient();

  const createSupplierMutation = useMutation({
    mutationFn: async (data: ProductData) => {
      const response = await api.post("/customers", {
        ...data,
        typeCustomer: "supplier",
        userId: session?.user?.id,
        organizationId: activeOrg?.id,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("สร้างซัพพลายเออร์สำเร็จ", {
        position: "bottom-right",
      });
      onOpenChange(false);
      formSuppliers.reset();
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด", {
        description:
          error?.response?.data?.message || "ไม่สามารถสร้างสินค้าได้",
        position: "bottom-right",
      });
    },
  });

  const formSuppliers = useForm({
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onSubmit: productSchema,
      onSubmitAsync: async ({ value }) => {
        createSupplierMutation.mutate(value);
      },
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal tracking-widest">เพิ่มซัพพลายเออร์ใหม่</DialogTitle>
          <DialogDescription className="text-base font-normal tracking-widest">
            กรอกข้อมูลซัพพลายเออร์ของคุณที่นี่
          </DialogDescription>
        </DialogHeader>
        <form
          id="form-create-supplier"
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
              <formSuppliers.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">
                        เลขประจำตัวผู้เสียภาษี
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
                          placeholder="เลขประจำตัวผู้เสียภาษี"
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
              <formSuppliers.Field
                name="phone"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">
                        เบอร์โทรศัพท์ซัพพลายเออร์
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
                        placeholder="ที่อยู่ร้านค้า"
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
              disabled={createSupplierMutation.isPending}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              form="form-create-supplier"
              disabled={createSupplierMutation.isPending}
              className="active:scale-95 duration-300 cursor-pointer font-normal tracking-widest"
            >
              {createSupplierMutation.isPending
                ? "กำลังสร้าง..."
                : "สร้างซัพพลายเออร์"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSupplierModal;
