"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { NavMain } from "./nav-main";
import {
  RocketIcon,
  ChartBarIcon,
  HouseSimpleIcon,
  CashRegister,
  CashRegisterIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  PackageIcon,
} from "@phosphor-icons/react";
import { SidebarOptInForm } from "./sidebar-opt-in-form";
import { NavMainAdmin } from "./nav-main-admin";
import { authClient } from "@/lib/auth-client";
// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Billdee",

      plan: "Jatupod Seefood Seefood SeefoodSeefood ",
    },
  ],
  navMain: [
    {
      title: "หน้าแรก",
      url: "/",
      icon: HouseSimpleIcon,
      isActive: true,
    },
    {
      title: "ออกบิล",
      url: "/bill",
      icon: ReceiptIcon,
      isActive: false,
    },

    {
      title: "สินค้า",
      url: "/products",
      icon: CashRegisterIcon,
      isActive: false,
    },

    {
      title: "ตั้งค่า",
      url: "/settings",
      icon: ReceiptIcon,
      isActive: false,
    },

    {
      title: "ลูกค้าและซับพลายเออร์",
      url: "#",
      icon: RocketIcon,
      isActive: false,
      items: [
        {
          title: "ลูกค้า",
          url: "/cas/customer",
        },
        {
          title: "ซับพลายเออร์",
          url: "/cas/supplier",
        },
      ],
    },
  ],
  navMainAdmin: [

    {
      title: "รายชื่อผู้ใช้งาน",
      url: "/admin/users",
      icon: ShieldCheckIcon,
      isActive: false,
    },
    {
      title: "เเพ็กเกจผู้ใช้งาน",
      url: "/admin/packages",
      icon: PackageIcon,
      isActive: false,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession();
  console.log("session", session);
  return (
    <Sidebar collapsible="offExamples" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />{" "}
      </SidebarHeader>
      <SidebarContent className="w-full">
        <NavMain items={data.navMain} />
        {session?.user?.role === "admin" && (
          <NavMainAdmin items={data.navMainAdmin} />
        )}
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>{/* <NavUser user={data.user} /> */}</SidebarFooter>
      {/* <SidebarRail /> */}
      <SidebarFooter>
        <div className="p-1">
          <SidebarOptInForm />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
