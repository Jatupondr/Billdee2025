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

interface ViewBillProps {
  id: string;
}

const ViewBill = ({ id }: ViewBillProps) => {
  const router = useRouter();

  const getBillById = async (billId: string) => {
    const response = await api.get(`/bills/${billId}`);
    return response.data;
  };

  const { data: billData, isLoading } = useQuery<any>({
    queryKey: ["bill", id],
    queryFn: () => getBillById(id),
    enabled: !!id,
  });

  const ListTable = [
    "ลำดับ",
    "ชื่อรายการ",
    "จำนวน",
    "ต้นทุน",
    "ราคา",
    "ราคารวม",
  ] as const;

  if (isLoading) {
    return (
      <Card className="p-4 shadow-md border border-border/50 dark:bg-zinc-900">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!billData) {
    return (
      <Card className="p-4 shadow-md border border-border/50 dark:bg-zinc-900">
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">ไม่พบข้อมูลบิล</p>
        </CardContent>
      </Card>
    );
  }

  const bill = billData.data;

  return (
    <Card className="p-4 shadow-md border border-border/50 dark:bg-zinc-900">
      <CardHeader>
        <CardTitle className="text-2xl  font-normal tracking-widest">
          รายละเอียดบิล #{bill.billNumber}
        </CardTitle>
        <CardDescription className=" font-normal tracking-widest">
          ข้อมูลบิลฉบับนี้
        </CardDescription>
        <CardAction className="space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
            onClick={() => router.push("/bill")}
          >
            <BackspaceIcon size={32} weight="fill" />
            ย้อนกลับ
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="whitespace-nowrap cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
            onClick={() => router.push(`/bill/${id}/edit`)}
          >
            <PencilSimpleIcon size={32} weight="fill" />
            แก้ไขบิล
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ข้อมูลทั่วไป */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-normal tracking-widest text-muted-foreground">
                วันที่ออกบิล:
              </span>
              <span className="text-base font-normal tracking-widest">
                {new Date(bill.date).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* ข้อมูลลูกค้า */}
        <Card className="border border-border/50 bg-accent/20">
          <CardContent className="">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-normal tracking-widest text-muted-foreground">
                    ชื่อลูกค้า:
                  </span>
                  <span className="text-base font-normal tracking-widest">
                    {bill.name_customer}
                  </span>
                </div>
                {bill.phone_customer && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-normal tracking-widest text-muted-foreground">
                      เบอร์โทร:
                    </span>
                    <span className="text-sm font-normal tracking-widest">{bill.phone_customer}</span>
                  </div>
                )}
                {bill.address_customer && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-normal tracking-widest text-muted-foreground">
                      ที่อยู่:
                    </span>
                    <span className="text-sm font-normal tracking-widest">{bill.address_customer}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ตารางสินค้า */}
        <Table>
          <TableHeader className="bg-zinc-100 dark:bg-zinc-600">
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
            {bill.products && bill.products.length > 0 ? (
              bill.products.map((product: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-normal w-20 text-center text-base">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-normal tracking-widest text-base">
                    {product.name}
                    {product.note && (
                      <div className="text-sm font-normal tracking-widest text-muted-foreground mt-1">
                        {product.note}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="w-28 text-center font-normal tracking-widest    ">
                    {product.quantity}
                  </TableCell>
                  <TableCell className="w-28 text-right font-normal tracking-widest    ">
                    {(product.cost).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                  </TableCell>
                  <TableCell className="w-32 text-right font-normal tracking-widest    ">
                    {product.price?.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                  </TableCell>
                  <TableCell className="w-32 text-right font-normal tracking-widest    ">
                    {product.total?.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground font-normal tracking-widest    "
                >
                  ไม่มีสินค้า
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* หมายเหตุและสรุปยอด */}
        <div className="flex justify-between mt-4">
          <div className="space-y-1">
            {bill.note && (
              <div className="space-y-2">
                <span className="text-sm font-normal tracking-widest text-muted-foreground">
                  หมายเหตุ:
                </span>
                <p className="text-sm font-normal tracking-widest">{bill.note}</p>
              </div>
            )}
          </div>
          <div className="w-96 space-y-3 border rounded-lg p-4 bg-accent/30">
            <div className="flex justify-between items-center">
              <span className="text-sm  font-normal tracking-widest">ยอดรวมก่อนส่วนลด</span>
              <span className="text-base font-normal tracking-widest">
                {(
                  (bill.total || 0) +
                  (bill.discount || 0) -
                  (bill.vat || 0)
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-normal tracking-widest">
                ส่วนลด ({bill.discountPercent || 0}%)
              </span>
              <span className="text-base font-normal tracking-widest">
                {(bill.discount || 0).toFixed(2)}
              </span>
            </div>

            {bill.includeVat && (
              <div className="flex justify-between items-center">
                <span className="text-sm  font-normal tracking-widest text-muted-foreground">
                  ภาษีมูลค่าเพิ่ม ({bill.taxPercent || 7}%)
                </span>
                <span className="text-base font-normal tracking-widest">
                  {(bill.vat || 0).toFixed(2)}
                </span>
              </div>
            )}

            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-base font-normal tracking-widest">
                รวมสุทธิ
              </span>
              <span className="text-xl font-normal tracking-widest">
                {(bill.total || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewBill;
