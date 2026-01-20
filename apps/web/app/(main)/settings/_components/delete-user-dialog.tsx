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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any | null;
}

const DeleteUserDialog = ({
  open,
  onOpenChange,
  user,
}: DeleteUserDialogProps) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!user || !password) {
      toast.error("กรุณากรอกรหัสผ่าน", {
        position: "bottom-right",
      });
      return;
    }

    setIsLoading(true);
    await authClient.deleteUser(
      {
        password: password, // ต้องใช้ password เพื่อยืนยันการลบ
        callbackURL: "/goodbye",
      },
      {
        onSuccess: () => {
          toast.success("ลบบัญชีผู้ใช้สำเร็จ", {
            position: "bottom-right",
          });
          setPassword("");
          onOpenChange(false);
        },
        onError: (ctx) => {
          toast.error("เกิดข้อผิดพลาด", {
            description:
              ctx.error?.message ||
              "ไม่สามารถลบบัญชีผู้ใช้ได้ กรุณาตรวจสอบรหัสผ่าน",
            position: "bottom-right",
          });
        },
      },
    );
    setIsLoading(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setPassword("");
    }
    onOpenChange(isOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="font-normal tracking-widest">
            ยืนยันการลบบัญชีผู้ใช้
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-normal">
            Are you sure you want to delete the user? All of the data will be
            permanently removed. This action cannot be undone
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="password" className="text-sm font-normal">
            กรอกรหัสผ่านเพื่อยืนยัน
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="cursor-pointer font-normal tracking-widest"
            disabled={isLoading}
          >
            ยกเลิก
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!password || isLoading}
            className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer disabled:cursor-not-allowed font-normal tracking-widest"
          >
            {isLoading ? "กำลังลบ..." : "ลบบัญชีผู้ใช้"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserDialog;
