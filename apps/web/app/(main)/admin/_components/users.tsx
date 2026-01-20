"use client";
import { DataTable } from "@/components/data-table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EyeIcon,
  SpinnerGap,
  MagnifyingGlass,
  MagnifyingGlassIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const {
    data: users,
    isLoading,
    error,
  } = useQuery<any[]>({
    queryKey: ["admin-users", searchQuery],
    queryFn: async () => {
      const response = await authClient.admin.listUsers({
        query: {
          limit: 1000,
          offset: 0,
          searchField: "email",
          searchValue: searchQuery,
          sortBy: "email",
          sortDirection: "desc",
        },
      });

      console.log("response", response);

      if (response.error) {
        throw new Error(response.error.message || "Failed to fetch users");
      }

      return response.data?.users || [];
    },
  });

  const columns: ColumnDef<User>[] = [
    {
      header: "ชื่อผู้ใช้งาน",
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
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {row.original.email || "-"}
        </span>
      ),
    },
    {
      header: "สิทธิ์",
      accessorKey: "role",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {row.original.role || "-"}
        </span>
      ),
    },
    {
      header: "วันที่สร้าง",
      accessorKey: "createdAt",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {new Date(row.original.createdAt).toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }) || "-"}
        </span>
      ),
    },
    {
      header: "วันที่แก้ไขล่าสุด",
      accessorKey: "updatedAt",
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm font-normal tracking-widest text-left line-clamp-1">
          {new Date(row.original.updatedAt).toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }) || "-"}
        </span>
      ),
    },
    {
      header: "จัดการ",
      accessorKey: "",
      size: 120,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="icon" variant="outline">
            <EyeIcon size={20} weight="bold" />
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-100">
        <p className="text-destructive">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
      </div>
    );
  }
  console.log("users", users);

  const mapUser =
    users?.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesRole;
    }) || [];

  return (
    <>
      <div className="flex justify-center items-center min-w-full ">
        <Card className="shadow-2xl rounded-2xl w-full  dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-2xl font-normal tracking-widest">
              รายชื่อผู้ใช้งาน
            </CardTitle>
            <CardDescription className="text-base font-normal tracking-widest">
              รายชื่อผู้ใช้งานทั้งหมดในระบบ ({mapUser?.length || 0} จาก{" "}
              {users?.length || 0} คน)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col  gap-4  w-full">
            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="ค้นหาชื่อหรืออีเมล..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 font-normal tracking-widest"
                />
              </div>
              <Select
                value={roleFilter}
                onValueChange={(value: string | null) =>
                  setRoleFilter(value || "all")
                }
              >
                <SelectTrigger className="w-full sm:w-50 font-normal tracking-widest">
                  <SelectValue placeholder="กรองตามสิทธิ์" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="all"
                    className="font-normal tracking-widest"
                  >
                    ทั้งหมด
                  </SelectItem>
                  <SelectItem
                    value="admin"
                    className="font-normal tracking-widest"
                  >
                    Admin
                  </SelectItem>
                  <SelectItem
                    value="user"
                    className="font-normal tracking-widest"
                  >
                    User
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full overflow-x-auto">
              <DataTable columns={columns} data={mapUser || []} />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Users;
