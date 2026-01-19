"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

interface AffiliateLinkCardProps {
  affiliateData: any;
}

const AffiliateLinkCard = ({ affiliateData }: AffiliateLinkCardProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(affiliateData?.data?.referalLink || "");
    toast.success("คัดลอกลิงค์อ้างอิงเรียบร้อย");
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };
  return (
    <Card className="dark:bg-zinc-900">
      <CardHeader>
        <CardTitle className="text-2xl font-normal tracking-widest dark:text-zinc-300 ">
          เชิญเพื่อนและรับค่าคอมมิชชัน
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Input
            id="referalLink"
            placeholder="ระบุชื่อผู้ที่จะเชิญ"
            value={affiliateData?.data?.referalLink || ""}
            disabled
            className="text-base font-normal tracking-widest dark:bg-accent dark:text-zinc-100 w-full"
          />

          <Button
            variant="outline"
            size="icon-lg"
            className="text-base font-normal tracking-widest dark:text-zinc-300 cursor-pointer active:scale-95 transition-all duration-100"
            onClick={handleCopy}
          >
            {isCopied ? (
              <CheckIcon
                size={20}
                weight="bold"
                className="text-zinc-800 dark::text-zinc-200   transition-all duration-300 ease-in-out"
              />
            ) : (
              <CopyIcon
                size={20}
                weight="bold"
                className="text-zinc-800 dark:text-zinc-200   transition-all duration-300 ease-in-out"
              />
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 items-start">
        <p className="text-sm font-normal tracking-widest dark:text-zinc-300">
          - affiliate ต้องสมัครสมาชิกก่อนใช้งาน
        </p>
        <p className="text-sm font-normal tracking-widest dark:text-zinc-300">
          - ต้องสมัครผ่านอีเมล ถ้าเข้าสู่ระบบผ่าน Google จะไม่นับเป็น affiliate ของคุณ
        </p>
      </CardFooter>
    </Card>
  );
};

export default AffiliateLinkCard;
