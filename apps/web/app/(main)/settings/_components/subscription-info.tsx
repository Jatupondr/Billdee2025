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
import { DataTable } from "@/components/data-table";
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
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const formSchema = v.object({
  newPassword: v.pipe(
    v.string(""),
    v.maxLength(255, "Name must be at most 255 characters.")
  ),
  confirmPassword: v.pipe(
    v.string(""),
    v.maxLength(255, "Name must be at most 255 characters.")
  ),
});

type orgData = v.InferOutput<typeof formSchema>;
const defaultValues: orgData = {
  newPassword: "",
  confirmPassword: "",
};

interface BillingHistory {
  id: string;
  billingDate: string;
  billingPeriod: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  paymentMethod: string;
}

// Sample billing data
const billingData: BillingHistory[] = [
  {
    id: "1",
    billingDate: "2024-12-22",
    billingPeriod: "22 พ.ย. 2568 - 22 ธ.ค. 2568",
    amount: 990,
    status: "paid",
    paymentMethod: "บัตรเครดิต (**** 1234)",
  },
  {
    id: "2",
    billingDate: "2024-11-22",
    billingPeriod: "22 ต.ค. 2568 - 22 พ.ย. 2568",
    amount: 990,
    status: "paid",
    paymentMethod: "บัตรเครดิต (**** 1234)",
  },
  {
    id: "3",
    billingDate: "2024-10-22",
    billingPeriod: "22 ก.ย. 2568 - 22 ต.ค. 2568",
    amount: 990,
    status: "paid",
    paymentMethod: "บัตรเครดิต (**** 1234)",
  },
];

const columns: ColumnDef<BillingHistory>[] = [
  {
    header: "วันที่ชำระเงิน",
    accessorKey: "billingDate",
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {format(new Date(row.original.billingDate), "dd/MM/yyyy")}
      </span>
    ),
  },
  {
    header: "รอบบิล",
    accessorKey: "billingPeriod",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.billingPeriod}</span>
    ),
  },
  {
    header: "จำนวนเงิน",
    accessorKey: "amount",
    cell: ({ row }) => (
      <span className="text-sm font-semibold">
        ฿{row.original.amount.toLocaleString()}
      </span>
    ),
  },
  {
    header: "สถานะ",
    accessorKey: "status",
    cell: ({ row }) => {
      const statusMap = {
        paid: { label: "ชำระแล้ว", variant: "default" as const },
        pending: { label: "รอชำระ", variant: "secondary" as const },
        failed: { label: "ล้มเหลว", variant: "destructive" as const },
      };
      const status = statusMap[row.original.status];
      return <Badge variant={status.variant}>{status.label}</Badge>;
    },
  },
  {
    header: "วิธีการชำระ",
    accessorKey: "paymentMethod",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.paymentMethod}
      </span>
    ),
  },
];

export default function SubscriptionInfo() {
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
      },
    },
  });
  // useEffect(() => {
  //   if (session) {
  //     form.setFieldValue("name", session.user.name);
  //   }
  // }, [session]);

  const router = useRouter();
  return (
    <div className="flex py-8 px-6 w-full bg-white mt-4 dark:bg-zinc-900 flex-col rounded-2xl shadow-xl border border-border/50 ">
      <form
        id="form-password"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-semibold text-foreground dark:text-foreground text-xl">
              ข้อมูลเเพ็คเกจ
            </h2>
            <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-muted-foreground">
              รายละเอียดเกี่ยวกับข้อมูลเเพ็คเกจผู้ใช้
            </p>
          </div>
          <div className="sm:max-w-3xl md:col-span-2">
            <div className="grid grid-cols-1 gap-6">
              {/* Plan Card */}
              <div className="relative overflow-hidden rounded-xl border border-border bg-linear-to-br from-primary/5 via-background to-background p-6 shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                        แพ็กเก็จปัจจุบัน
                      </p>
                      <h3 className="text-3xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent mt-1">
                        PRO
                      </h3>
                    </div>
                    <div className="px-4 py-2 bg-primary/10 text-primary rounded-full">
                      <p className="text-sm font-semibold">Active</p>
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        ใช้งานได้อีก
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        23{" "}
                        <span className="text-base font-normal text-muted-foreground">
                          วัน
                        </span>
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        รอบบิลถัดไป
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        22 ธ.ค. 2568
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-3">
                      ระยะเวลาบิล: 22 พ.ย. 2568 - 22 ธ.ค. 2568
                    </p>
                    <Button
                      type="button"
                      size="lg"
                      className="w-full bg-destructive hover:bg-red-700 whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out shadow-md"
                      // onClick={() => router.push("/billing")}
                    >
                      ยกเลิกสมัครสมาชิก
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-semibold text-foreground dark:text-foreground text-xl">
              ประวัติการชำระเงิน
            </h2>
            <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-muted-foreground">
              รายละเอียดการชำระเงินและรอบบิลทั้งหมด
            </p>
          </div>
          <div className="sm:max-w-7xl md:col-span-2">
            <div className="grid grid-cols-1 gap-6">
              <div className="relative overflow-hidden rounded-xl border border-border bg-background p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        การชำระเงินล่าสุด
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        แสดงประวัติการชำระเงิน 3 ครั้งล่าสุด
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      ดูทั้งหมด
                    </Button>
                  </div>
                  <DataTable columns={columns} data={billingData} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-semibold text-foreground dark:text-foreground text-xl">
              วิธีการชำระเงิน
            </h2>
            <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-muted-foreground">
              รายละเอียดขั้นตอนการขำระเงินของคุณ
            </p>
          </div>
          <div className="sm:max-w-7xl md:col-span-2">
            <div className="grid grid-cols-1 gap-1">
              <p className="text-base leading-6">
                1. เข้าสู่ระบบบัญชีของคุณและไปที่หน้าการตั้งค่าการชำระเงิน.
              </p>
              <p className="text-base leading-6">
                2. กดสมัครใช้งานจากนั้นระบบจะพาไปหน้าชำระเงิน.
                (สำหรับบัตรเครดิต)
              </p>
              <p className="text-lg tracking-wide font-semibold leading-6">
                สำหรับวิธีการชำระเงินผ่านการโอนเงินผ่านธนาคาร{" "}
                <span className="text-red-500">พร้อมเพย์ </span>
                ให้ทำตามขั้นตอนดังนี้:
              </p>
              <p className="text-base tracking-wide ">
                1. เลือกวิธีการชำระเงินที่คุณต้องการใช้
              </p>
              <p className="text-base tracking-wide ">
                2. แจ้งหลักฐานการชำระเงินผ่านทางผู้ให้บริการของเรา{" "}
                <a
                  href="https://www.facebook.com/jatuponseafoods#"
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  Click here
                </a>
              </p>
              <p className="text-base tracking-wide ">
                สำหรับเเพ็คเกจ PRO ราคาจะอยู่ที่ 299 บาทต่อเดือน
                (ราคาเดียวเท่านั้น)
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />
        <div className="flex items-center justify-start space-x-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out"
            onClick={() => router.back()}
          >
            ย้อนกลับ
          </Button>
          {/* <Button
            type="submit"
            size="lg"
            form="form-password"
            className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out"
          >
            บันทึกข้อมูล
          </Button> */}
        </div>
      </form>
    </div>
  );
}
