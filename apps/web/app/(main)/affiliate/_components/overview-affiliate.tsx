"use client";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import SummaryAffiliate from "./summary-affiliate";
import api from "@/hooks/axios";
import { useQuery } from "@tanstack/react-query";

interface OverviewAffiliateProps {
  id: string;
  code: string;
}

const OverviewAffiliate = ({ id, code }: OverviewAffiliateProps) => {





  const { data: listAffiliate, isLoading } = useQuery({
    queryKey: ["listAffiliate", id, code],
    queryFn: async () => {
      const response = await api.get(
        `/affiliate/list-affiliate/${id}?code=${code}`,
      );
      return response?.data;
    },
    enabled: !!id && !!code,
  });


  const columns: ColumnDef<any>[] = [
    {
      header: "ชื่อ-นามสกุล",
      accessorKey: "name",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {row.original.name || "-"}
        </span>
      ),
    },
    {
      header: "อีเมล",
      accessorKey: "email",
      size: 120,
      cell: ({ row }) => {
        const maskEmail = (email: string) => {
          if (!email) return "-";

          const [name, domain] = email.split("@");
          if (!domain) return email;

          const maskedName =
            name.length <= 1
              ? "*"
              : name[0] + "*".repeat(Math.max(name.length - 1, 12));

          const maskedDomain =
            domain.length <= 1
              ? "*******".repeat(domain.length)
              : "*" + domain.slice(-1);

          return `${maskedName}@${maskedDomain}`;
        }
        return (
          <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
            {maskEmail(row.original.email) || "-"}
          </span>
        )
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex py-8 px-6 w-full bg-white mt-4 dark:bg-zinc-900 flex-col rounded-2xl shadow-xl border border-border/50">
        <div className="text-center">
          <p className="text-sm font-normal tracking-widest">
            กำลังโหลดข้อมูล...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex py-8 px-6 w-full bg-white mt-4 dark:bg-zinc-900 flex-col rounded-2xl shadow-xl border border-border/50">
      <div className="flex flex-col gap-4">
        <SummaryAffiliate />
        <div className="flex flex-col gap-4">
          <p className="text-sm font-normal tracking-widest text-left line-clamp-1">
            รายชื่อผู้เชิญของคุณ จะแสดงก็ต่อเมื่อผู้เชิญมีการสมัครสมาชิกก่อนหน้านี้ และชำระค่าเเพ็คเกจ PRO ก่อนหน้านี้
          </p>
        </div>
        <DataTable columns={columns} data={listAffiliate?.rows || []} />


      </div>
    </div>
  );
};

export default OverviewAffiliate;
