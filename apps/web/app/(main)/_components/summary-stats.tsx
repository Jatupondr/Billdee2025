"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const data = [
  {
    name: "ยอดขายรวม",
    stat: "10,450",
    change: "-12.5%",
    changeType: "negative",
  },
  {
    name: "ต้นทุนขาย (COGS)",
    stat: "56.1%",
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

export default function StatsSummary() {
  return (
    <div className="flex items-center justify-center p-1 w-full">
      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full">
        {data.map((item) => (
          <Card key={item.name} className="p-6 py-4 dark:bg-zinc-900">
            <CardContent className="p-0">
              <dt className="text-sm font-medium text-zinc-300 tracking-wide">
                {item.name}
              </dt>
              <dd className="mt-2 flex items-baseline space-x-2.5">
                <span className="text-3xl font-semibold text-foreground tracking-widest">
                  {item.stat}
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
        ))}
      </dl>
    </div>
  );
}
