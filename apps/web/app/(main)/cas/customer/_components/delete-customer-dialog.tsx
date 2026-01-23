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

interface Customer {
  _id: string;
  name: string;
}

interface DeleteCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: any | null;
}

const DeleteCustomerDialog = ({
  open,
  onOpenChange,
  customer,
}: DeleteCustomerDialogProps) => {


  const queryClient = useQueryClient();
  const [confirmName, setConfirmName] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // Reset confirmation input when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setConfirmName("");
      setIsCopied(false);
    }
  }, [open]);

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/customers/${id}/delete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("ลบลูกค้าสำเร็จ", {
        position: "bottom-right",
      });
      setConfirmName("");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด", {
        description: error?.response?.data?.message || "ไม่สามารถลบลูกค้าได้",
        position: "bottom-right",
      });
    },
  });

  const handleDelete = () => {
    if (!customer) return;
    deleteCustomerMutation.mutate(customer._id);
  };

  if (!customer) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md dark:bg-zinc-900">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="font-normal tracking-widest">
            ยืนยันการลบลูกค้า
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-normal ">
            Are you sure you want to delete the customer? All of the data will
            be permanently removed. This action cannot be undone
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleteCustomerMutation.isPending}
            className="cursor-pointer font-normal tracking-widest"
          >
            ยกเลิก
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer disabled:cursor-not-allowed font-normal tracking-widest"
          >
            {deleteCustomerMutation.isPending ? "กำลังลบ..." : "ลบลูกค้า"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCustomerDialog;
