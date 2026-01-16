"use client";

import { Card, CardContent } from "@/components/ui/card";
import api from "@/hooks/axios";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const data = [
  {
    name: "ยอดขายรวม",
    stat: "10,450",
    change: "-12.5%",
    changeType: "negative",
  },
  {
    name: "ต้นทุนขาย (COGS)",
    stat: "200",
    change: "+1.8%",
    changeType: "positive",
  },
  {
    name: "ค่าใช้จ่ายอื่นๆ",
    stat: "5.2min",
    change: "+19.7%",
    changeType: "positive",
  },
  {
    name: "กำไรสุทธิ",
    stat: "3.2%",
    change: "-2.4%",
    changeType: "negative",
  },
];

interface StatsSummaryProps {
  startDate: string;
  endDate: string;
  organizationId: string;
}

export default function StatsSummary({
  startDate,
  endDate,
  organizationId,
}: StatsSummaryProps) {
  const getOverview = async (from: string, to: string) => {
    const response = await api.get(
      `/overview/summary?startDate=${startDate}&endDate=${endDate}&organizationId=${organizationId}`
    );
    return response.data;
  };
  const { data: overview } = useQuery({
    queryKey: ["overview", startDate, endDate],
    queryFn: () => getOverview(startDate, endDate),
  });
  return (
    <div className="flex items-center justify-center p-1 w-full">
      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full">
        {/* {data.map((item) => (
          <Card key={item.name} className="p-6 py-4 dark:bg-zinc-900">
            <CardContent className="p-0">
              <dt className="text-sm font-medium dark:text-zinc-300 tracking-wide">
                {item.name}
              </dt>
              <dd className="mt-2 flex items-baseline space-x-2.5">
                <span className="text-3xl font-semibold text-foreground tracking-widest">
                  {item.stat} บาท
                </span>
                <span
                  className={cn(
                    item.changeType === "positive"
                      ? "text-green-800 dark:text-green-400"
                      : "text-red-800 dark:text-red-400",
                    "text-sm font-medium"
                  )}
                >
                  {item.change}
                </span>
              </dd>
            </CardContent>
          </Card>
        ))} */}

        <Card className="p-6 py-4 dark:bg-zinc-900">
          <CardContent className="p-0">
            <dt className="text-sm tracking-widest font-normal dark:text-zinc-300 ">
              ยอดขายรวม
            </dt>
            <dd className="mt-2 flex items-baseline space-x-2.5">
              <span className="text-3xl  text-foreground tracking-widest font-normal">
                {overview?.data?.total?.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "0.00"}{" "}
                บาท
              </span>
              <span
              // className={cn(
              //   item.changeType === "positive"
              //     ? "text-green-800 dark:text-green-400"
              //     : "text-red-800 dark:text-red-400",
              //   "text-sm font-medium"
              // )}
              >
                {/* s */}
              </span>
            </dd>
          </CardContent>
        </Card>
        <Card className="p-6 py-4 dark:bg-zinc-900">
          <CardContent className="p-0">
            <dt className="text-sm tracking-widest font-normal dark:text-zinc-300 ">
              ต้นทุนขาย (COGS)
            </dt>
            <dd className="mt-2 flex items-baseline space-x-2.5">
              <span className="text-3xl text-foreground tracking-widest font-normal">
                {overview?.data?.totalCost?.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "0.00"}{" "}
                บาท
              </span>
              <span
              // className={cn(
              //   item.changeType === "positive"
              //     ? "text-green-800 dark:text-green-400"
              //     : "text-red-800 dark:text-red-400",
              //   "text-sm font-medium"
              // )}
              >
                {/* s */}
              </span>
            </dd>
          </CardContent>
        </Card>
        <Card className="p-6 py-4 dark:bg-zinc-900">
          <CardContent className="p-0">
            <dt className="text-sm tracking-widest font-normal dark:text-zinc-300 ">
              ค่าใช้จ่ายอื่นๆ
            </dt>
            <dd className="mt-2 flex items-baseline space-x-2.5">
              <span className="text-3xl text-foreground tracking-widest font-normal">
                {overview?.data?.exp?.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "0.00"}{" "}
                บาท
              </span>
              <span
              // className={cn(
              //   item.changeType === "positive"
              //     ? "text-green-800 dark:text-green-400"
              //     : "text-red-800 dark:text-red-400",
              //   "text-sm font-medium"
              // )}
              >
                {/* s */}
              </span>
            </dd>
          </CardContent>
        </Card>
        <Card className="p-6 py-4 dark:bg-zinc-900">
          <CardContent className="p-0">
            <dt className="text-sm tracking-widest font-normal dark:text-zinc-300 ">
              กำไรสุทธิ
            </dt>
            <div className="mt-2 flex items-baseline space-x-2.5">
              <span
                className={cn(
                  overview?.data?.totalProfit && overview?.data?.totalProfit > 0
                    ? "text-green-800 dark:text-green-400"
                    : "text-red-800 dark:text-red-400",
                  "text-3xl text-foreground tracking-widest font-normal"
                )}
              >
                {overview?.data?.totalProfit?.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "0.00"}{" "}
                บาท
              </span>
              <span
              // className={cn(
              //   item.changeType === "positive"
              //     ? "text-green-800 dark:text-green-400"
              //     : "text-red-800 dark:text-red-400",
              //   "text-sm font-medium"
              // )}
              >
                {/* s */}
              </span>
            </div>
          </CardContent>
        </Card>
      </dl>
    </div>
  );
}
