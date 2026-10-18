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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/hooks/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface PackRow {
  _id: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  expDate: string;
  userId?: { name?: string; email?: string };
}

export const STATUS_LABELS: Record<string, string> = {
  paid: "ชำระเงินแล้ว",
  unpaid: "รอการชำระเงิน",
  expired: "หมดอายุ",
  canceled: "ยกเลิก",
};

const DAY_MS = 24 * 60 * 60 * 1000;
const PRESET_DAYS = [7, 30, 90, 180, 365];

const thaiDate = (value: Date | string) =>
  new Date(value).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const errorToast = (error: any, fallback: string) =>
  toast.error("เกิดข้อผิดพลาด", {
    description: error?.response?.data?.message || fallback,
    position: "bottom-right",
  });

function usePackMutation<T>(
  fn: (vars: T) => Promise<any>,
  successText: string,
  failText: string,
  onDone: () => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      toast.success(successText, { position: "bottom-right" });
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      onDone();
    },
    onError: (error: any) => errorToast(error, failText),
  });
}

// ---------- เพิ่มวันใช้งาน ----------
export function ExtendDaysDialog({
  pack,
  onOpenChange,
}: {
  pack: PackRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [days, setDays] = useState(30);
  useEffect(() => {
    if (pack) setDays(30);
  }, [pack]);

  const mutation = usePackMutation(
    (d: number) =>
      api.patch(`/subscriptions/${pack?._id}/extend`, { days: d }),
    `เพิ่มวันใช้งาน ${days} วันแล้ว`,
    "ไม่สามารถเพิ่มวันใช้งานได้",
    () => onOpenChange(false),
  );

  if (!pack) return null;
  const base = Math.max(new Date(pack.expDate).getTime(), Date.now());
  const validDays = Number.isInteger(days) && days >= 1 && days <= 3650;
  const newExp = new Date(base + (validDays ? days : 0) * DAY_MS);
  const expired = new Date(pack.expDate).getTime() < Date.now();

  return (
    <Dialog open={!!pack} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-normal tracking-widest">
            เพิ่มวันใช้งาน
          </DialogTitle>
          <DialogDescription className="font-normal tracking-widest">
            {pack.userId?.name || "-"} · แพ็คเกจ {pack.plan}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {PRESET_DAYS.map((d) => (
              <Button
                key={d}
                type="button"
                variant={days === d ? "default" : "outline"}
                size="sm"
                className="cursor-pointer font-normal tracking-widest"
                onClick={() => setDays(d)}
              >
                +{d} วัน
              </Button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="extend-days" className="font-normal tracking-widest">
              หรือระบุจำนวนวัน
            </Label>
            <Input
              id="extend-days"
              type="number"
              min={1}
              max={3650}
              value={Number.isNaN(days) ? "" : days}
              onChange={(e) => setDays(parseInt(e.target.value, 10))}
              className="font-normal tracking-widest"
            />
          </div>
          <div className="rounded-lg border p-3 text-sm font-normal tracking-widest flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">หมดอายุเดิม</span>
              <span>
                {thaiDate(pack.expDate)}
                {expired && " (หมดแล้ว)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">หมดอายุใหม่</span>
              <span className="text-primary">{thaiDate(newExp)}</span>
            </div>
            {expired && (
              <p className="text-xs text-muted-foreground pt-1">
                แพ็คเกจหมดอายุแล้ว จะนับวันใหม่ตั้งแต่วันนี้ และเปลี่ยนสถานะเป็นชำระเงินแล้ว
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer font-normal tracking-widest"
            onClick={() => onOpenChange(false)}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            disabled={!validDays || mutation.isPending}
            className="cursor-pointer font-normal tracking-widest"
            onClick={() => mutation.mutate(days)}
          >
            {mutation.isPending ? "กำลังบันทึก..." : `เพิ่ม ${validDays ? days : 0} วัน`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- แก้ไขแพ็คเกจ ----------
const toInputDate = (value: string) =>
  value ? format(new Date(value), "yyyy-MM-dd") : "";

export function EditPackDialog({
  pack,
  onOpenChange,
}: {
  pack: PackRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [plan, setPlan] = useState("pro");
  const [status, setStatus] = useState("paid");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!pack) return;
    setPlan(pack.plan);
    setStatus(pack.status);
    setStartDate(toInputDate(pack.startDate));
    setEndDate(toInputDate(pack.expDate || pack.endDate));
  }, [pack]);

  const mutation = usePackMutation(
    (body: Record<string, unknown>) =>
      api.patch(`/subscriptions/${pack?._id}`, body),
    "บันทึกการแก้ไขแพ็คเกจแล้ว",
    "ไม่สามารถแก้ไขแพ็คเกจได้",
    () => onOpenChange(false),
  );

  if (!pack) return null;
  const datesValid = startDate && endDate && startDate <= endDate;

  const save = () => {
    // วันหมดอายุ = สิ้นวันที่เลือก (เวลาท้องถิ่น)
    const end = new Date(`${endDate}T23:59:59`);
    mutation.mutate({
      plan,
      status,
      startDate: new Date(`${startDate}T00:00:00`).toISOString(),
      endDate: end.toISOString(),
      expDate: end.toISOString(),
    });
  };

  return (
    <Dialog open={!!pack} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-normal tracking-widest">
            แก้ไขแพ็คเกจ
          </DialogTitle>
          <DialogDescription className="font-normal tracking-widest">
            {pack.userId?.name || "-"} {pack.userId?.email ? `· ${pack.userId.email}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label className="font-normal tracking-widest">แพ็คเกจ</Label>
            <Select value={plan} onValueChange={(v: any) => setPlan(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pro">pro</SelectItem>
                <SelectItem value="free">free</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-normal tracking-widest">สถานะ</Label>
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger className="w-full">
                <SelectValue>{STATUS_LABELS[status] ?? status}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="pack-start" className="font-normal tracking-widest">
              วันเริ่มต้น
            </Label>
            <Input
              id="pack-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="pack-end" className="font-normal tracking-widest">
              วันหมดอายุ
            </Label>
            <Input
              id="pack-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        {!datesValid && (
          <p className="text-sm text-destructive font-normal tracking-widest">
            วันหมดอายุต้องไม่ก่อนวันเริ่มต้น
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer font-normal tracking-widest"
            onClick={() => onOpenChange(false)}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            disabled={!datesValid || mutation.isPending}
            className="cursor-pointer font-normal tracking-widest"
            onClick={save}
          >
            {mutation.isPending ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- ยืนยัน: ยกเลิก / ลบ ----------
export function ConfirmPackDialog({
  pack,
  action,
  onOpenChange,
}: {
  pack: PackRow | null;
  action: "cancel" | "delete";
  onOpenChange: (open: boolean) => void;
}) {
  const isDelete = action === "delete";
  const mutation = usePackMutation(
    () =>
      isDelete
        ? api.delete(`/subscriptions/${pack?._id}/delete`)
        : api.patch(`/subscriptions/cancel/${pack?._id}`),
    isDelete ? "ลบแพ็คเกจแล้ว" : "ยกเลิกแพ็คเกจแล้ว",
    isDelete ? "ไม่สามารถลบแพ็คเกจได้" : "ไม่สามารถยกเลิกแพ็คเกจได้",
    () => onOpenChange(false),
  );

  if (!pack) return null;
  return (
    <AlertDialog open={!!pack} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="font-normal tracking-widest">
            {isDelete ? "ยืนยันการลบแพ็คเกจ" : "ยืนยันการยกเลิกแพ็คเกจ"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-normal tracking-widest">
            {pack.userId?.name || "-"} · แพ็คเกจ {pack.plan}
            <br />
            {isDelete
              ? "รายการนี้จะถูกซ่อนจากระบบ และผู้ใช้จะไม่ได้รับสิทธิ์ของแพ็คเกจนี้อีก"
              : "แพ็คเกจจะหมดอายุทันที และผู้ใช้จะกลับไปใช้สิทธิ์แบบฟรี"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={mutation.isPending}
            className="cursor-pointer font-normal tracking-widest"
          >
            ปิด
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => mutation.mutate(undefined)}
            disabled={mutation.isPending}
            className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer font-normal tracking-widest"
          >
            {mutation.isPending
              ? "กำลังดำเนินการ..."
              : isDelete
                ? "ลบแพ็คเกจ"
                : "ยกเลิกแพ็คเกจ"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
