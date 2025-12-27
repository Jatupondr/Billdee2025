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
} from "@phosphor-icons/react";
import { SidebarOptInForm } from "./sidebar-opt-in-form";
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
      title: "ตั่งค่าระบบ",
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
          title: "History",
          url: "/playground/history",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offExamples" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />{" "}
      </SidebarHeader>
      <SidebarContent className="w-full">
        <NavMain items={data.navMain} />
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
