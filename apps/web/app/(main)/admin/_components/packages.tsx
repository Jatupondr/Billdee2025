"use client";
import { DataTable } from '@/components/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useEffect, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import api from '@/hooks/axios';
import { useDebounce } from '@/hooks/use-debounce';

import { Badge } from '@/components/ui/badge';
import Paginations from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { DotsThreeVerticalIcon, PlusCircleIcon } from '@phosphor-icons/react';
import CreatePackModal from './create-pack-modal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import CancelSubscriptionDialog from '../../settings/_components/cancel-sub-dialog';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

interface Package {
  _id: string;
  plan: string;
  userId: {
    name: string;
    email: string;
  };
  description: string;
  price: number;
  cost: number;
  totalBill: number;
  nextBill: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  startDate: string;
  endDate: string;
  expDate: string;
  totalDays: number;
}

const Packages = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 500);
  const [openCancelSubscriptionDialog, setOpenCancelSubscriptionDialog] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);


  const getPackages = async (page: number, pageSize: number, search: string) => {
    const response = await api.get(`/subscriptions?page=${page}&pageSize=${pageSize}&search=${search}`);
    return response.data;
  };
  const { data: packages } = useQuery({
    queryKey: ["packages", page, pageSize, debouncedSearch],
    queryFn: () => getPackages(page, pageSize, debouncedSearch),
  });


  const columns: ColumnDef<Package>[] = [
    {
      header: "ชื่อเเพ็คเกจ",
      accessorKey: "plan",
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {row.original.plan}
        </span>
      ),
    },
    {
      header: "ชื่อผู้ใช้",
      accessorKey: "userId",
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {row.original.userId?.name}
        </span>
      ),
    },

    {
      header: "ราคา",
      accessorKey: "price",
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {row.original.plan === "pro" ? "299" : "0"} ฿
        </span>
      ),
    },

    {
      header: "รอบบิล",
      accessorKey: "startDate",
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {new Date(row.original.startDate).toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
          {" - "} {new Date(row.original.endDate).toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "รอบบิลถัดไป",
      accessorKey: "nextBill",
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {new Date(new Date(row.original.expDate).getTime() + 1000 * 60 * 60 * 24).toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </span>
      ),
    },

    {
      header: "วันที่หมดอายุ",
      accessorKey: "totalBill",
      cell: ({ row }) => {
        const dateTotalDays = Math.ceil((new Date(row.original.expDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return (
          <>
            <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
              {dateTotalDays} วัน
            </span>
          </>
        );
      },
    },


    {
      header: "วันที่สร้าง",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {new Date(row.original.createdAt).toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "วันที่แก้ไขล่าสุด",
      accessorKey: "updatedAt",
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {new Date(row.original.updatedAt).toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "สถานะ",
      accessorKey: "status",
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          <Badge className={`${row.original.status === "paid" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`} >{row.original.status === "paid" ? "ชำระเงินแล้ว" : row.original.status === "expired" ? "หมดอายุ" : row.original.status === "canceled" ? "ยกเลิก" : "รอการชำระเงิน"}</Badge>
        </span>
      ),
    },
    {
      header: "จัดการ",
      accessorKey: "",
      cell: ({ row }) => (

        <>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" className="cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest" size="icon">

              <DotsThreeVerticalIcon size={24} weight="bold" />
            </Button>} />
            <DropdownMenuContent className="w-40" align="start">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal tracking-widest">จัดการเเพ็คเกจ</DropdownMenuLabel>
                <DropdownMenuItem disabled={row.original.status === "canceled" ? true : false} className={` "text-sm font-normal tracking-widest cursor-pointer active:scale-95 duration-200 ease-in-out`} onClick={() => { setOpenCancelSubscriptionDialog(true); setSelectedSubscriptionId(row.original._id); }}>
                  ยกเลิกเเพ็คเกจ
                </DropdownMenuItem>

              </DropdownMenuGroup>



            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )
    }

  ];
  useEffect(() => {
    if (session?.user?.role !== "admin") {
      router.push("/");
    }


  }, [session]);
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-normal tracking-widest">
            รายชื่อเเพ็คเกจ
          </CardTitle>
          <CardDescription className="text-base font-normal tracking-widest">
            รายชื่อผู้ใช้เเพ็คเกจงานทั้งหมดในระบบ

          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <Button
              size="lg"
              className="cursor-pointer active:scale-95 duration-200 ease-in-out font-normal tracking-widest"
              onClick={() => setCreateModalOpen(true)}
            >
              <PlusCircleIcon size={36} weight="bold" />
              เพิ่มเเพ็คเกจใหม่
            </Button>

            <Input
              placeholder="ค้นหาชื่อผู้ใช้
              "
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-1/2 text-sm font-normal tracking-widest"
            />
          </div>
          <div className="w-full overflow-x-auto">
            <DataTable columns={columns} data={packages?.rows || []} />
          </div>
          <Paginations
            totalItems={packages?.meta?.total || 0}
            itemsPerPage={packages?.meta?.limit || 10}
            currentPage={packages?.meta?.page || 1}
            onPageChange={(page) => {
              setPage(page);
            }}
            onItemsPerPageChange={(limit) => {
              setPageSize(limit);
            }}
          />
        </CardContent>
      </Card >

      <CreatePackModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
      <CancelSubscriptionDialog open={openCancelSubscriptionDialog} onOpenChange={setOpenCancelSubscriptionDialog} subscriptionId={selectedSubscriptionId} />
    </>
  )
}

export default Packages
