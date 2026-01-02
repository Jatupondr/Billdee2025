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
import CreateCustomerModal from "./create-customer-modal";
import ViewCustomerModal from "./view-customer-modal";
import EditCustomerModal from "./edit-customer-modal";
import DeleteCustomerDialog from "./delete-customer-dialog";

interface Customer {
  _id: string;
  name: string;
  typeCustomer: string;
  organizationId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const Customer = () => {
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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const getProducts = async (
    page: number,
    pageSize: number,
    search: string
  ) => {
    const response = await api.get(
      `/customers?page=${page}&pageSize=${pageSize}&search=${search}&organizationId=${activeOrg?.id}&typeCustomer=customer`
    );
    return response.data;
  };
  const columns: ColumnDef<Customer>[] = [
    {
      header: "ชื่อลูกค้า",
      accessorKey: "name",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-medium text-left line-clamp-1 hover:underline cursor-pointer">
          {row.original.name || "-"}
        </span>
      ),
    },
    {
      header: "ประเภทลูกค้า",
      accessorKey: "typeCustomer",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-medium text-left line-clamp-1 tracking-wider">
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
        <span className="text-sm font-medium text-left line-clamp-1">
          {format(new Date(row.original.createdAt), "dd/MM/yyyy") || "-"}
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
              setSelectedCustomer(row.original);
              setViewModalOpen(true);
            }}
          >
            <EyeIcon size={20} weight="bold" />
          </Button>
          <Button
            size="icon"
            className="cursor-pointer active:scale-95 duration-200 ease-in-out bg-[#ffc107] hover:bg-[#ffc107]/90 text-black"
            onClick={() => {
              setSelectedCustomer(row.original);
              setEditModalOpen(true);
            }}
          >
            <PencilIcon size={20} weight="bold" />
          </Button>

          <Button
            size="icon"
            className="cursor-pointer active:scale-95 duration-200 ease-in-out bg-red-600 hover:bg-red-600/90"
            onClick={() => {
              setSelectedCustomer(row.original);
              setDeleteDialogOpen(true);
            }}
          >
            <TrashIcon size={20} weight="bold" />
          </Button>
        </div>
      ),
    },
  ];

  const { data: customersData, isLoading } = useQuery<any>({
    queryKey: ["customers", debouncedSearch, page, pageSize],
    queryFn: () => getProducts(page, pageSize, debouncedSearch),
  });
  return (
    <>
      <div className="flex justify-center items-center min-w-full ">
        <Card className="shadow-2xl rounded-2xl w-full ">
          <CardHeader>
            <CardTitle className="text-2xl tracking-widest">ลูกค้า</CardTitle>
            <CardDescription className="text-base tracking-wider">
              รายชื่อลูกค้าทั้งหมดในระบบ
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col  gap-4  w-full">
            <div className="flex justify-between items-center">
              <Button
                size="lg"
                className="cursor-pointer active:scale-95 duration-200 ease-in-out"
                onClick={() => setCreateModalOpen(true)}
              >
                <PlusCircleIcon size={36} weight="bold" />
                เพิ่มลูกค้าใหม่
              </Button>
              <Input
                placeholder="ค้นหาลูกค้า"
                className="max-w-xs"
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
                    data={customersData?.rows || []}
                  />
                </div>
                <Paginations
                  totalItems={customersData?.meta?.total || 0}
                  itemsPerPage={customersData?.meta?.limit || 10}
                  currentPage={customersData?.meta?.page || 1}
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

      <CreateCustomerModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      <ViewCustomerModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        customer={selectedCustomer}
      />

      <EditCustomerModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        customer={selectedCustomer}
      />

      <DeleteCustomerDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        customer={selectedCustomer}
      />
    </>
  );
};

export default Customer;
