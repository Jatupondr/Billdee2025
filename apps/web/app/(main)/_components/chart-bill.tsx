"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { MagnifyingGlassIcon, TrendUpIcon } from "@phosphor-icons/react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import api from "@/hooks/axios";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface ChartBillProps {
  startDate: string;
  endDate: string;
  organizationId: string;
}
const ChartBill = ({ startDate, endDate, organizationId }: ChartBillProps) => {
  const diffTime = new Date(endDate).getTime() - new Date(startDate).getTime();

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const getChartBill = async (
    startDate: string,
    endDate: string,
    organizationId: string
  ) => {
    const response = await api.get(
      `/overview/summary/chart?startDate=${startDate}&endDate=${endDate}&organizationId=${organizationId}&type=${diffDays > 7 ? "month" : "day"}`
    );
    return response.data;
  };
  const { data: chartData } = useQuery({
    queryKey: ["chart-bill", startDate, endDate, organizationId],
    queryFn: () => getChartBill(startDate, endDate, organizationId),
  });
  const chartConfig = {
    total: {
      label: "ยอดขาย",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  if (chartData?.data?.length === 0) {
    return (
      <Card className="dark:bg-zinc-900 transition-colors col-span-2 h-auto">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MagnifyingGlassIcon size={40} />
            </EmptyMedia>
            <EmptyTitle>ไม่พบข้อมูล</EmptyTitle>
            <EmptyDescription>
              ไม่พบข้อมูลกราฟยอดขาย {format(startDate, "dd/MM/yyyy")} -{" "}
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
      <Card className="dark:bg-zinc-900 transition-colors col-span-2 h-auto">
        <CardHeader>
          <CardTitle className="tracking-widest font-normal text-2xl dark:text-zinc-300">
            กราฟยอดขาย {diffDays}
          </CardTitle>
          <CardDescription className="text-muted-foreground dark:text-zinc-300 tracking-widest font-normal">
            {format(startDate, "dd MMMM yyyy")} -{" "}
            {format(endDate, "dd MMMM yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData?.data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={diffDays > 7 ? "month" : "day"}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="total" fill="var(--color-total)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
};

export default ChartBill;
