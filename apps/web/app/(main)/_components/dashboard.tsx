"use client";
import React, { useState } from "react";
import StatsSummary from "./summary-stats";
import { authClient } from "@/lib/auth-client";

import { CalendarDatePicker } from "@/components/calendar-date-picker";
import { format, startOfDay, endOfDay } from "date-fns";
import MassCustomer from "./mass-customer";
import MassProduct from "./mass-product";
import ChartBill from "./chart-bill";
export const description = "A bar chart";
const Dashboard = () => {
  const { data: session } = authClient.useSession();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: new Date(),
  });

  console.log("dateRange -a", dateRange.from.toISOString());
  console.log("dateRange -b", dateRange.to.toISOString());

  return (
    <>
      <div className="flex  justify-between gap-4 mx-auto mb-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-normal tracking-widest  dark:text-zinc-300 font-normal tracking-widest">
            ยินดีต้อนรับกลับ คุณ{session?.user?.name}
          </h1>
          <p className="text-base text-muted-foreground dark:text-zinc-300  mt-2 font-normal tracking-widest">Dashboard สรุปข้อมูลร้านค้า</p>
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
      <StatsSummary
        startDate={startOfDay(dateRange.from).toISOString()}
        endDate={endOfDay(dateRange.to).toISOString()}
        organizationId={activeOrg?.id || ""}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        {/* กราฟ Section */}
        <ChartBill
          startDate={startOfDay(dateRange.from).toISOString()}
          endDate={endOfDay(dateRange.to).toISOString()}
          organizationId={activeOrg?.id || ""}
        />

        {/* Right Side Cards */}
        <div className="flex flex-col gap-4">
          {/* Mass Product Card */}

          <MassProduct
            startDate={startOfDay(dateRange.from).toISOString()}
            endDate={endOfDay(dateRange.to).toISOString()}
            organizationId={activeOrg?.id || ""}
          />

          {/* Mass Customer Card */}
          <MassCustomer
            startDate={startOfDay(dateRange.from).toISOString()}
            endDate={endOfDay(dateRange.to).toISOString()}
            organizationId={activeOrg?.id || ""}
          />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
