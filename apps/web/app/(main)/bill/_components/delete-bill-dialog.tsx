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
import { Button } from "@/components/ui/button";
import { CopyIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import api from "@/hooks/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { collectMeta } from "next/dist/build/utils";

interface Bill {
  _id: string;
  name: string;
}

interface DeleteBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: any | null;
}

const DeleteBillDialog = ({
  open,
  onOpenChange,
  bill,
}: DeleteBillDialogProps) => {


  const queryClient = useQueryClient();




  const deleteBillMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/bills/${id}/delete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast.success("ลบบิลสำเร็จ", {
        position: "bottom-right",
      });

      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด", {
        description:
          error?.response?.data?.message || "ไม่สามารถลบบิลได้",
        position: "bottom-right",
      });
    },
  });

  const handleDelete = () => {
    if (!bill) return;
    deleteBillMutation.mutate(bill._id);
  };

  if (!bill) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md dark:bg-zinc-900">
        <AlertDialogHeader className="space-y-1">
          <AlertDialogTitle className="font-normal tracking-widest">
            ยืนยันการลบบิล
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-normal ">
            Are you sure you want to delete the bill? All of the data will
            be permanently removed. This action cannot be undone
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleteBillMutation.isPending}
            className="cursor-pointer font-normal tracking-widest"
          >
            ยกเลิก
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer disabled:cursor-not-allowed font-normal tracking-widest"
          >
            {deleteBillMutation.isPending ? "กำลังลบ..." : "ลบบิล"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteBillDialog;
