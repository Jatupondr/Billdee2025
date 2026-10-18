"use client";

import Image from "next/image";

import * as React from "react";

import { SidebarMenu, useSidebar } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    // logo: any;
    plan: string;
  }[];
}) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);
  const { data: activeOrg, isPending } = authClient.useActiveOrganization();
  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <div className="flex items-center gap-4 px-4 py-3 w-full  transition-colors">
        {/* Logo */}
        <a
          href="/"
          className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition"
        >
          <Image
            src="/logo.png"
            alt="Billdee"
            width={32}
            height={32}
            priority
          />
        </a>

        {/* Team info */}
        <div className="flex flex-col leading-tight min-w-0 flex-1">
          <span className="text-xl font-normal font-mono text-white tracking-widest truncate uppercase">
            {activeTeam.name}
          </span>
          <span className="text-sm text-white/70 truncate leading-tight max-w-40 font-normal tracking-widest">
            {activeOrg?.name}
          </span>
        </div>
      </div>
    </SidebarMenu>
  );
}
