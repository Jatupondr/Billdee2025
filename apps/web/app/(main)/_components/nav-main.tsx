"use client";

import * as React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { CaretRightIcon } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: any;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sx font-normal text-[#f4f6f9] tracking-wider mb-0.5">
        เมนูหลัก
      </SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isCurrentPath = pathname === item.url;
            const hasActiveSubItem = item.items?.some(
              (subItem) => pathname === subItem.url
            );
            const Icon = item.icon;

            return (
              <Collapsible
                key={item.title}
                defaultOpen={item.isActive}
                render={
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link href={item.url as any} />}
                      isActive={isCurrentPath || hasActiveSubItem}
                      className={cn(
                        "group/item flex items-center gap-2 transition-colors",
                        isCurrentPath
                          ? "text-sidebar-foreground"
                          : hasActiveSubItem
                            ? "text-sidebar-foreground/70  data-active:bg-sidebar-accent/60"
                            : "text-[#f4f6f9] hover:text-sidebar-foreground/70"
                      )}
                    >
                      {Icon && (
                        <Icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-colors group-hover/item:text-sidebar-foreground/70",
                            hasActiveSubItem && "text-sidebar-foreground/70"
                          )}
                          weight="duotone"
                        />
                      )}
                      {/* text-sidebar-foreground/70 */}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.items?.length ? (
                      <>
                        <CollapsibleTrigger
                          render={
                            <SidebarMenuAction className="data-[state=open]:rotate-90 transition-transform" />
                          }
                        >
                          <CaretRightIcon className="h-4 w-4" />
                          <span className="sr-only">Toggle</span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <SidebarMenuSub>
                            {item.items.map((subItem) => {
                              const isSubActive = pathname === subItem.url;
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    render={<Link href={subItem.url as any} />}
                                    isActive={isSubActive}
                                    className="group/sub-item flex items-center gap-2 transition-colors  text-[#f4f6f9] hover:text-sidebar-foreground/70 data-active:bg-sidebar-accent tracking-widest"
                                  >
                                    {subItem.title}
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : null}
                  </SidebarMenuItem>
                }
              />
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
