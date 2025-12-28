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
import { PlusCircleIcon } from "@phosphor-icons/react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import React, { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: string;
  costPrice: string;
  recommended: string;
  createdAt: string;
}

const ListProduct = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
          {row.original.price || "-"}
        </span>
      ),
    },
    {
      header: "ราคาต้นทุนสินค้า",
      accessorKey: "costPrice",
      size: 150,
      cell: ({ row }) => (
        <span className="text-sm font-medium text-left line-clamp-1">
          {row.original.costPrice || "-"}
        </span>
      ),
    },
    {
      header: "สินค้าแนะนำ",
      accessorKey: "recommended",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-medium text-left line-clamp-1">
          {row.original.recommended || "-"}
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
      header: "action",
      accessorKey: "",
      size: 100,
      cell: ({ row }) => (
        <span className="text-sm font-medium text-left line-clamp-1 hover:underline cursor-pointer"></span>
      ),
    },
  ];
  const data: Product[] = [
    {
      id: "1",
      name: " กุ้งขาวทะเลทะเลสด",
      price: "100",
      costPrice: "80",
      recommended: "Yes",
      createdAt: "2024-01-01",
    },
  ];
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
              >
                <PlusCircleIcon size={36} weight="bold" />
                เพิ่มสินค้าใหม่
              </Button>
              <Input
                value={""}
                onChange={() => {}}
                placeholder="ค้นหาสินค้า"
                className="max-w-xs"
              />
            </div>

            <div className="w-full overflow-x-auto">
              <DataTable columns={columns} data={data} />
            </div>
            <Paginations
              totalItems={0}
              itemsPerPage={10}
              currentPage={1}
              onPageChange={(page) => {
                setPage(page);
              }}
              onItemsPerPageChange={(limit) => {
                setPageSize(limit);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ListProduct;
