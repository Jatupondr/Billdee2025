"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from "@/components/ui/card";
import api from "@/hooks/axios";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
interface MassProductProps {
  startDate: string;
  endDate: string;
  organizationId: string;
}

const MassProduct = ({
  startDate,
  endDate,
  organizationId,
}: MassProductProps) => {
  const getMassProduct = async (from: string, to: string) => {
    const response = await api.get(
      `/overview/summary/product?startDate=${startDate}&endDate=${endDate}&organizationId=${organizationId}`
    );
    return response.data;
  };
  const { data: massProduct } = useQuery({
    queryKey: ["mass-product", startDate, endDate],
    queryFn: () => getMassProduct(startDate, endDate),
  });

  if (massProduct?.data?.length === 0) {
    return (
      <Card className="dark:bg-zinc-900 transition-colors col-span-2 h-auto">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MagnifyingGlassIcon size={40} />
            </EmptyMedia>
            <EmptyTitle className="font-normal tracking-widest dark:text-zinc-300 dark:bg-zinc-900">ไม่พบข้อมูล</EmptyTitle>
            <EmptyDescription className="font-normal tracking-widest dark:text-zinc-300 dark:bg-zinc-900">


{new Date(startDate).toLocaleDateString("th-TH", { day: "2-digit", month: "long", year: "numeric" })} - {new Date(endDate).toLocaleDateString("th-TH", { day: "2-digit", month: "long", year: "numeric" })}



            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent></EmptyContent>
        </Empty>
      </Card>
    );
  }
  return (
    <>
      <Card className="dark:bg-zinc-900 transition-colors h-auto">
        <CardHeader>
          <CardTitle className="font-normal tracking-widest text-2xl dark:text-zinc-300">
            สินค้าขายดี
          </CardTitle>
          <CardDescription className="text-muted-foreground dark:text-zinc-300 font-normal tracking-widest">
            สินค้าที่ขายดีทั้งหมด 10 อันดับแรก
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {massProduct?.data.map((product: any, index: number) => (
              <>
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-md  transition-colors cursor-pointer"
                >
                  <div className="flex-1 space-x-2">
                    <h1 className="text-base font-normal tracking-widest">
                      {product.productName}
                    </h1>
                    <p className="text-sm text-muted-foreground tracking-widest font-normal">
                      ขาย: {product.count} ครั้ง
                    </p>
                    <p className="text-xs text-muted-foreground tracking-widest font-normal">
                      จำนวนที่ขาย: {product.totalQuantity}
                    </p>
                  </div>
                  <span className="text-base font-normal text-emerald-500 tracking-widest">
                    {product.totalSales.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    {""} บาท
                  </span>
                </div>
                <Separator />
              </>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default MassProduct;
