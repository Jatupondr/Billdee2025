"use client";
import React from "react";
import StatsSummary from "./summary-stats";
import { authClient } from "@/lib/auth-client";

const Dashboard = () => {
  const { data: session } = authClient.useSession();
  return (
    <>
      <div className="flex  justify-between gap-4 mx-auto mb-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-widest font-mono ">
            ยินดีต้อนรับกลับ คุณ{session?.user?.name}
          </h1>
          <p className="text-base text-muted-foreground tracking-widest mt-2">
            Dashboard สรุปข้อมูลร้านค้า
          </p>
        </div>

        <div className="flex flex-col mr-4">
          <p className="text-sm text-zinc-300 tracking-widest">date</p>
        </div>
      </div>
      <StatsSummary />
    </>
  );
};

export default Dashboard;
