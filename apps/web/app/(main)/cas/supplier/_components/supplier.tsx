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
import { Skeleton } from "@/components/ui/skeleton";
import {
  EyeIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { authClient } from "@/lib/auth-client";
import api from "@/hooks/axios";
import CreateSupplierModal from "./create-supplier-modal";
import ViewSupplierModal from "./view-supplier-modal";
import EditSupplierModal from "./edit-supplier-modal";
import DeleteSupplierDialog from "./delete-supplier-dialog";

interface Supplier {
  _id: string;
  name: string;
  typeCustomer: string;
  organizationId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const Supplier = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { data: activeOrg, isPending } = authClient.useActiveOrganization();

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );

  const getProducts = async (
    page: number,
    pageSize: number,
    search: string
  ) => {
    const response = await api.get(
      `/customers?page=${page}&pageSize=${pageSize}&search=${search}&organizationId=${activeOrg?.id}&typeCustomer=supplier`
    );
    return response.data;
  };
  const columns: ColumnDef<Supplier>[] = [
    {
      header: "ชื่อซัพพลายเออร์",
      accessorKey: "name",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1 hover:underline cursor-pointer">
          {row.original.name || "-"}
        </span>
      ),
    },
    {
      header: "ประเภทลูกค้า",
      accessorKey: "typeCustomer",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {row.original.typeCustomer === "customer" ? "ลูกค้า" : "ซัพพลายเออร์"}
        </span>
      ),
    },

    // {
    //   header: "สินค้าแนะนำ",
    //   accessorKey: "recommended",
    //   size: 120,
    //   cell: ({ row }) => (
    //     <span className="text-sm font-medium text-left line-clamp-1">
    //       {row.original.recommended ? "✓" : "-"}
    //     </span>
    //   ),
    // },
    {
      header: "วันที่สร้าง",
      accessorKey: "createdAt",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {new Date(row.original.createdAt).toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }) || "-"}
        </span>
      ),
    },
    {
      header: "วันที่แก้ไขล่าสุด",
      accessorKey: "updatedAt",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {new Date(row.original.updatedAt).toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "long",
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
          <Button
            size="icon"
            variant="outline"
            className="cursor-pointer active:scale-95 duration-200 ease-in-out"
            onClick={() => {
              setSelectedSupplier(row.original);
              setViewModalOpen(true);
            }}
          >
            <EyeIcon size={20} weight="bold" />
          </Button>
          <Button
            size="icon"
            className="cursor-pointer active:scale-95 duration-200 ease-in-out bg-[#ffc107] hover:bg-[#ffc107]/90 text-black"
            onClick={() => {
              setSelectedSupplier(row.original);
              setEditModalOpen(true);
            }}
          >
            <PencilIcon size={20} weight="bold" />
          </Button>

          <Button
            size="icon"
            className="cursor-pointer active:scale-95 duration-200 ease-in-out bg-red-600 hover:bg-red-600/90"
            onClick={() => {
              setSelectedSupplier(row.original);
              setDeleteDialogOpen(true);
            }}
          >
            <TrashIcon size={20} weight="bold" />
          </Button>
        </div>
      ),
    },
  ];

  const { data: suppliersData, isLoading } = useQuery<any>({
    queryKey: ["suppliers", debouncedSearch, page, pageSize],
    queryFn: () => getProducts(page, pageSize, debouncedSearch),
  });
  return (
    <>
      <div className="flex justify-center items-center min-w-full ">
        <Card className="shadow-2xl rounded-2xl w-full dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-2xl font-normal tracking-widest">
              ซัพพลายเออร์
            </CardTitle>
            <CardDescription className="text-base font-normal tracking-widest">
              รายชื่อซัพพลายเออร์ทั้งหมดในระบบ
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col  gap-4  w-full">
            <div className="flex justify-between items-center">
              <Button
                size="lg"
                className="cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
                onClick={() => setCreateModalOpen(true)}
              >
                <PlusCircleIcon size={36} weight="bold" />
                เพิ่มซัพพลายเออร์ใหม่
              </Button>
              <Input
                placeholder="ค้นหาซัพพลายเออร์"
                className="max-w-xs font-normal tracking-widest"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="w-full overflow-x-auto">
                  <DataTable
                    columns={columns}
                    data={suppliersData?.rows || []}
                  />
                </div>
                <Paginations
                  totalItems={suppliersData?.meta?.total || 0}
                  itemsPerPage={suppliersData?.meta?.limit || 10}
                  currentPage={suppliersData?.meta?.page || 1}
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

      <CreateSupplierModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      <ViewSupplierModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        supplier={selectedSupplier}
      />

      <EditSupplierModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        supplier={selectedSupplier}
      />

      <DeleteSupplierDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        supplier={selectedSupplier}
      />
    </>
  );
};

export default Supplier;
