"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from "@/components/ui/card";
import api from "@/hooks/axios";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { format } from "date-fns";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

interface MassCustomerProps {
  startDate: string;
  endDate: string;
  organizationId: string;
}

const MassCustomer = ({
  startDate,
  endDate,
  organizationId,
}: MassCustomerProps) => {
  const getMassCustomer = async (from: string, to: string) => {
    const response = await api.get(
      `/overview/summary/customer?startDate=${startDate}&endDate=${endDate}&organizationId=${organizationId}`
    );
    return response.data;
  };
  const { data: massCustomer } = useQuery({
    queryKey: ["mass-customer", startDate, endDate],
    queryFn: () => getMassCustomer(startDate, endDate),
  });

  if (massCustomer?.data?.length === 0) {
    return (
      <Card className="dark:bg-zinc-900 transition-colors col-span-2 h-auto">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MagnifyingGlassIcon size={40} />
            </EmptyMedia>
            <EmptyTitle>ไม่พบข้อมูล</EmptyTitle>
            <EmptyDescription>
              ไม่พบข้อมูลลูกค้าซื้อสินค้า {format(startDate, "dd/MM/yyyy")} -{" "}
              {format(endDate, "dd/MM/yyyy")}
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
            ยอดซื้อสินค้าของลูกค้า
          </CardTitle>
          <CardDescription className="text-muted-foreground dark:text-zinc-300 font-normal tracking-widest">
            ยอดซื้อสินค้าของลูกค้าทั้งหมด 10 อันดับแรก
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {massCustomer?.data.map((customer: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-1 rounded-md  transition-colors cursor-pointer"
              >
                <div className="flex-1">
                  <p className="text-base font-normal tracking-widest">
                    {customer.customerName}
                  </p>
                  <p className="text-sm text-muted-foreground tracking-widest font-normal">
                    ซื้อ {customer.count} ครั้ง
                  </p>
                </div>
                <span className="text-base font-normal text-blue-500 tracking-widest">
                  {customer.totalAmount.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  {""} บาท
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default MassCustomer;
