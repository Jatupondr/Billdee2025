"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { BackspaceIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import api from "@/hooks/axios";
import { useRouter } from "next/navigation";

interface ViewBillExpProps {
  id: string;
}

const ViewBillExp = ({ id }: ViewBillExpProps) => {
  const router = useRouter();

  const getBillExpenseById = async (billId: string) => {
    const response = await api.get(`/exp/${billId}`);
    return response.data;
  };

  const { data: billExpenseData, isLoading } = useQuery<any>({
    queryKey: ["bill-expense", id],
    queryFn: () => getBillExpenseById(id),
    enabled: !!id,
  });
  console.log("billExpenseData", billExpenseData);

  const ListTable = ["ลำดับ", "ชื่อรายการ", "จำนวน", "ราคา", "ราคารวม"];

  if (isLoading) {
    return (
      <Card className="p-4 shadow-md border border-border/50 dark:bg-zinc-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-1/2" />
            <Skeleton className="h-64 w-full" />
            <div className="flex justify-end">
              <Skeleton className="h-32 w-64" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!billExpenseData?.data) {
    return (
      <Card className="p-4 shadow-md border border-border/50 dark:bg-zinc-900">
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground font-normal tracking-widest">
              ไม่พบข้อมูลบิลค่าใช้จ่าย
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const billExp = billExpenseData?.data;
  const subtotal =
    billExp.items?.reduce(
      (sum: number, item: any) => sum + (item.total || 0),
      0,
    ) || 0;

  return (
    <>
      <Card className="p-4 shadow-md border border-border/50 dark:bg-zinc-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-normal tracking-widest">
                บิลค่าใช้จ่าย #{billExp.billExpenseNumber}
              </CardTitle>
              <CardDescription className="font-normal tracking-widest">
                ข้อมูลรายละเอียดของบิลค่าใช้จ่าย
              </CardDescription>
            </div>
            <CardAction className="space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
                onClick={() => router.push("/bill-expense")}
              >
                <BackspaceIcon size={32} weight="fill" />
                ย้อนกลับ
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
                onClick={() => router.push(`/bill-expense/${id}/edit`)}
              >
                <PencilSimpleIcon size={32} weight="fill" />
                แก้ไข
              </Button>
            </CardAction>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* ข้อมูลทั่วไป */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-normal tracking-widest text-muted-foreground">
                  ซัพลายเออร์/ผู้รับเงิน
                </label>
                <p className="text-base font-normal tracking-widest">
                  {billExp.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-normal tracking-widest text-muted-foreground">
                  วันที่
                </label>
                <p className="text-base font-normal tracking-widest">
                  {new Date(billExp.date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              {billExp.description && (
                <div>
                  <label className="text-sm font-normal tracking-widest text-muted-foreground">
                    รายละเอียด
                  </label>
                  <p className="text-base font-normal tracking-widest bg-accent/20 p-3 rounded-lg border border-border/50">
                    {billExp.description}
                  </p>
                </div>
              )}
            </div>

            {/* ตารางรายการ */}
            <Table>
              <TableHeader className="bg-accent">
                <TableRow>
                  {ListTable.map((header, idx: number) => (
                    <TableHead
                      className="text-base font-normal tracking-widest leading-4"
                      key={idx}
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {billExp.items && billExp.items.length > 0 ? (
                  billExp.items.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-normal tracking-widest w-20 text-center text-base">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-normal tracking-widest w-full text-base">
                        {item.name}
                      </TableCell>
                      <TableCell className="font-normal tracking-widest w-28 text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="font-normal tracking-widest w-32 text-right">
                        {(item.price || 0).toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="font-normal tracking-widest w-32 text-right">
                        {(item.total || 0).toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center font-normal tracking-widest text-muted-foreground"
                    >
                      ไม่มีรายการ
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* สรุปยอด */}
            <div className="flex justify-end mt-4">
              <Card className="border border-border/50 bg-accent/20">
                <CardContent className="p-4">
                  <div className="space-y-2 min-w-[200px]">
                    <div className="flex justify-between">
                      <span className="text-lg font-normal tracking-widest">
                        ยอดรวม:
                      </span>
                      <span className="text-lg font-normal tracking-widest text-primary">
                        {subtotal.toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} บาท
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ViewBillExp;
