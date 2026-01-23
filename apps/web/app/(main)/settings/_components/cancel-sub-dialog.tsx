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
import { useRouter } from "next/navigation";

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string | null;
}

const CancelSubscriptionDialog = ({
  open,
  onOpenChange,
  subscriptionId,
}: CancelSubscriptionDialogProps) => {

  const router = useRouter();
  const queryClient = useQueryClient();




  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/subscriptions/cancel/${id}`);
      return response.data;
    },
    onSuccess: () => {

      toast.success("ยกเลิกการสมัครสำเร็จ", {
        position: "bottom-right",
      });

      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      router.push("/");

    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด", {
        description: error?.response?.data?.message || "ไม่สามารถยกเลิกการสมัครได้",
        position: "bottom-right",
      });
    },
  });

  const handleDelete = () => {
    if (!subscriptionId) return;
    deleteProductMutation.mutate(subscriptionId);
  };

  if (!subscriptionId) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="font-normal tracking-widest">
            ยืนยันการยกเลิกการสมัคร
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-normal ">
            Are you sure you want to cancel the subscription? All of the data will be
            permanently removed. This action cannot be undone
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleteProductMutation.isPending}
            className="cursor-pointer font-normal tracking-widest"
          >
            ยกเลิก
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer disabled:cursor-not-allowed font-normal tracking-widest"
          >
            {deleteProductMutation.isPending ? "กำลังยกเลิก..." : "ยกเลิกการสมัคร"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelSubscriptionDialog;
