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
  console.log("DeleteCustomerDialog render", customer);

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
    if (customer && confirmName === customer.name) {
      deleteCustomerMutation.mutate(customer._id);
    }
  };

  const copyToClipboard = async () => {
    if (customer?.name) {
      try {
        await navigator.clipboard.writeText(customer.name);
        setIsCopied(true);
        toast.success("คัดลอกชื่อลูกค้าแล้ว", {
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
    deleteCustomerMutation.isPending || confirmName !== customer?.name;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md dark:bg-zinc-900">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle>ยืนยันการลบลูกค้า</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p className="text-sm">
              คุณต้องการลบลูกค้า{" "}
              <span className="font-semibold">"{customer?.name}"</span>{" "}
              ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="confirm-name" className="text-xs font-medium">
                  กรุณากรอกชื่อลูกค้า{" "}
                  <span className="font-semibold">"{customer?.name}"</span>{" "}
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
                placeholder="กรอกชื่อลูกค้าเพื่อยืนยันการลบ"
                disabled={deleteCustomerMutation.isPending}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleteCustomerMutation.isPending}
            className="cursor-pointer"
          >
            ยกเลิก
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleteDisabled}
            className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer disabled:cursor-not-allowed"
          >
            {deleteCustomerMutation.isPending ? "กำลังลบ..." : "ลบลูกค้า"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCustomerDialog;
