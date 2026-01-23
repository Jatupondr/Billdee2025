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

import { toast } from "sonner";
import api from "@/hooks/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";


interface DeleteBillExpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billExp: any | null;
}

const DeleteBillDialog = ({
  open,
  onOpenChange,
  billExp,
}: DeleteBillExpDialogProps) => {


  const queryClient = useQueryClient();




  const deleteBillExpMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/exp/${id}/delete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills-expense"] });
      toast.success("ลบบิลค่าใช้จ่ายสำเร็จ", {
        position: "bottom-right",
      });

      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด", {
        description:
          error?.response?.data?.message || "ไม่สามารถลบบิลค่าใช้จ่ายได้",
        position: "bottom-right",
      });
    },
  });

  const handleDelete = () => {
    if (!billExp) return;
    deleteBillExpMutation.mutate(billExp._id);
  };

  if (!billExp) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md dark:bg-zinc-900">
        <AlertDialogHeader className="space-y-1">
          <AlertDialogTitle className="font-normal tracking-widest">
            ยืนยันการลบบิลค่าใช้จ่าย
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-normal ">
            Are you sure you want to delete the bill expense? All of the data will
            be permanently removed. This action cannot be undone
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleteBillExpMutation.isPending}
            className="cursor-pointer font-normal tracking-widest"
          >
            ยกเลิก
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer disabled:cursor-not-allowed font-normal tracking-widest"
          >
            {deleteBillExpMutation.isPending ? "กำลังลบ..." : "ลบบิลค่าใช้จ่าย"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteBillDialog;
