"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useRouter } from "next/navigation";

interface ShowSubproDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

}

const ShowSubproDialog = ({
  open,
  onOpenChange,

}: ShowSubproDialogProps) => {
  const router = useRouter();









  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md dark:bg-zinc-900">
        <AlertDialogHeader className="space-y-1">
          <AlertDialogTitle className="font-normal tracking-widest">
            ครบ 10 บิลของเดือนนี้แล้ว
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-normal ">
            แพ็กเกจฟรีออกบิลได้ 10 บิลต่อเดือน — เดือนนี้ใช้ครบแล้ว อัปเกรดเป็น Pro (200 บาท/เดือน หรือ 2,000 บาท/ปี) เพื่อออกบิลไม่จำกัด หรือรอเริ่มเดือนใหม่
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel

            className="cursor-pointer font-normal tracking-widest"
          >
            ยกเลิก
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => router.push("/settings?tab=subscription-info")}

            className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer disabled:cursor-not-allowed font-normal tracking-widest"
          >
            ดูแพ็กเกจ Pro
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ShowSubproDialog;
