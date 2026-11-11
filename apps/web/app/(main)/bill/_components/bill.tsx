"use client";
import { DataTable } from "@/components/data-table";
import Paginations from "@/components/pagination";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CopyIcon,
  EyeIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
  DotsThreeVerticalIcon,
  PrinterIcon,
  ImageIcon,
} from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { authClient } from "@/lib/auth-client";
import api from "@/hooks/axios";
import { useRouter } from "next/navigation";
import DeleteBillDialog from "./delete-bill-dialog";
import { StatusChoices, StatusMenu, useSetStatus } from "./status";
import { copyBillForCustomer } from "./customer-copy";
import { useChatSettings } from "@/lib/chat-bill";
import ShowSubproDialog from "./show-subpro-dialog";
import { downloadReceiptImage } from "@/lib/receipt-image";
import { toast } from "sonner";

interface Bill {
  _id: string;
  billNumber: string;
  name_customer: string;
  total: number;
  status: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  date: string;
  cost: number;
}

const Bill = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showSubproDialogOpen, setShowSubproDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { data: activeOrg, isPending } = authClient.useActiveOrganization();
  const chatSettings = useChatSettings(activeOrg?.id);
  const { data: session, isPending: isLoadingSession } =
    authClient.useSession();

  // ตัวกรองสถานะ (B3): "" = ทั้งหมด
  const [statusFilter, setStatusFilter] = useState<string>("");
  // จัดการหลายบิล: กดปุ่มก่อนถึงมีช่องติ๊ก
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmCancel, setConfirmCancel] = useState(false);
  const setStatus = useSetStatus(activeOrg?.id);
  const toggle = (id: string) =>
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const exitSelect = () => {
    setSelectMode(false);
    setSelected(new Set());
    setConfirmCancel(false);
  };
  const { data: countsData } = useQuery<any>({
    queryKey: ["bill-counts", activeOrg?.id],
    queryFn: async () =>
      (await api.get(`/bills/status-counts?organizationId=${activeOrg?.id}`)).data,
    enabled: !!activeOrg?.id,
  });
  const counts: Record<string, number> = countsData?.data ?? {};
  const getBills = async (page: number, pageSize: number, search: string) => {
    const response = await api.get(
      `/bills?page=${page}&pageSize=${pageSize}&search=${search}&organizationId=${activeOrg?.id}${statusFilter ? `&status=${statusFilter}` : ""}`,
    );
    return response.data;
  };

  // เมนู ⋮ (พิมพ์ / รูป / คัดลอก / ดู / แก้ไข / ลบ) — ใช้ทั้งตารางและการ์ดมือถือ
  const ActionsMenu = ({ b }: { b: Bill }) => (
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  className="cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
                  size="icon"
                >
                  <DotsThreeVerticalIcon size={24} weight="bold" />
                </Button>
              }
            />

            <DropdownMenuContent className="w-40" align="start">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal tracking-widest">
                  ดำเนินการ
                </DropdownMenuLabel>

                <DropdownMenuItem
                  onClick={() => {
                    // new window
                    window.open(
                      `${process.env.NEXT_PUBLIC_API_URL}/report/receipt/${b._id}`,
                      "_blank",
                    );
                  }}
                  className="text-zinc-900 dark:text-zinc-300 cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
                >
                  <PrinterIcon size={20} weight="bold" />
                  พิมพ์ใบเสร็จ
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    toast.promise(
                      downloadReceiptImage(
                        b._id,
                        b.billNumber,
                      ),
                      {
                        loading: "กำลังสร้างรูปใบเสร็จ...",
                        success: "บันทึกใบเสร็จเป็นรูปแล้ว",
                        error: "บันทึกใบเสร็จเป็นรูปไม่สำเร็จ",
                        position: "bottom-right",
                      },
                    );
                  }}
                  className="text-zinc-900 dark:text-zinc-300 cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
                >
                  <ImageIcon size={20} weight="bold" />
                  บันทึกเป็นรูป
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    copyBillForCustomer(b as any, activeOrg as any, chatSettings)
                  }
                  className="text-zinc-900 dark:text-zinc-300 cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
                >
                  <CopyIcon size={20} weight="bold" />
                  คัดลอกบิลส่งลูกค้า
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    router.push(`/bill/${b._id}` as any);
                  }}
                  className="text-zinc-900 dark:text-zinc-300 cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
                >
                  <EyeIcon size={20} weight="bold" />
                  ดูรายละเอียดบิล
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    router.push(`/bill/${b._id}/edit`);
                  }}
                  className="text-zinc-900 dark:text-zinc-300 cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
                >
                  <PencilIcon size={20} weight="bold" />
                  แก้ไขบิล
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedBill(b);
                    setDeleteDialogOpen(true);
                  }}
                  variant="destructive"
                  className="font-normal tracking-widest"
                >
                  <TrashIcon size={20} weight="bold" />
                  ลบบิล
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
  );

  const selectColumn: ColumnDef<Bill> = {
    id: "select",
    size: 40,
    header: ({ table }) => {
      const pageIds = table.getRowModel().rows.map((r) => r.original._id);
      const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
      return (
      <input
        type="checkbox"
        aria-label="เลือกทั้งหน้า"
        checked={allOnPage}
        onChange={() =>
          setSelected((cur) => {
            const next = new Set(cur);
            if (allOnPage) pageIds.forEach((id) => next.delete(id));
            else pageIds.forEach((id) => next.add(id));
            return next;
          })
        }
        className="size-4 accent-blue-600"
      />
      );
    },
    cell: ({ row }) => (
      <input
        type="checkbox"
        aria-label={`เลือกบิล ${row.original.billNumber}`}
        checked={selected.has(row.original._id)}
        onChange={() => toggle(row.original._id)}
        className="size-4 accent-blue-600"
      />
    ),
  };
  const baseColumns: ColumnDef<Bill>[] = [
    {
      header: "เลขที่บิล",
      accessorKey: "billNumber",
      size: 120,
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => router.push(`/bill/${row.original._id}` as any)}
          className="text-sm font-normal tracking-widest text-left line-clamp-1 hover:underline"
        >
          {row.original.billNumber || "-"}
        </button>
      ),
    },
    {
      header: "ชื่อลูกค้า",
      accessorKey: "customerName",
      size: 150,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1 ">
          {row.original.name_customer || "-"}
        </span>
      ),
    },
    {
      header: "ยอดรวม",
      accessorKey: "totalAmount",
      size: 100,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {row.original.total?.toLocaleString("th-TH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || "0.00"}{" "}
          ฿
        </span>
      ),
    },
    {
      header: "ยอดต้นทุน",
      accessorKey: "costAmount",
      size: 100,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {row.original.cost?.toLocaleString("th-TH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || "0.00"}{" "}
          ฿
        </span>
      ),
    },
    {
      header: "กำไรต่อบิล",
      accessorKey: "profitPerBill",
      size: 100,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1 text-green-500">
          {(row.original.total - row.original.cost)?.toLocaleString("th-TH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || "0.00"}{" "}
          ฿
        </span>
      ),
    },
    {
      header: "สถานะ",
      accessorKey: "status",
      size: 110,
      cell: ({ row }) => (
        <StatusMenu bill={row.original} organizationId={activeOrg?.id} />
      ),
    },
    // {
    //   header: "สถานะ",
    //   accessorKey: "status",
    //   size: 100,
    //   cell: ({ row }) => {
    //     const status = row.original.status?.toLowerCase() || "";

    //     const getStatusConfig = (status: string) => {
    //       switch (status) {
    //         case "paid":
    //         case "ชำระแล้ว":
    //           return {
    //             variant: "default" as const,
    //             className: "bg-green-500 hover:bg-green-600 text-white",
    //             label: "ชำระแล้ว",
    //           };
    //         case "pending":
    //         case "รอดำเนินการ":
    //           return {
    //             variant: "default" as const,
    //             className: "bg-yellow-500 hover:bg-yellow-600 text-white",
    //             label: "รอดำเนินการ",
    //           };
    //         case "cancelled":
    //         case "ยกเลิก":
    //           return {
    //             variant: "destructive" as const,
    //             className: "",
    //             label: "ยกเลิก",
    //           };
    //         case "draft":
    //         case "ร่าง":
    //           return {
    //             variant: "secondary" as const,
    //             className: "",
    //             label: "ร่าง",
    //           };
    //         case "overdue":
    //         case "เกินกำหนด":
    //           return {
    //             variant: "default" as const,
    //             className: "bg-orange-500 hover:bg-orange-600 text-white",
    //             label: "เกินกำหนด",
    //           };
    //         default:
    //           return {
    //             variant: "outline" as const,
    //             className: "",
    //             label: row.original.status || "-",
    //           };
    //       }
    //     };

    //     const config = getStatusConfig(status);

    //     return (
    //       <Badge variant={config.variant} className={config.className}>
    //         {config.label}
    //       </Badge>
    //     );
    //   },
    // },

    {
      header: "วันที่ออกบิล",
      accessorKey: "date",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {new Date(row.original.date).toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }) || "-"}
        </span>
      ),
    },
    {
      header: "จัดการ",
      accessorKey: "",
      size: 60,
      cell: ({ row }) => <ActionsMenu b={row.original} />,
    },
  ];
  const columns = selectMode ? [selectColumn, ...baseColumns] : baseColumns;

  const { data: billsData, isLoading: isLoadingBills } = useQuery<any>({
    queryKey: ["bills", debouncedSearch, page, pageSize, statusFilter],
    queryFn: () => getBills(page, pageSize, debouncedSearch),
  });

  const getSubscriptionById = async (subscriptionId: string) => {
    const response = await api.get(`/subscriptions/${subscriptionId}`);
    return response.data;
  };

  const { data: subscriptionData, isLoading: isLoadingSubscription } =
    useQuery<any>({
      queryKey: ["subscription"],
      queryFn: () => getSubscriptionById(session?.user?.id || ""),
      enabled: !!session?.user?.id,
    });

  const isProPlan =
    subscriptionData?.data?.plan === "pro" &&
    subscriptionData?.data?.status === "paid";

  const handleCreateBill = () => {
    if (isProPlan || billsData?.rows?.length <= 10) {
      router.push("/bill/create");
    } else {
      setShowSubproDialogOpen(true);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center min-w-full">
        <Card className="shadow-2xl rounded-2xl w-full dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-2xl  font-normal tracking-widest">
              รายการบิล
            </CardTitle>
            <CardDescription className="text-base  font-normal tracking-widest">
              รายการบิลทั้งหมดในระบบ
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 w-full">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <Button
                size="lg"
                className="cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
                onClick={() => handleCreateBill()}
              >
                <PlusCircleIcon size={36} weight="bold" />
                สร้างบิลใหม่
              </Button>
              <div className="flex w-full min-w-0 flex-1 items-center justify-end gap-2 md:w-auto">
                <Input
                  placeholder="ค้นหาบิล ชื่อลูกค้า เลขที่บิล"
                  className="min-w-0 flex-1 md:max-w-xs font-normal tracking-widest"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button
                  type="button"
                  variant={selectMode ? "default" : "outline"}
                  className="shrink-0 font-normal tracking-widest"
                  onClick={() => (selectMode ? exitSelect() : setSelectMode(true))}
                >
                  {selectMode ? "เสร็จ" : "จัดการหลายบิล"}
                </Button>
              </div>
            </div>

            <div
              role="tablist"
              aria-label="กรองตามสถานะ"
              className="flex gap-2 overflow-x-auto pb-1"
            >
              {[
                ["", "ทั้งหมด"],
                ["pending", "รอโอน"],
                ["credit", "เครดิต"],
                ["overdue", "เลยกำหนด"],
                ["paid", "โอนแล้ว"],
                ["canceled", "ยกเลิก"],
              ].map(([value, label]) => [
                value,
                value && value !== "paid" && value !== "canceled" && counts[value as string]
                  ? `${label} ${counts[value as string]}`
                  : label,
              ]).map(([value, label]) => (
                <button
                  key={value || "all"}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === value}
                  onClick={() => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                  className={`min-h-9 shrink-0 rounded-full border px-4 text-sm ${
                    statusFilter === value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {isLoadingBills ? (
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                {/* มือถือ: การ์ด */}
                <ul className="flex flex-col gap-2.5 md:hidden">
                  {(billsData?.rows ?? []).length === 0 && (
                    <li className="py-8 text-center text-muted-foreground">ไม่มีบิล</li>
                  )}
                  {(billsData?.rows ?? []).map((b: Bill) => {
                    const on = selected.has(b._id);
                    return (
                      <li
                        key={b._id}
                        className={`flex items-start gap-3 rounded-2xl border p-3 ${on ? "border-blue-600 bg-blue-600/10" : "border-border/60 bg-background/40"}`}
                      >
                        {selectMode && (
                          <input
                            type="checkbox"
                            aria-label={`เลือกบิล ${b.billNumber}`}
                            checked={on}
                            onChange={() => toggle(b._id)}
                            className="mt-1 size-5 shrink-0 accent-blue-600"
                          />
                        )}
                        <button
                          type="button"
                          className="min-w-0 flex-1 text-left"
                          onClick={() =>
                            selectMode ? toggle(b._id) : router.push(`/bill/${b._id}` as any)
                          }
                        >
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-base">{b.name_customer || "-"}</span>
                            <b className="shrink-0 font-semibold">
                              {(b.total || 0).toLocaleString("th-TH", { maximumFractionDigits: 2 })}
                            </b>
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {b.billNumber} ·{" "}
                            {new Date(b.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                          </span>
                        </button>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <StatusMenu bill={b} organizationId={activeOrg?.id} />
                          {!selectMode && <ActionsMenu b={b} />}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {/* คอม: ตาราง */}
                <div className="hidden w-full overflow-x-auto md:block">
                  <DataTable columns={columns} data={billsData?.rows || []} />
                </div>
                {selectMode && selected.size > 0 && (
                  <div className="sticky bottom-3 z-30 flex flex-col gap-2 rounded-2xl border border-blue-600/60 bg-background/95 p-3 shadow-lg backdrop-blur md:flex-row md:items-center">
                    <span className="text-sm">
                      <b>เลือก {selected.size} บิล</b>
                      {(() => {
                        const sum = (billsData?.rows ?? [])
                          .filter((b: Bill) => selected.has(b._id))
                          .reduce((a: number, b: Bill) => a + (b.total || 0), 0);
                        return sum ? ` · ${sum.toLocaleString("th-TH", { maximumFractionDigits: 2 })} บาท` : "";
                      })()}
                    </span>
                    <span className="hidden flex-1 md:block" />
                    {confirmCancel ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-red-600 dark:text-red-300">ยกเลิก {selected.size} บิล?</span>
                        <Button
                          type="button"
                          variant="destructive"
                          disabled={setStatus.isPending}
                          onClick={() =>
                            setStatus.mutate({ ids: [...selected], status: "canceled" }, { onSuccess: exitSelect })
                          }
                        >
                          ยืนยันยกเลิก
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setConfirmCancel(false)}>
                          ไม่ใช่
                        </Button>
                      </div>
                    ) : (
                      <StatusChoices
                        layout="row"
                        disabled={setStatus.isPending}
                        onPick={(status, dueDate) =>
                          status === "canceled"
                            ? setConfirmCancel(true)
                            : setStatus.mutate({ ids: [...selected], status, dueDate }, { onSuccess: exitSelect })
                        }
                      />
                    )}
                  </div>
                )}
                <Paginations
                  totalItems={billsData?.meta?.total || 0}
                  itemsPerPage={billsData?.meta?.limit || 10}
                  currentPage={billsData?.meta?.page || 1}
                  onPageChange={(page) => {
                    setPage(page);
                  }}
                  onItemsPerPageChange={(limit) => {
                    setPageSize(limit);
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <DeleteBillDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        bill={selectedBill}
      />
      <ShowSubproDialog
        open={showSubproDialogOpen}
        onOpenChange={setShowSubproDialogOpen}
      />
    </>
  );
};

export default Bill;
