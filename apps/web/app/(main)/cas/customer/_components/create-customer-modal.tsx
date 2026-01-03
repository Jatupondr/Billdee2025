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
};

interface CreateCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCustomerModal = ({
  open,
  onOpenChange,
}: CreateCustomerModalProps) => {
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  console.log("Session:", session);

  const queryClient = useQueryClient();

  const createCustomerMutation = useMutation({
    mutationFn: async (data: ProductData) => {
      const response = await api.post("/customers", {
        ...data,
        typeCustomer: "customer",
        userId: session?.user?.id,
        organizationId: activeOrg?.id,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("สร้างลูกค้าสำเร็จ", {
        position: "bottom-right",
      });
      onOpenChange(false);
      formCustomers.reset();
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด", {
        description:
          error?.response?.data?.message || "ไม่สามารถสร้างสินค้าได้",
        position: "bottom-right",
      });
    },
  });

  const formCustomers = useForm({
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onSubmit: productSchema,
      onSubmitAsync: async ({ value }) => {
        createCustomerMutation.mutate(value);
      },
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">เพิ่มลูกค้าใหม่</DialogTitle>
          <DialogDescription className="text-base">
            กรอกข้อมูลลูกค้าของคุณที่นี่
          </DialogDescription>
        </DialogHeader>
        <form
          id="form-create-customer"
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
                      <FieldLabel htmlFor={field.name}>ชื่อลูกค้า</FieldLabel>
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
                name="phone"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        เบอร์โทรศัพท์ลูกค้า
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
                      <FieldLabel htmlFor={field.name}>
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
                        placeholder="ที่อยู่ร้านค้า"
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
                        <FieldLabel htmlFor={field.name}>จังหวัด</FieldLabel>
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
                <formCustomers.Field
                  name="district"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>เขต/อำเภอ</FieldLabel>
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
                <formCustomers.Field
                  name="subDistrict"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>ตำบล/แขวง</FieldLabel>
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
                <formCustomers.Field
                  name="postalCode"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
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
              disabled={createCustomerMutation.isPending}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              form="form-create-customer"
              disabled={createCustomerMutation.isPending}
              className="active:scale-95 duration-300 cursor-pointer"
            >
              {createCustomerMutation.isPending
                ? "กำลังสร้าง..."
                : "สร้างลูกค้า"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomerModal;
