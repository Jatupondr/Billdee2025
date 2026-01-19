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

interface ViewCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: any | null;
}

const ViewCustomerModal = ({
  open,
  onOpenChange,
  customer,
}: ViewCustomerModalProps) => {
  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal tracking-widest">รายละเอียดลูกค้า</DialogTitle>
          <DialogDescription className="text-base font-normal tracking-widest">
            ข้อมูลลูกค้าทั้งหมด
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-normal tracking-widest text-muted-foreground">
                  ชื่อลูกค้า
                </label>
                <p className="text-base font-normal tracking-widest">
                  {customer.name || "-"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-normal tracking-widest text-muted-foreground">
                  เบอร์โทรศัพท์
                </label>
                <p className="text-base font-normal tracking-widest">
                  {customer.phone || "-"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-normal tracking-widest text-muted-foreground">
                ที่อยู่
              </label>
              <p className="text-base font-normal tracking-widest">{customer.address || "-"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-normal tracking-widest text-muted-foreground">
                  จังหวัด
                </label>
                <p className="text-base font-normal tracking-widest">
                  {customer.province || "-"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-normal tracking-widest text-muted-foreground">
                  เขต/อำเภอ
                </label>
                <p className="text-base font-normal tracking-widest">
                  {customer.district || "-"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-normal tracking-widest text-muted-foreground">
                  ตำบล/แขวง
                </label>
                <p className="text-base font-normal tracking-widest">
                  {customer.subDistrict || "-"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-normal tracking-widest text-muted-foreground">
                  รหัสไปรษณีย์
                </label>
                <p className="text-base font-normal tracking-widest">
                  {customer.postalCode || "-"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-normal tracking-widest text-muted-foreground">
                สถานะ
              </label>
              <div>
                {customer.typeCustomer === "customer" ? (
                  <Badge variant="default">ลูกค้า</Badge>
                ) : (
                  <Badge variant="secondary">ซัพพลายเออร์</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-normal tracking-widest text-muted-foreground">
                  วันที่สร้าง
                </label>
                <p className="text-sm font-normal tracking-widest">
                  {new Date(customer.createdAt).toLocaleDateString("th-TH", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }) || "-"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-normal tracking-widest text-muted-foreground">
                  แก้ไขล่าสุด
                </label>
                <p className="text-sm font-normal tracking-widest">
                  {new Date(customer.updatedAt).toLocaleDateString("th-TH", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }) || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewCustomerModal;
