"use client";

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
          <svg
            width="36"
            height="28"
            viewBox="0 0 48 34"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-sm"
          >
            <g id="logogram">
              <path
                fill="#4DA3FF"
                d="M15.4992 0H36.5808L21.0816 22.9729H0L15.4992 0Z"
              />
              <path
                fill="#ffffff"
                d="M16.4224 25.102L10.4192 34H32.5008L48 11.0271H31.7024L22.2064 25.102H16.4224Z"
              />
            </g>
          </svg>
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
