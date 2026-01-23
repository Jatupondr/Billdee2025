"use client";
import { Button } from "@/components/ui/button";


import { Separator } from "@/components/ui/separator";
import api from "@/hooks/axios";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CancelSubscriptionDialog from "./cancel-sub-dialog";


export default function SubscriptionInfo() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [openCancelSubscriptionDialog, setOpenCancelSubscriptionDialog] = useState(false);


  const getSubscriptionById = async (subscriptionId: string) => {
    const response = await api.get(`/subscriptions/${subscriptionId}`);
    return response.data;
  };

  const { data: subscriptionData, isLoading } = useQuery<any>({
    queryKey: ["subscription"],
    queryFn: () => getSubscriptionById(session?.user?.id || ""),
    enabled: !!session?.user?.id,
  });



  const dateTotal = new Date(subscriptionData?.data?.endDate).getTime() - new Date().getTime();
  const dateTotalDays = Math.ceil(dateTotal / (1000 * 60 * 60 * 24));
  const isExpired = dateTotalDays <= 0;






  const router = useRouter();
  return (
    <div className="flex py-8 px-6 w-full bg-white mt-4 dark:bg-zinc-900 flex-col rounded-2xl shadow-xl border border-border/50 ">

      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        <div>
          <h2 className="font-normal tracking-widest text-zinc-900 dark:text-zinc-200 text-xl">
            ข้อมูลเเพ็คเกจ
          </h2>
          <p className="mt-1 text-base leading-6 text-zinc-900 dark:text-zinc-200 font-normal tracking-widest">
            รายละเอียดเกี่ยวกับข้อมูลเเพ็คเกจผู้ใช้
          </p>
        </div>
        <div className="sm:max-w-3xl md:col-span-2">
          <div className="grid grid-cols-1 gap-6">
            {/* Plan Card */}
            {subscriptionData?.data.plan === "pro" && subscriptionData?.data?.status === "paid" ? (
              <>
                <div className="flex flex-col items-start gap-2">
                  <p className="text-2xl font-normal tracking-widest text-zinc-900 dark:text-zinc-200"> เเพ็คเกจ: PRO</p>
                  <p
                    className={`text-lg font-normal tracking-widest ${isExpired
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                      }`}
                  >
                    เหลืออีก: {isExpired ? "หมดอายุ กรุณาชำระเงิน" : `${dateTotalDays} วัน`}
                  </p>
                  <p className="text-base font-normal tracking-widest text-zinc-900 dark:text-zinc-200"> รอรับบิลที่: {new Date(subscriptionData?.data?.startDate).toLocaleDateString("th-TH", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                    {" - "} {new Date(subscriptionData?.data?.endDate).toLocaleDateString("th-TH", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}

                  </p>
                  {/* บวกไป 1 วัน */}
                  <p className="text-base font-normal tracking-widest text-zinc-900 dark:text-zinc-200"> รอบบิลต่อไป: {new Date(new Date(subscriptionData?.data?.expDate).getTime() + 1000 * 60 * 60 * 24).toLocaleDateString("th-TH", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                  </p>

                  <Button onClick={() => setOpenCancelSubscriptionDialog(true)} variant="destructive" size="sm" className="cursor-pointer tracking-widest font-normal">ยกเลิกการสมัคร</Button>

                </div>
              </>
            )
              : (
                <>
                  <p className="text-2xl font-normal tracking-widest text-muted-foreground dark:text-zinc-200"> เเพ็คเกจ: ฟรี</p>
                </>
              )
            }
          </div>

        </div>
      </div >
      <Separator className="my-4" />
      {/* <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-normal tracking-widest text-foreground dark:text-foreground text-xl">
              ประวัติการชำระเงิน
            </h2>
            <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-muted-foreground font-normal tracking-widest">
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
        </div> */}

      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        <div>
          <h2 className="font-normal tracking-widest text-foreground dark:text-foreground text-xl">
            วิธีการชำระเงิน
          </h2>
          <p className="mt-1 text-base leading-6 text-muted-foreground dark:text-muted-foreground font-normal tracking-widest   ">
            รายละเอียดขั้นตอนการขำระเงินของคุณ
          </p>
        </div>
        <div className="sm:max-w-7xl md:col-span-2">
          <div className="grid grid-cols-1 gap-1">

            <p className="text-lg t font-normal tracking-wide leading-6">
              สำหรับวิธีการชำระเงินผ่านการโอนเงินผ่านธนาคาร{" "}
              <span className="text-red-500">พร้อมเพย์ </span>
              ให้ทำตามขั้นตอนดังนี้:
            </p>
            <p className="text-base tracking-wide  font-normal ">
              1. เลือกวิธีการชำระเงินที่คุณต้องการใช้
            </p>
            <p className="text-base tracking-wide  font-normal ">
              2. แจ้งหลักฐานการชำระเงินผ่านทางผู้ให้บริการของเรา{" "}
              <a
                href="https://www.facebook.com/jatuponseafoods#"
                target="_blank"
                className="text-blue-600 underline font-normal tracking-wide"
              >
                Click here
              </a>
            </p>
            <p className="text-base tracking-wide font-normal">
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
          className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-wide  "
          onClick={() => router.back()}
        >
          ย้อนกลับ
        </Button>

      </div>
      <CancelSubscriptionDialog open={openCancelSubscriptionDialog} onOpenChange={setOpenCancelSubscriptionDialog} subscriptionId={subscriptionData?.data?._id} />

    </div >
  );
}
