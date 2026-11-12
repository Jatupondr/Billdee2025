"use client";

/**
 * แถบ "เพิ่มด่วน" ในหน้าสร้างบิล — สินค้าที่ปักหมุดไว้ กดทีเดียวเพิ่มเข้าบิล (กดซ้ำ = บวกจำนวน)
 * คอม 12 ตัว · iPad/มือถือ 6 ตัว · ที่เหลืออยู่ใน "ดูทั้งหมด" (หน้าต่างจัดการปักหมุด)
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CaretDownIcon,
  CaretUpIcon,
  DotsSixVerticalIcon,
  LightningIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PushPinIcon,
  PushPinSlashIcon,
} from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import api from "@/hooks/axios";
import { cn } from "@/lib/utils";

export const QUICK_DESKTOP = 12;
export const QUICK_SMALL = 6;

type Product = { _id: string; name: string; price?: number; cost?: number };
type BillRow = { productId?: string; name?: string; quantity?: number };

const baht = (n?: number) => (n ?? 0).toLocaleString("th-TH", { maximumFractionDigits: 2 });

/** จำนวนชิ้นของสินค้านี้ที่อยู่ในบิลตอนนี้ */
function qtyInBill(rows: BillRow[], p: Product) {
  return rows
    .filter((r) => (r.productId && r.productId === p._id) || (!!r.name && r.name === p.name))
    .reduce((a, r) => a + (Number(r.quantity) || 0), 0);
}

export function QuickAddBar({
  pinned,
  rows,
  onAdd,
  onManage,
}: {
  pinned: Product[];
  rows: BillRow[];
  onAdd: (p: Product) => void;
  onManage: () => void;
}) {
  const hasMoreSmall = pinned.length > QUICK_SMALL;
  const hasMoreDesktop = pinned.length > QUICK_DESKTOP;
  return (
    <section
      aria-label="เพิ่มด่วน"
      className="flex flex-col gap-2 rounded-2xl border border-indigo-300/60 bg-indigo-50/70 p-3 dark:border-indigo-500/30 dark:bg-indigo-950/40 lg:flex-row lg:flex-wrap lg:items-center"
    >
      <div className="flex items-center justify-between lg:contents">
        <span className="flex items-center gap-1.5 pr-1 text-sm font-medium text-indigo-700 dark:text-indigo-200">
          <LightningIcon size={18} weight="fill" />
          เพิ่มด่วน
        </span>
        <button
          type="button"
          onClick={onManage}
          className="min-h-9 text-sm text-indigo-700 underline-offset-4 hover:underline dark:text-indigo-300 lg:hidden"
        >
          {hasMoreSmall ? `ดูทั้งหมด (${pinned.length}) ›` : "จัดการ ›"}
        </button>
      </div>

      {pinned.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          ยังไม่มีสินค้าปักหมุด —{" "}
          <button type="button" onClick={onManage} className="text-indigo-700 underline dark:text-indigo-300">
            ปักหมุดสินค้าที่ขายบ่อย
          </button>{" "}
          แล้วกดเพิ่มเข้าบิลได้ทีเดียว
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:contents">
          {pinned.slice(0, QUICK_DESKTOP).map((p, i) => {
            const q = qtyInBill(rows, p);
            return (
              <button
                key={p._id}
                type="button"
                onClick={() => onAdd(p)}
                className={cn(
                  "flex min-h-12 items-center justify-between gap-2 rounded-xl border px-3 text-left text-sm transition-transform active:scale-95 lg:min-h-10 lg:rounded-full lg:pl-3 lg:pr-2",
                  q > 0
                    ? "border-indigo-500 bg-indigo-100 dark:bg-indigo-900/60"
                    : "border-indigo-200 bg-white dark:border-indigo-500/30 dark:bg-zinc-900",
                  i >= QUICK_SMALL && "hidden lg:flex",
                )}
              >
                <span className="flex min-w-0 flex-col py-1 lg:flex-row lg:items-center lg:gap-1.5 lg:py-0">
                  <PlusIcon size={14} weight="bold" className="hidden shrink-0 lg:block" />
                  <span className="line-clamp-2 leading-snug lg:line-clamp-1">{p.name}</span>
                  <span className="shrink-0 text-xs text-indigo-700/80 dark:text-indigo-300/80">{baht(p.price)}฿</span>
                </span>
                {q > 0 ? (
                  <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-indigo-600 px-1.5 text-xs text-white">
                    ×{baht(q)}
                  </span>
                ) : (
                  <PlusIcon size={16} weight="bold" className="shrink-0 text-indigo-600 lg:hidden" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {hasMoreDesktop && (
        <button
          type="button"
          onClick={onManage}
          className="hidden min-h-10 items-center rounded-full border border-indigo-300 px-3 text-sm text-indigo-700 dark:border-indigo-500/40 dark:text-indigo-200 lg:flex"
        >
          ดูทั้งหมด ({pinned.length})
        </button>
      )}
      <button
        type="button"
        onClick={onManage}
        className="ml-auto hidden min-h-10 items-center gap-1.5 rounded-full border border-dashed border-indigo-300 px-3 text-sm text-indigo-700 dark:border-indigo-500/40 dark:text-indigo-300 lg:flex"
      >
        <PushPinIcon size={15} />
        จัดการปักหมุด
      </button>
    </section>
  );
}

/** หน้าต่างดูทั้งหมด / จัดการปักหมุด: กดเพิ่มเข้าบิล · เรียงลำดับ · เลิกปัก · ค้นหาเพื่อปักเพิ่ม */
export function PinManagerDialog({
  open,
  onOpenChange,
  pinned,
  allProducts,
  rows,
  organizationId,
  userId,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pinned: Product[];
  allProducts: Product[];
  rows: BillRow[];
  organizationId?: string;
  userId?: string;
  onAdd: (p: Product) => void;
}) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [order, setOrder] = useState<Product[] | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const list = order ?? pinned;

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["products-recommended"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const saveOrder = useMutation({
    mutationFn: async (items: Product[]) =>
      api.patch("/products/pin-order", { organizationId, ids: items.map((p) => p._id) }),
    onSuccess: () => refresh(),
    onError: () => toast.error("บันทึกลำดับไม่สำเร็จ ลองใหม่อีกครั้ง"),
  });
  const setPin = useMutation({
    mutationFn: async ({ p, on }: { p: Product; on: boolean }) =>
      api.patch(`/products/${p._id}`, { isRecommended: on, updatedBy: userId }),
    onSuccess: (_d, { p, on }) => {
      setOrder(null);
      refresh();
      toast.success(on ? `ปักหมุด "${p.name}" แล้ว` : `เลิกปักหมุด "${p.name}" แล้ว`);
    },
    onError: () => toast.error("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง"),
  });

  const move = (from: number, to: number) => {
    if (to < 0 || to >= list.length || from === to) return;
    const next = list.slice();
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    setOrder(next);
    saveOrder.mutate(next);
  };

  const pinnedIds = useMemo(() => new Set(list.map((p) => p._id)), [list]);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    const words = s.split(/\s+/);
    return allProducts
      .filter((p) => !pinnedIds.has(p._id) && words.every((w) => p.name.toLowerCase().includes(w)))
      .slice(0, 8);
  }, [q, allProducts, pinnedIds]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setQ("");
          setOrder(null);
        }
      }}
    >
      <DialogContent className="flex max-h-[88vh] flex-col gap-3 sm:max-w-2xl dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle className="font-normal tracking-widest">สินค้าปักหมุด</DialogTitle>
          <DialogDescription className="font-normal">
            กดชื่อเพื่อเพิ่มเข้าบิล · แถบเพิ่มด่วนโชว์ {QUICK_DESKTOP} ตัวแรกบนคอม ({QUICK_SMALL} ตัวบน iPad/มือถือ) · ลากหรือกดลูกศรเพื่อเรียง
          </DialogDescription>
        </DialogHeader>

        <label className="flex h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-muted-foreground">
          <MagnifyingGlassIcon size={16} />
          <span className="sr-only">ค้นหาสินค้าเพื่อปักหมุดเพิ่ม</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาสินค้าเพื่อปักหมุดเพิ่ม…"
            className="h-10 flex-1 bg-transparent text-sm text-foreground outline-none"
          />
        </label>
        {results.length > 0 && (
          <div className="flex flex-col gap-1 rounded-xl border border-border p-1">
            {results.map((p) => (
              <div key={p._id} className="flex min-h-11 items-center gap-2 rounded-lg px-2 hover:bg-accent">
                <span className="flex-1 truncate text-sm">{p.name}</span>
                <span className="text-sm text-muted-foreground">{baht(p.price)} ฿</span>
                <Button size="sm" variant="outline" disabled={setPin.isPending} onClick={() => setPin.mutate({ p, on: true })}>
                  <PushPinIcon size={14} /> ปักหมุด
                </Button>
              </div>
            ))}
          </div>
        )}
        {q.trim() && results.length === 0 && (
          <p className="px-2 text-sm text-muted-foreground">ไม่พบสินค้าที่ยังไม่ได้ปักหมุด</p>
        )}

        <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-1">
          {list.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              ยังไม่มีสินค้าปักหมุด ค้นหาด้านบนเพื่อเริ่มปัก
            </p>
          )}
          {list.map((p, i) => {
            const n = qtyInBill(rows, p);
            return (
              <div key={p._id}>
                <div
                  draggable
                  onDragStart={() => setDragFrom(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragFrom !== null) move(dragFrom, i);
                    setDragFrom(null);
                  }}
                  className={cn(
                    "flex min-h-12 items-center gap-2 rounded-xl px-2",
                    i < QUICK_DESKTOP ? "bg-accent/60" : "bg-transparent",
                    dragFrom === i && "opacity-50",
                  )}
                >
                  <DotsSixVerticalIcon size={18} className="hidden shrink-0 cursor-grab text-muted-foreground sm:block" aria-hidden />
                  <span className="w-6 shrink-0 text-center text-xs text-muted-foreground">{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => onAdd(p)}
                    className="flex min-h-11 min-w-0 flex-1 items-center gap-2 text-left"
                    aria-label={`เพิ่ม ${p.name} เข้าบิล`}
                  >
                    <span className="truncate text-sm">{p.name}</span>
                    {n > 0 && (
                      <span className="rounded-full bg-indigo-600 px-1.5 text-xs text-white">×{baht(n)}</span>
                    )}
                  </button>
                  <span className="w-20 shrink-0 text-right text-sm text-muted-foreground">{baht(p.price)} ฿</span>
                  <span className="flex shrink-0 flex-col">
                    <button type="button" aria-label="ย้ายขึ้น" disabled={i === 0} onClick={() => move(i, i - 1)} className="grid h-5 w-8 place-items-center rounded text-muted-foreground hover:bg-accent disabled:opacity-25">
                      <CaretUpIcon size={14} weight="bold" />
                    </button>
                    <button type="button" aria-label="ย้ายลง" disabled={i === list.length - 1} onClick={() => move(i, i + 1)} className="grid h-5 w-8 place-items-center rounded text-muted-foreground hover:bg-accent disabled:opacity-25">
                      <CaretDownIcon size={14} weight="bold" />
                    </button>
                  </span>
                  <button
                    type="button"
                    aria-label={`เลิกปักหมุด ${p.name}`}
                    disabled={setPin.isPending}
                    onClick={() => setPin.mutate({ p, on: false })}
                    className="grid size-10 shrink-0 place-items-center rounded-full text-red-500 hover:bg-red-500/10"
                  >
                    <PushPinSlashIcon size={17} />
                  </button>
                </div>
                {i === QUICK_DESKTOP - 1 && list.length > QUICK_DESKTOP && (
                  <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-indigo-600 dark:text-indigo-300">
                    <span className="h-px flex-1 bg-indigo-300/60" />
                    ด้านบนโชว์ในแถบเพิ่มด่วนบนคอม
                    <span className="h-px flex-1 bg-indigo-300/60" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <Link href={"/products" as any} className="text-sm text-indigo-700 hover:underline dark:text-indigo-300">
            จัดการที่หน้ารายการสินค้า →
          </Link>
          <Button onClick={() => onOpenChange(false)}>เสร็จ</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
