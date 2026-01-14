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
  console.log("DeleteSupplierDialog render", supplier);

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
      setConfirmName("");
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
    if (supplier && confirmName === supplier.name) {
      deleteSupplierMutation.mutate(supplier._id);
    }
  };

  const copyToClipboard = async () => {
    if (supplier?.name) {
      try {
        await navigator.clipboard.writeText(supplier.name);
        setIsCopied(true);
        toast.success("คัดลอกชื่อซัพพลายเออร์แล้ว", {
          position: "bottom-right",
        });
        // Reset copied state after 2 seconds
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        toast.error("ไม่สามารถคัดลอกได้", {
          position: "bottom-right",
        });
      }
    }
  };

  const isDeleteDisabled =
    deleteSupplierMutation.isPending || confirmName !== supplier?.name;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md dark:bg-zinc-900">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle>ยืนยันการลบซัพพลายเออร์</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p className="text-sm">
              คุณต้องการลบซัพพลายเออร์{" "}
              <span className="font-semibold">"{supplier?.name}"</span>{" "}
              ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="confirm-name" className="text-xs font-medium">
                  กรุณากรอกชื่อซัพพลายเออร์{" "}
                  <span className="font-semibold">"{supplier?.name}"</span>{" "}
                  เพื่อยืนยัน
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-6 px-2 text-xs cursor-pointer"
                  disabled={isCopied}
                >
                  {isCopied ? (
                    <>
                      <CheckCircleIcon
                        size={14}
                        weight="fill"
                        className="mr-1 text-green-600"
                      />
                      คัดลอกแล้ว
                    </>
                  ) : (
                    <>
                      <CopyIcon size={14} weight="bold" className="mr-1" />
                      คัดลอก
                    </>
                  )}
                </Button>
              </div>
              <Input
                id="confirm-name"
                type="text"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder="กรอกชื่อซัพพลายเออร์เพื่อยืนยันการลบ"
                disabled={deleteSupplierMutation.isPending}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleteSupplierMutation.isPending}
            className="cursor-pointer"
          >
            ยกเลิก
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleteDisabled}
            className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer disabled:cursor-not-allowed"
          >
            {deleteSupplierMutation.isPending ? "กำลังลบ..." : "ลบซัพพลายเออร์"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSupplierDialog;
