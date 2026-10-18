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
import ShowSubproDialog from "./show-subpro-dialog";
import { downloadReceiptImage } from "@/lib/receipt-image";
import { toast } from "sonner";

interface Bill {
  _id: string;
  billNumber: string;
  name_customer: string;
  total: number;
  status: string;
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
  const { data: session, isPending: isLoadingSession } =
    authClient.useSession();

  const getBills = async (page: number, pageSize: number, search: string) => {
    const response = await api.get(
      `/bills?page=${page}&pageSize=${pageSize}&search=${search}&organizationId=${activeOrg?.id}`,
    );
    return response.data;
  };

  const columns: ColumnDef<Bill>[] = [
    {
      header: "เลขที่บิล",
      accessorKey: "billNumber",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {row.original.billNumber || "-"}
        </span>
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
      size: 150,
      cell: ({ row }) => (
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
                      `${process.env.NEXT_PUBLIC_API_URL}/report/receipt/${row.original._id}`,
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
                        row.original._id,
                        row.original.billNumber,
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
                  onClick={() => {
                    router.push(`/bill/${row.original._id}` as any);
                  }}
                  className="text-zinc-900 dark:text-zinc-300 cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
                >
                  <EyeIcon size={20} weight="bold" />
                  ดูรายละเอียดบิล
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    router.push(`/bill/${row.original._id}/edit`);
                  }}
                  className="text-zinc-900 dark:text-zinc-300 cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
                >
                  <PencilIcon size={20} weight="bold" />
                  แก้ไขบิล
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedBill(row.original);
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
      ),
    },
  ];

  const { data: billsData, isLoading: isLoadingBills } = useQuery<any>({
    queryKey: ["bills", debouncedSearch, page, pageSize],
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
            <div className="flex justify-between items-center">
              <Button
                size="lg"
                className="cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
                onClick={() => handleCreateBill()}
              >
                <PlusCircleIcon size={36} weight="bold" />
                สร้างบิลใหม่
              </Button>
              <Input
                placeholder="ค้นหาบิล ชื่อลูกค้า เลขที่บิล"
                className="max-w-xs font-normal tracking-widest"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
                <div className="w-full overflow-x-auto">
                  <DataTable columns={columns} data={billsData?.rows || []} />
                </div>
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
