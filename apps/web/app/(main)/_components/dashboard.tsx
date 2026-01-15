"use client";
import React, { useState } from "react";
import StatsSummary from "./summary-stats";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { TrendUpIcon } from "@phosphor-icons/react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import { format } from "date-fns";
export const description = "A bar chart";
const Dashboard = () => {
  const { data: session } = authClient.useSession();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: new Date(),
  });

  const chartData = [
    { month: "January", desktop: 186 },
    { month: "February", desktop: 305 },
    { month: "March", desktop: 237 },
    { month: "April", desktop: 73 },
    { month: "May", desktop: 209 },
    { month: "June", desktop: 214 },
  ];
  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;
  console.log("dateRange", dateRange.from.toISOString());
  console.log("dateRange", dateRange.to.toISOString());
  return (
    <>
      <div className="flex  justify-between gap-4 mx-auto mb-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold tracking-widest  dark:text-zinc-300">
            ยินดีต้อนรับกลับ คุณ{session?.user?.name}
          </h1>
          <p className="text-base text-muted-foreground dark:text-zinc-300 tracking-widest mt-2">
            Dashboard สรุปข้อมูลร้านค้า
          </p>
        </div>

        <div className="flex flex-col mr-4">
          <CalendarDatePicker
            date={dateRange}
            onDateSelect={(range: { from: Date; to: Date }) => {
              setDateRange(range);
            }}
            variant="outline"
            className="cursor-pointer active:scale-95 transition-all duration-100"
          />
        </div>
      </div>
      <StatsSummary />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        {/* กราฟ Section */}
        <Card className="dark:bg-zinc-900 transition-colors col-span-2 h-auto">
          <CardHeader>
            <CardTitle className="tracking-wide text-2xl dark:text-zinc-300">
              กราฟยอดขาย
            </CardTitle>
            <CardDescription className="text-muted-foreground dark:text-zinc-300 tracking-wide">
              {format(dateRange.from, "dd MMMM yyyy")} -{" "}
              {format(dateRange.to, "dd MMMM yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium tracking-wide">
              ยอดขายรวมของปี 2024 <TrendUpIcon className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none tracking-wide">
              ยอดขายรวมของปี 2024 จำนวน 10,000 บาท
            </div>
          </CardFooter>
        </Card>

        {/* Right Side Cards */}
        <div className="flex flex-col gap-4">
          {/* Mass Product Card */}
          <Card className="dark:bg-zinc-900 transition-colors h-auto">
            <CardHeader>
              <CardTitle className="tracking-wide text-2xl dark:text-zinc-300">
                สินค้าขายดี
              </CardTitle>
              <CardDescription className="text-muted-foreground dark:text-zinc-300 tracking-wide">
                สินค้าที่ขายดีทั้งหมด 10 อันดับแรก
              </CardDescription>
            </CardHeader>
            <CardContent className="">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {[
                  { name: "เสื้อยืดคอกลม", stock: 150, price: "฿350" },
                  { name: "กางเกงยีนส์ขายาว", stock: 85, price: "฿890" },
                  { name: "รองเท้าผ้าใบ", stock: 45, price: "฿1,290" },
                  { name: "กระเป๋าสะพายหนัง", stock: 32, price: "฿1,850" },
                  { name: "หมวกแก๊ป", stock: 120, price: "฿250" },
                  { name: "ถุงเท้าคอตตอน", stock: 200, price: "฿99" },
                  { name: "เข็มขัดหนังแท้", stock: 68, price: "฿650" },
                  { name: "แจ็คเก็ตยีนส์", stock: 28, price: "฿1,490" },
                  { name: "กระโปรงยาว", stock: 55, price: "฿750" },
                  { name: "เสื้อเชิ้ตลายทาง", stock: 92, price: "฿590" },
                ].map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md  transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        คงเหลือ: {product.stock} ชิ้น
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-500">
                      {product.price}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mass Customer Card */}
          <Card className="dark:bg-zinc-900 transition-colors h-auto">
            <CardHeader>
              <CardTitle className="tracking-wide text-2xl dark:text-zinc-300">
                ลูกค้าซื้อสินค้ามาก
              </CardTitle>
              <CardDescription className="text-muted-foreground dark:text-zinc-300 tracking-wide">
                ลูกค้าที่ซื้อสินค้ามากทั้งหมด 10 อันดับแรก
              </CardDescription>
            </CardHeader>
            <CardContent className="">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {[
                  { name: "สมชาย ใจดี", purchases: 45, total: "฿125,500" },
                  { name: "วิไล สุขสันต์", purchases: 38, total: "฿98,750" },
                  { name: "ประยุทธ์ มั่นคง", purchases: 32, total: "฿87,200" },
                  { name: "นภา เจริญสุข", purchases: 28, total: "฿76,800" },
                  { name: "ธนาคาร รวยเงิน", purchases: 25, total: "฿68,500" },
                  { name: "อรอุมา สวยงาม", purchases: 22, total: "฿59,300" },
                  { name: "วีรพล ชัยชนะ", purchases: 19, total: "฿52,100" },
                ].map((customer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md  transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ซื้อ {customer.purchases} ครั้ง
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-blue-500">
                      {customer.total}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
