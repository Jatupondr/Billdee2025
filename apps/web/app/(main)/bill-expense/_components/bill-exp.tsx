"use client";
import { DataTable } from "@/components/data-table";
import Paginations from "@/components/pagination";
import { Button } from "@/components/ui/button";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Card,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { PencilIcon, PlusCircleIcon, EyeIcon, TrashIcon } from "@phosphor-icons/react";
import { ColumnDef } from "@tanstack/react-table";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import api from "@/hooks/axios";
import { useQuery } from "@tanstack/react-query";
import DeleteBillExpDialog from "./delete-bill-exp-dialog";
const BillExpense = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 500);
  const { data: activeOrg, isPending } = authClient.useActiveOrganization();
  const [selectedBillExp, setSelectedBillExp] = useState<any>(null);
  const getBills = async (page: number, pageSize: number, search: string) => {
    const response = await api.get(
      `/exp?page=${page}&pageSize=${pageSize}&search=${search}&organizationId=${activeOrg?.id}`,
    );
    return response.data;
  };

  const { data: billsExpenseData, isLoading } = useQuery<any>({
    queryKey: ["bills-expense", debouncedSearch, page, pageSize],
    queryFn: () => getBills(page, pageSize, debouncedSearch),
    enabled: !!activeOrg?.id,
  });


  const columns: ColumnDef<any>[] = [
    {
      header: "เลขที่บิล",
      accessorKey: "billExpenseNumber",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {row.original.billExpenseNumber || "-"}
        </span>
      ),
    },
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
      header: "ชื่อซัพลายเออร์/ผู้รับเงิน",
      accessorKey: "name",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {row.original.customerId?.name || "-"}
        </span>
      ),
    },
    {
      header: "ยอดรวม",
      accessorKey: "total",
      size: 120,
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
      header: "วันที่สร้าง",
      accessorKey: "createdAt",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {new Date(row.original.createdAt).toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }) || "-"}
        </span>
      ),
    },

    {
      header: "จัดการ",
      accessorKey: "action",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer active:scale-95 duration-200 ease-in-out"
            onClick={() => router.push(`/bill-expense/${row.original._id}`)}
          >
            <EyeIcon size={18} weight="duotone" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer active:scale-95 duration-200 ease-in-out"
            onClick={() =>
              router.push(`/bill-expense/${row.original._id}/edit`)
            }
          >
            <PencilIcon size={18} weight="duotone" />
          </Button>

          <Button
            variant="destructive"
            size="icon"
            className="cursor-pointer active:scale-95 duration-200 ease-in-out"
            onClick={() => {
              setDeleteDialogOpen(true);
              setSelectedBillExp(row.original);
            }
            }
          >
            <TrashIcon size={18} weight="duotone" />
          </Button>

        </div >
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-center items-center min-w-full">
        <Card className="shadow-2xl rounded-2xl w-full dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-2xl  font-normal tracking-widest">
              รายการบิลค่าใช้จ่าย
            </CardTitle>
            <CardDescription className="text-base  font-normal tracking-widest">
              รายการบิลค่าใช้จ่ายทั้งหมดในระบบ
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 w-full">
            <div className="flex justify-between items-center">
              <Button
                size="lg"
                className="cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
                onClick={() => router.push("/bill-expense/create")}
              >
                <PlusCircleIcon size={36} weight="bold" />
                สร้างบิลค่าใช้จ่าย
              </Button>
              <Input
                placeholder="ค้นหาบิลค่าใช้จ่าย"
                className="max-w-xs font-normal tracking-widest"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="w-full overflow-x-auto">
              <DataTable
                columns={columns}
                data={billsExpenseData?.rows || []}
              />
            </div>
            <Paginations
              totalItems={billsExpenseData?.meta?.total || 0}
              itemsPerPage={billsExpenseData?.meta?.pageSize || 10}
              currentPage={billsExpenseData?.meta?.page || 1}
              onPageChange={(page) => {
                setPage(page);
              }}
              onItemsPerPageChange={(limit) => {
                setPageSize(limit);
              }}
            />
          </CardContent>
        </Card>
        <DeleteBillExpDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          billExp={selectedBillExp}
        />
      </div>
    </>
  );
};

export default BillExpense;
