"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  BellIcon,
  CaretUpDownIcon,
  CheckCircleIcon,
  CreditCardIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
const SiteHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  // Create breadcrumb items from pathname
  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  // Create breadcrumb paths
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return { path, label };
  });

  const menuContent = (
    <>
      <DropdownMenuGroup className="">
        <DropdownMenuItem
          className="cursor-pointer flex items-center gap-2"
          onClick={() => router.push("/settings?tab=users-info")}
        >
          <CheckCircleIcon />
          Account
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer flex items-center gap-2"
          onClick={() => router.push("/settings?tab=subscription-info")}
        >
          <CreditCardIcon />
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer flex items-center gap-2"
          onClick={() => router.push("/settings?tab=password-info")}
        >
          <BellIcon />
          Notifications
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        variant="destructive"
        className="cursor-pointer"
        onClick={() => {
          authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                router.push("/login");
              },
            },
          });
        }}
      >
        <SignOutIcon />
        Sign Out
      </DropdownMenuItem>
    </>
  );

  const menuLa = (
    <>
      <DropdownMenuGroup className="">
        <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
          <CheckCircleIcon />
          TH
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
          <CreditCardIcon />
          EN
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </>
  );
  return (
    <>
      <header className="flex justify-between shrink-0 h-16 items-center bg-[#ffffff] shadow-md border-b border-border px-6">
        <div className="flex items-center gap-1">
          <SidebarTrigger className="-ml-1 cursor-pointer" />

          <Separator orientation="vertical" className="mx-2 h-6" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={item.path}>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    {index === breadcrumbItems.length - 1 ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.path}>
                        {item.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex justify-center items-center gap-2">
          {/* <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  className="
    h-7 px-4 gap-2
    justify-start
    rounded-md
    border-muted
    text-xs
    hover:bg-accent/50
    hover:text-accent-foreground
    transition-colors
    cursor-pointer
  "
                >
                  <div className="flex flex-1 items-center justify-between">
                    <span className="fi fi-th"></span>

                    <span className="text-muted-foreground truncate">TH</span>
                  </div>
                </Button>
              }
            />
            <DropdownMenuContent
              align="end"
              side="top"
              className="w-(--anchor-width) min-w-28"
            >
              {menuLa}
            </DropdownMenuContent>
          </DropdownMenu> */}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  className="h-12 justify-start px-2 md:max-w-50 cursor-pointer"
                >
                  <Avatar>
                    <AvatarImage
                      src={
                        session?.user?.image || "https://via.placeholder.com/40"
                      }
                      alt={session?.user?.name || "dd"}
                    />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {session?.user?.name || "-"}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {session?.user?.email || "-"}
                    </span>
                  </div>
                  <CaretUpDownIcon className="text-muted-foreground ml-auto" />
                </Button>
              }
            />
            <DropdownMenuContent
              align="end"
              side="top"
              className="w-(--anchor-width) min-w-56"
            >
              {menuContent}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
};

export default SiteHeader;
