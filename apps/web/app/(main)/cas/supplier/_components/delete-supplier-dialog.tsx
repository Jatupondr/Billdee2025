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

interface Supplier {
  _id: string;
  name: string;
}

interface DeleteSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: any | null;
}

const DeleteSupplierDialog = ({
  open,
  onOpenChange,
  supplier,
}: DeleteSupplierDialogProps) => {

  const queryClient = useQueryClient();



  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/customers/${id}/delete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("ลบซัพพลายเออร์สำเร็จ", {
        position: "bottom-right",
      });

      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด", {
        description:
          error?.response?.data?.message || "ไม่สามารถลบซัพพลายเออร์ได้",
        position: "bottom-right",
      });
    },
  });

  const handleDelete = () => {
    if (!supplier) return;
    deleteSupplierMutation.mutate(supplier._id);
  };

  if (!supplier) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md dark:bg-zinc-900">
        <AlertDialogHeader className="space-y-1">
          <AlertDialogTitle className="font-normal tracking-widest">
            ยืนยันการลบซัพพลายเออร์
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-normal ">
            Are you sure you want to delete the supplier? All of the data will
            be permanently removed. This action cannot be undone
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleteSupplierMutation.isPending}
            className="cursor-pointer font-normal tracking-widest"
          >
            ยกเลิก
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer disabled:cursor-not-allowed font-normal tracking-widest"
          >
            {deleteSupplierMutation.isPending ? "กำลังลบ..." : "ลบซัพพลายเออร์"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSupplierDialog;
