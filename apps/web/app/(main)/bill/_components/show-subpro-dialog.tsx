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
            สนใจเเพ็คเกจ PRO
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-normal ">
            สนใจเป็นสมาชิก PRO เพื่อใช้งานระบบบิลที่ดีกว่า เเพ็กฟรีจะสร้างบิลได้ไม่เกิน 10 บิลต่อเดือน
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

            className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer disabled:cursor-not-allowed font-normal tracking-widest"
          >
            สมัครเป็นสมาชิก PRO
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ShowSubproDialog;
