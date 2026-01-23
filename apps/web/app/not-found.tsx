"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, HouseIcon, WarningIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center  px-6 text-center dark:bg-zinc-900">
      {/* 404 */}
      {/* icon */}

      <WarningIcon size={74} weight="bold" className="text-destructive dark:text-destructive  mb-4" />

      <h1 className="text-8xl font-extrabold text-zinc-900 tracking-widest dark:text-zinc-100 ">
        404
      </h1>

      {/* Title */}
      <h2 className="mt-4 text-2xl font-semibold text-zinc-800 dark:text-zinc-200 ">
        ไม่พบหน้าที่ค้นหา
      </h2>

      {/* Description */}
      <p className="mt-2 max-w-md text-zinc-600 dark:text-zinc-400 font-normal tracking-widest">
        ขออภัย หน้าที่ค้นหาไม่พบหรือถูกย้าย
      </p>

      {/* Actions */}
      <div className="mt-6 flex gap-4">
        <Button

          className="tracking-widest font-normal dark:text-zinc-200 cursor-pointer active:scale-95 transition-all duration-300 "
          size="lg"
          onClick={() => router.push("/")}
        >
          <HouseIcon weight="bold" size={24} />
          กลับหน้าหลัก
        </Button>

        <Button

          variant="outline"
          size="lg"
          onClick={() => router.back()}
          className="tracking-widest font-normal dark:text-zinc-200 cursor-pointer active:scale-95 transition-all duration-300 "

        >
          <ArrowLeftIcon weight="bold" size={24} />   ย้อนกลับ
        </Button>
      </div>

      {/* Footer hint */}
      <p className="mt-10 text-xs text-zinc-400 dark:text-zinc-400 font-normal tracking-widest">
        ถ้าคุณคิดว่าเป็นข้อผิดพลาด กรุณาติดต่อสอบถาม
      </p>
    </div>
  );
}
