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
  InfoIcon,
  PushPinIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  isRecommended: boolean;
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

  const getProducts = async (
    page: number,
    pageSize: number,
    search: string
  ) => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      search,
      organizationId: activeOrg?.id ?? "",
    });
    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  };
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const togglePin = useMutation({
    mutationFn: async ({ id, on }: { id: string; on: boolean }) =>
      api.patch(`/products/${id}`, { isRecommended: on, updatedBy: session?.user?.id }),
    onSuccess: (_d, { on }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-recommended"] });
      toast.success(on ? "ปักหมุดแล้ว · ขึ้นในแถบเพิ่มด่วน" : "เลิกปักหมุดแล้ว");
    },
    onError: () => toast.error("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง"),
  });
  const columns: ColumnDef<Product>[] = [
    {
      header: "ชื่อสินค้า",
      accessorKey: "name",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1 hover:underline cursor-pointer">
          {row.original.name || "-"}
        </span>
      ),
    },
    {
      header: "ราคาสินค้า",
      accessorKey: "price",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {Number(row.original.price).toLocaleString("th-TH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,


          }) || "-"}
        </span>
      ),
    },
    {
      header: "ราคาต้นทุนสินค้า",
      accessorKey: "costPrice",
      size: 150,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          ฿{Number(row.original.cost).toLocaleString() || "-"}
        </span>
      ),
    },
    {
      header: "ปักหมุด",
      accessorKey: "isRecommended",
      size: 90,
      cell: ({ row }) => {
        const on = !!row.original.isRecommended;
        return (
          <button
            type="button"
            aria-pressed={on}
            aria-label={on ? `เลิกปักหมุด ${row.original.name}` : `ปักหมุด ${row.original.name}`}
            title={on ? "ขึ้นในแถบเพิ่มด่วน · กดเพื่อเลิกปัก" : "กดเพื่อให้ขึ้นในแถบเพิ่มด่วนตอนสร้างบิล"}
            disabled={togglePin.isPending}
            onClick={() => togglePin.mutate({ id: row.original._id, on: !on })}
            className={
              "grid size-10 place-items-center rounded-full border transition-transform active:scale-95 " +
              (on
                ? "border-indigo-500 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200"
                : "border-border text-muted-foreground hover:text-foreground")
            }
          >
            <PushPinIcon size={18} weight={on ? "fill" : "regular"} />
          </button>
        );
      },
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
      accessorKey: "",
      size: 150,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            className="cursor-pointer active:scale-95 duration-200 ease-in-out text-sm font-normal tracking-widest"
            onClick={() => {
              setSelectedProduct(row.original);
              setViewModalOpen(true);
            }}
          >
            <EyeIcon size={20} weight="bold" />
          </Button>
          <Button
            size="icon"
            className="cursor-pointer active:scale-95 duration-200 ease-in-out bg-[#ffc107] hover:bg-[#ffc107]/90 text-black text-sm font-normal tracking-widest"
            onClick={() => {
              setSelectedProduct(row.original);
              setEditModalOpen(true);
            }}
          >
            <PencilIcon size={20} weight="bold" />
          </Button>

          <Button
            size="icon"
            className="cursor-pointer active:scale-95 duration-200 ease-in-out bg-red-600 hover:bg-red-600/90 text-sm font-normal tracking-widest"
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
    queryKey: ["products", activeOrg?.id, debouncedSearch, page, pageSize],
    queryFn: () => getProducts(page, pageSize, debouncedSearch),
    enabled: !!activeOrg?.id,
  });
  return (
    <>
      <div className="flex justify-center items-center min-w-full ">
        <Card className="shadow-2xl rounded-2xl w-full  dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-2xl font-normal tracking-widest">สินค้า</CardTitle>
            <CardDescription className="text-base font-normal tracking-widest">
              รายชื่อสินค้าทั้งหมดในระบบ
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col  gap-4  w-full">
            <div
              role="note"
              className="flex items-start gap-3 rounded-2xl border border-indigo-300/60 bg-indigo-50/70 p-4 dark:border-indigo-500/30 dark:bg-indigo-950/40"
            >
              <InfoIcon size={22} weight="duotone" className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-300" />
              <div className="flex flex-col gap-1 text-sm leading-relaxed">
                <span className="font-medium text-foreground">ไม่ต้องเพิ่มสินค้าเองล่วงหน้า ระบบจำให้อัตโนมัติ</span>
                <span className="text-muted-foreground">
                  สินค้าที่พิมพ์ลงบิล จะถูกบันทึกในหน้านี้ให้เอง พร้อมราคาที่ใช้ครั้งล่าสุด บิลถัดไปเลือกชื่อเดิม ราคาขึ้นให้ทันที
                </span>
                <span className="text-muted-foreground">
                  กด <PushPinIcon size={14} weight="fill" className="inline align-[-2px] text-indigo-600 dark:text-indigo-300" /> หน้าสินค้าที่ขายบ่อย เพื่อให้ขึ้นในแถบ "เพิ่มด่วน" ตอนสร้างบิล
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <Button
                size="lg"
                className="cursor-pointer active:scale-95 duration-200 ease-in-out text-sm font-normal tracking-widest"
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
