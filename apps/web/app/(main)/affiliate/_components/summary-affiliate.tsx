"use client";

import React from 'react'
import { Card, CardContent } from '@/components/ui/card';
import { ChartLineUpIcon } from '@phosphor-icons/react';
const SummaryAffiliate = () => {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full">
        <Card className="p-6 py-4 dark:bg-zinc-900">
          <CardContent className="p-0 flex items-start justify-between">
            <div className="flex-1">
              <dt className="text-sm tracking-widest font-normal dark:text-zinc-300 ">
                ยอดขายรวม
              </dt>
              <dd className="mt-2 flex items-baseline space-x-2.5">
                <span className="text-3xl  text-foreground tracking-widest font-normal">
                  100,000
                  บาท
                </span>
              </dd>
            </div>
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
              <ChartLineUpIcon
                size={24}
                weight="duotone"
                className="text-blue-600 dark:text-blue-400"
              />
            </div>
          </CardContent>
        </Card>
        {/* <Card className="p-6 py-4 dark:bg-zinc-900">
          <CardContent className="p-0 flex items-start justify-between">
            <div className="flex-1">
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
              </dd>
            </div>
            <div className="rounded-full bg-orange-100 dark:bg-orange-900/20 p-3">
              <ShoppingCartIcon
                size={24}
                weight="duotone"
                className="text-orange-600 dark:text-orange-400"
              />
            </div>
          </CardContent>
        </Card> */}
        {/* <Card className="p-6 py-4 dark:bg-zinc-900">
          <CardContent className="p-0 flex items-start justify-between">
            <div className="flex-1">
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
              </dd>
            </div>
            <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-3">
              <WalletIcon
                size={24}
                weight="duotone"
                className="text-purple-600 dark:text-purple-400"
              />
            </div>
          </CardContent>
        </Card> */}
        {/* <Card className="p-6 py-4 dark:bg-zinc-900">
          <CardContent className="p-0 flex items-start justify-between">
            <div className="flex-1">
              <dt className="text-sm tracking-widest font-normal dark:text-zinc-300 ">
                กำไรสุทธิ
              </dt>
              <div className="mt-2 flex items-baseline space-x-2.5">
                <span
                  className={cn(
                    overview?.data?.totalProfit &&
                      overview?.data?.totalProfit > 0
                      ? "text-green-800 dark:text-green-400"
                      : "text-red-800 dark:text-red-400",
                    "text-3xl text-foreground tracking-widest font-normal",
                  )}
                >
                  {overview?.data?.totalProfit?.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00"}{" "}
                  บาท
                </span>
              </div>
            </div>
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
              <CurrencyCircleDollarIcon
                size={24}
                weight="duotone"
                className="text-green-600 dark:text-green-400"
              />
            </div>
          </CardContent>
        </Card> */}
      </div>

    </>
  )
}

export default SummaryAffiliate
