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

interface Product {
  _id: string;
  name: string;
}

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any | null;
}

const DeleteProductDialog = ({
  open,
  onOpenChange,
  product,
}: DeleteProductDialogProps) => {
  console.log("DeleteProductDialog render", product);

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

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/products/${id}/delete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("ลบสินค้าสำเร็จ", {
        position: "bottom-right",
      });
      setConfirmName("");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error("เกิดข้อผิดพลาด", {
        description: error?.response?.data?.message || "ไม่สามารถลบสินค้าได้",
        position: "bottom-right",
      });
    },
  });

  const handleDelete = () => {
    if (product && confirmName === product.name) {
      deleteProductMutation.mutate(product._id);
    }
  };

  const copyToClipboard = async () => {
    if (product?.name) {
      try {
        await navigator.clipboard.writeText(product.name);
        setIsCopied(true);
        toast.success("คัดลอกชื่อสินค้าแล้ว", {
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
    deleteProductMutation.isPending || confirmName !== product?.name;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle>ยืนยันการลบสินค้า</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p className="text-sm">
              คุณต้องการลบสินค้า{" "}
              <span className="font-semibold">"{product?.name}"</span>{" "}
              ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="confirm-name" className="text-xs font-medium">
                  กรุณากรอกชื่อสินค้า{" "}
                  <span className="font-semibold">"{product?.name}"</span>{" "}
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
                placeholder="กรอกชื่อสินค้าเพื่อยืนยันการลบ"
                disabled={deleteProductMutation.isPending}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleteProductMutation.isPending}
            className="cursor-pointer"
          >
            ยกเลิก
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleteDisabled}
            className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer disabled:cursor-not-allowed"
          >
            {deleteProductMutation.isPending ? "กำลังลบ..." : "ลบสินค้า"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProductDialog;
