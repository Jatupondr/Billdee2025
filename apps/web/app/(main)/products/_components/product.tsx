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
import api from "@/hooks/axios";
import { authClient } from "@/lib/auth-client";
import CreateProductModal from "./create-product-modal";
import EditProductModal from "./edit-product-modal";
import ViewProductModal from "./view-product-modal";
import DeleteProductDialog from "./delete-product-dialog";

interface Product {
  _id: string;
  name: string;
  price: number;
  cost: number;
  description: string;
  recommended: boolean;
  createdAt: string;
  updatedAt: string;
}

const ListProduct = () => {
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  console.log(activeOrg);

  const getProducts = async (
    page: number,
    pageSize: number,
    search: string
  ) => {
    const response = await api.get(
      `/products?page=${page}&pageSize=${pageSize}&search=${search}&organizationId=${activeOrg?.id}`
    );
    return response.data;
  };
  const columns: ColumnDef<Product>[] = [
    {
      header: "ชื่อสินค้า",
      accessorKey: "name",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-medium text-left line-clamp-1 hover:underline cursor-pointer">
          {row.original.name || "-"}
        </span>
      ),
    },
    {
      header: "ราคาสินค้า",
      accessorKey: "price",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-medium text-left line-clamp-1">
          ฿{Number(row.original.price).toLocaleString() || "-"}
        </span>
      ),
    },
    {
      header: "ราคาต้นทุนสินค้า",
      accessorKey: "costPrice",
      size: 150,
      cell: ({ row }) => (
        <span className="text-sm font-medium text-left line-clamp-1">
          ฿{Number(row.original.cost).toLocaleString() || "-"}
        </span>
      ),
    },
    {
      header: "สินค้าแนะนำ",
      accessorKey: "recommended",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-medium text-left line-clamp-1">
          {row.original.recommended ? "✓" : "-"}
        </span>
      ),
    },
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
              setSelectedProduct(row.original);
              setViewModalOpen(true);
            }}
          >
            <EyeIcon size={20} weight="bold" />
          </Button>
          <Button
            size="icon"
            className="cursor-pointer active:scale-95 duration-200 ease-in-out bg-[#ffc107] hover:bg-[#ffc107]/90 text-black"
            onClick={() => {
              setSelectedProduct(row.original);
              setEditModalOpen(true);
            }}
          >
            <PencilIcon size={20} weight="bold" />
          </Button>

          <Button
            size="icon"
            className="cursor-pointer active:scale-95 duration-200 ease-in-out bg-red-600 hover:bg-red-600/90"
            onClick={() => {
              setSelectedProduct(row.original);
              setDeleteDialogOpen(true);
            }}
          >
            <TrashIcon size={20} weight="bold" />
          </Button>
        </div>
      ),
    },
  ];

  const { data: productsData, isLoading } = useQuery<any>({
    queryKey: ["products", debouncedSearch, page, pageSize],
    queryFn: () => getProducts(page, pageSize, debouncedSearch),
  });
  return (
    <>
      <div className="flex justify-center items-center min-w-full ">
        <Card className="shadow-2xl rounded-2xl w-full ">
          <CardHeader>
            <CardTitle className="text-2xl tracking-widest">สินค้า</CardTitle>
            <CardDescription className="text-base tracking-wider">
              List of products available.
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
                เพิ่มสินค้าใหม่
              </Button>
              <Input
                placeholder="ค้นหาสินค้า"
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
                    data={productsData?.rows || []}
                  />
                </div>
                <Paginations
                  totalItems={productsData?.meta?.total || 0}
                  itemsPerPage={productsData?.meta?.limit || 10}
                  currentPage={productsData?.meta?.page || 1}
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

      {/* Modals and Dialogs */}
      <CreateProductModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
      <EditProductModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        product={selectedProduct}
      />
      <ViewProductModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        product={selectedProduct}
      />
      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        product={selectedProduct}
      />
    </>
  );
};

export default ListProduct;
