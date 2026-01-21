"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

interface ModalUnbanUserProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
  } | null;
}

const ModalUnbanUser = ({ isOpen, onClose, user }: ModalUnbanUserProps) => {
  const queryClient = useQueryClient();

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await authClient.admin.unbanUser({
        userId: userId,
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("ยกเลิกการแบนผู้ใช้สำเร็จ");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || "เกิดข้อผิดพลาดในการยกเลิกการแบน");
    },
  });

  const handleUnbanUser = () => {
    if (!user) return;
    unbanUserMutation.mutate(user.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-normal tracking-widest text-xl">
            ยกเลิกการแบนผู้ใช้งาน
          </DialogTitle>
          <DialogDescription className="font-normal tracking-widest text-base">
            คุณต้องการยกเลิกการแบนผู้ใช้: {user?.name} หรือไม่?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="font-normal tracking-widest">
          <Button variant="outline" onClick={onClose} className="cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest">
            ยกเลิก
          </Button>
          <Button
            onClick={handleUnbanUser}
            disabled={unbanUserMutation.isPending}
            className="bg-green-600 hover:bg-green-700 cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
          >
            {unbanUserMutation.isPending ? "กำลังดำเนินการ..." : "ยืนยัน"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalUnbanUser;
