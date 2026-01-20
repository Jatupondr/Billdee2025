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
import { CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function NavMainAdmin({
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
  const [isRotate, setIsRotate] = React.useState(false);


  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sx font-normal text-[#f4f6f9] dark:text-zinc-300 tracking-widest mb-0.5">
        เมนูผู้ดูแลระบบ
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
              <Collapsible key={item.title} defaultOpen={item.isActive}>
                <SidebarMenuItem>
                  {item.items?.length ? (
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton
                          onClick={() => {
                            setIsRotate(!isRotate);
                          }}
                          isActive={isCurrentPath || hasActiveSubItem}
                          className={cn(
                            "group/item flex items-center gap-2 transition-colors w-full cursor-pointer",
                            isCurrentPath
                              ? "text-sidebar-foreground"
                              : hasActiveSubItem
                                ? "text-sidebar-foreground/70 cursor-pointer data-active:bg-zinc-100 dark:data-active:bg-zinc-600"
                                : "text-[#f4f6f9] hover:text-sidebar-foreground/70"
                          )}
                        />
                      }
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
                      <span className="font-normal tracking-widest">{item.title}</span>
                      <CaretDownIcon
                        className={`ml-auto  ${isRotate ? "" : "-rotate-90"} duration-200 ease-in-out`}
                        size={18}
                        weight="duotone"
                      />
                    </CollapsibleTrigger>
                  ) : (
                    <SidebarMenuButton
                      render={<Link href={item.url as any} />}
                      isActive={isCurrentPath || hasActiveSubItem}
                      className={cn(
                        "group/item flex items-center gap-2 transition-colors",
                        isCurrentPath
                          ? "text-zinc-700 dark:text-zinc-300"
                          : hasActiveSubItem
                            ? "text-sidebar-foreground/70  data-active:bg-zinc-100 dark:data-active:bg-zinc-600"
                            : "text-[#f4f6f9] hover:text-zinc-700 dark:hover:text-zinc-300"
                      )}
                    >
                      {Icon && (
                        <Icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-colors group-hover/item:text-sidebar-foreground/70",
                            hasActiveSubItem && "text-zinc-700 dark:text-zinc-300"
                          )}
                          weight="duotone"
                        />
                      )}
                      <span className="font-normal tracking-widest">{item.title}</span>
                    </SidebarMenuButton>
                  )}
                  {item.items?.length ? (
                    <CollapsibleContent className="mt-0.5 ml-4">
                      <SidebarMenuSub>
                        {item.items.map((subItem) => {
                          const isSubActive = pathname === subItem.url;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                render={<Link href={subItem.url as any} />}
                                isActive={isSubActive}
                                className="group/sub-item flex items-center cursor-pointer gap-2 transition-colors space-x-4  text-[#f4f6f9] hover:text-sidebar-foreground/70 data-active:bg-sidebar-accent tracking-widest"
                              >
                                <span className="font-normal tracking-widest">{subItem.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
