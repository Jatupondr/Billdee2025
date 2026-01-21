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
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,

} from "@/components/ui/field";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/hooks/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "@phosphor-icons/react";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { useDebounce } from "@/hooks/use-debounce";

export const productSchema = v.object({
  plan: v.pipe(
    v.string("กรุณากรอกชื่อเเพ็คเกจ"),
    v.nonEmpty("กรุณากรอกชื่อเเพ็คเกจ"),
    v.maxLength(255, "ชื่อเเพ็คเกจยาวเกินไป")
  ),
  userId: v.optional(v.string()),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
});

type ProductData = v.InferOutput<typeof productSchema>;

const defaultValues: ProductData = {
  plan: "",
  userId: "",
  startDate: "",
  endDate: "",

};

interface CreatePackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreatePackModal = ({
  open,
  onOpenChange,
}: CreatePackModalProps) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 20),
  });

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const queryClient = useQueryClient();

  const createPackMutation = useMutation({
    mutationFn: async (data: ProductData) => {
      const response = await api.post("/subscriptions", {
        ...data,
        plan: data.plan.toLowerCase(),
        userId: data.userId,
        startDate: date?.from ? new Date(date.from).toISOString() : new Date().toISOString(),
        endDate: date?.to ? new Date(date.to).toISOString() : new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),

      });
      return response.data;
    },
    onSuccess: () => {

      toast.success("สร้างเเพ็คเกจสำเร็จ", {
        position: "bottom-right",
      });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      formPacks.reset();
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด", {
        description:
          error?.response?.data?.message || "ไม่สามารถสร้างสินค้าได้",
        position: "bottom-right",
      });
    },
  });

  const formPacks = useForm({
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onSubmit: productSchema,
      onSubmitAsync: async ({ value }) => {
        // alert(JSON.stringify({ ...value, startDate: date?.from ? new Date(date.from).toISOString() : new Date().toISOString(), endDate: date?.to ? new Date(date.to).toISOString() : new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() }));
        createPackMutation.mutate(value);
      },
    },
  });
  const getUsers = async (search: string) => {
    const response = await api.get(`/subscriptions/listuser?page=1&pageSize=499&search=${search}`);
    return response.data;
  };

  const { data: usersData } = useQuery({
    queryKey: ["users", debouncedSearch],
    queryFn: () => getUsers(debouncedSearch),
  });


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal tracking-widest">เพิ่มเเพ็คเกจใหม่</DialogTitle>
          <DialogDescription className="text-base font-normal tracking-widest">
            กรอกข้อมูลเเพ็คเกจของคุณที่นี่
          </DialogDescription>
        </DialogHeader>
        <form
          id="form-create-pack"
          onSubmit={(e) => {
            e.preventDefault();
            formPacks.handleSubmit();
          }}
          className="flex flex-col gap-3"
        >
          <FieldSet>
            <FieldGroup className="flex flex-col gap-6 text-left">
              <formPacks.Field
                name="plan"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">ชื่อเเพ็คเกจ</FieldLabel>
                      <Select name="plan" value={field.state.value || ""} onValueChange={(value: any) => field.handleChange(value)}>
                        <SelectTrigger className="font-normal tracking-widest">
                          <SelectValue placeholder="ชื่อเเพ็คเกจ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRO">PRO</SelectItem>

                        </SelectContent>
                      </Select>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <formPacks.Field
                name="userId"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">ชื่อผู้ใช้</FieldLabel>

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldGroup className="flex flex-col gap-6 text-left">
              <formPacks.Field
                name="startDate"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="font-normal tracking-widest">รอบบิล</FieldLabel>
                      <Popover>
                        <PopoverTrigger render={<Button variant="outline" id="date-picker-range" className="justify-start px-2.5 font-normal"><CalendarIcon data-icon="inline-start" />{date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "LLL dd, y")} -{" "}
                              {format(date.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(date.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}</Button>} />
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <formPacks.Field
                name="userId"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel
                        htmlFor={field.name}
                        className="font-normal tracking-widest"
                      >
                        ลูกค้า
                      </FieldLabel>

                      <Combobox
                        items={usersData?.rows || []}
                        onValueChange={(value: any) => {
                          const selectedUser = usersData?.rows?.find((user: any) => user.name === value);
                          if (selectedUser) {
                            field.handleChange(selectedUser._id);
                            formPacks.setFieldValue("userId", selectedUser._id);
                          }
                        }}
                      >
                        <ComboboxInput
                          id={field.name}
                          name={field.name}
                          value={
                            usersData?.rows?.find((user: any) => user._id === field.state.value)?.name ?? ""
                          }
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            setSearch(e.target.value);
                          }}
                          aria-invalid={
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          }
                          placeholder="เลือกผู้ใช้งาน"
                          className="font-normal tracking-widest"
                        />
                        <ComboboxContent>
                          <ComboboxEmpty>ไม่พบผู้ใช้งาน</ComboboxEmpty>
                          <ComboboxList>
                            {(item) => (
                              <ComboboxItem key={item._id} value={item.name}>
                                {item.name}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />


            </FieldGroup>
          </FieldSet>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              className="font-normal tracking-widest"
              onClick={() => onOpenChange(false)}
              disabled={createPackMutation.isPending}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              form="form-create-pack"
              disabled={createPackMutation.isPending}
              className="active:scale-95 duration-300 cursor-pointer font-normal tracking-widest"
            >
              {createPackMutation.isPending
                ? "กำลังสร้าง..."
                : "สร้างเเพ็คเกจ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePackModal;
