"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  description: string;
  recommended: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ViewProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any | null;
}

const ViewProductModal = ({
  open,
  onOpenChange,
  product,
}: ViewProductModalProps) => {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle className="text-2xl">รายละเอียดสินค้า</DialogTitle>
          <DialogDescription className="text-base">
            ข้อมูลสินค้าทั้งหมด
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                ชื่อสินค้า
              </label>
              <p className="text-base font-semibold">{product.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  ราคาขาย
                </label>
                <p className="text-base font-semibold">
                  ฿{Number(product.price).toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  ต้นทุน
                </label>
                <p className="text-base font-semibold">
                  ฿{Number(product.cost).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  กำไรที่ขายได้
                </label>
                <p className="text-base font-semibold text-green-600">
                  ฿
                  {(
                    Number(product.price) - Number(product.cost)
                  ).toLocaleString()}
                </p>
              </div>

              <div className="space-y-2 flex flex-col ">
                <label className="text-sm font-medium text-muted-foreground">
                  สถานะ
                </label>
                <Badge variant="default">
                  {product.isRecommended ? "แนะนำ" : "ทั่วไป"}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                รายละเอียด
              </label>
              <p className="text-base">{product.description || "-"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                สถานะ
              </label>
              <div>
                {product.recommended ? (
                  <Badge variant="default">สินค้าแนะนำ</Badge>
                ) : (
                  <Badge variant="secondary">ทั่วไป</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  วันที่สร้าง
                </label>
                <p className="text-sm">
                  {format(new Date(product.createdAt), "dd/MM/yyyy HH:mm")}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  แก้ไขล่าสุด
                </label>
                <p className="text-sm">
                  {format(new Date(product.updatedAt), "dd/MM/yyyy HH:mm")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewProductModal;
