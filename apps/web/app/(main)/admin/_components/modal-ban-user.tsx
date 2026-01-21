"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

interface ModalBanUserProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    banned: boolean | null;
  } | null;
}

const ModalBanUser = ({ isOpen, onClose, user }: ModalBanUserProps) => {
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState<string>("7");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      setBanReason("");
      setBanDuration("7");
    }
  }, [user]);

  const banUserMutation = useMutation({
    mutationFn: async ({
      userId,
      banReason,
      banExpiresIn,
    }: {
      userId: string;
      banReason?: string;
      banExpiresIn?: number;
    }) => {
      const { data, error } = await authClient.admin.banUser({
        userId: userId,
        banReason: banReason || undefined,
        banExpiresIn: banExpiresIn,
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("แบนผู้ใช้สำเร็จ");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || "เกิดข้อผิดพลาดในการแบนผู้ใช้");
    },
  });

  const handleBanUser = () => {
    if (!user) return;

    // Convert duration to seconds
    let banExpiresIn: number | undefined;
    if (banDuration === "permanent") {
      banExpiresIn = undefined; // Permanent ban
    } else {
      const days = parseInt(banDuration);
      banExpiresIn = days * 24 * 60 * 60; // Convert days to seconds
    }

    banUserMutation.mutate({
      userId: user.id,
      banReason: banReason || undefined,
      banExpiresIn: banExpiresIn,
    });
  };

  const handleClose = () => {
    setBanReason("");
    setBanDuration("7");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-normal tracking-widest text-xl">ยืนยันการแบนผู้ใช้งาน</DialogTitle>
          <DialogDescription className="font-normal tracking-widest text-base">
            กำลังแบนผู้ใช้: {user?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Field>
            <FieldLabel className="font-normal tracking-widest">ระยะเวลาแบน</FieldLabel>
            <FieldGroup>
              <Select value={banDuration} onValueChange={(value) => setBanDuration(value || "7")}>
                <SelectTrigger className="w-full font-normal tracking-widest">
                  <SelectValue placeholder="เลือกระยะเวลาแบน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 วัน</SelectItem>
                  <SelectItem value="7">7 วัน</SelectItem>
                  <SelectItem value="30">30 วัน</SelectItem>
                  <SelectItem value="90">90 วัน</SelectItem>
                  <SelectItem value="permanent">ถาวร</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
          </Field>

          <Field>
            <FieldLabel className="font-normal tracking-widest">
              เหตุผลในการแบน (ไม่บังคับ)
            </FieldLabel>
            <FieldGroup>
              <InputGroup>
                <InputGroupTextarea
                  placeholder="ระบุเหตุผลในการแบน..."
                  className="font-normal tracking-widest min-h-[100px]"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </InputGroup>
            </FieldGroup>
          </Field>
        </div>
        <DialogFooter className="font-normal tracking-widest">
          <Button variant="outline" onClick={handleClose}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleBanUser}
            disabled={banUserMutation.isPending}
            variant="destructive"
            className="cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
          >
            {banUserMutation.isPending ? "กำลังแบน..." : "แบนผู้ใช้"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalBanUser;
