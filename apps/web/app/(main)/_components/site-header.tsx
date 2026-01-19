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
  CaretUpDownIcon,
  CheckCircleIcon,
  CreditCardIcon,
  GearSixIcon,
  SignOutIcon,
  MoonIcon,
  SunIcon,
} from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
const SiteHeader = () => {
  const { theme, setTheme } = useTheme();
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

  const textTf = (t: string) => {
    // check text bill == บิล

    switch (t) {
      case "Bill":
        return "บิล";
      case "Products":
        return "สินค้า";
      case "Settings":
        return "ตั้งค่าระบบ";
      case "Create":
        return "สร้างบิล";
      case "Edit":
        return "แก้ไขบิล";
      case "Cas":
        return "ลูกค้าและซับพลายเออร์";
      case "Customer":
        return "ลูกค้า";
      case "Supplier":
        return "ซับพลายเออร์";
      case "Affiliate":
        return "โปรแกรม affiliate";
      default:
        return t;
    }
  };

  const menuContent = (
    <>
      <DropdownMenuGroup className="">
        <DropdownMenuItem
          className="cursor-pointer flex items-center gap-2 font-normal tracking-widest"
          onClick={() => router.push("/settings?tab=users-info")}
        >
          <CheckCircleIcon />
          บัญชีผู้ใช้
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer flex items-center gap-2 font-normal tracking-widest"
          onClick={() => router.push("/affiliate")}
        >
          <CreditCardIcon />
          affiliate
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer flex items-center gap-2 font-normal tracking-widest"
          onClick={() => router.push("/settings?tab=subscription-info")}
        >
          <CreditCardIcon />
          การชำระเงินและแผน
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer flex items-center gap-2 font-normal tracking-widest"
          onClick={() => router.push("/settings?tab=password-info")}
        >
          <GearSixIcon />
          แก้ไขรหัสผ่าน
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        variant="destructive"
        className="cursor-pointer font-normal tracking-widest"
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
        ออกจากระบบ
      </DropdownMenuItem>
    </>
  );

  // const menuLa = (
  //   <>
  //     <DropdownMenuGroup className="">
  //       <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
  //         <CheckCircleIcon />
  //         TH
  //       </DropdownMenuItem>
  //       <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
  //         <CreditCardIcon />
  //         EN
  //       </DropdownMenuItem>
  //     </DropdownMenuGroup>
  //   </>
  // );
  return (
    <>
      <header className="flex justify-between shrink-0 h-16 items-center bg-[#ffffff] dark:bg-zinc-900 shadow-md border-b border-border dark:border-zinc-700 px-6">
        <div className="flex items-center gap-1">
          <SidebarTrigger className="-ml-1 cursor-pointer" />

          <Separator orientation="vertical" className="mx-2 h-6" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink
                  className="dark:text-zinc-300  text-base font-normal tracking-widest"
                  href="/"
                >
                  หน้าแรก
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={item.path}>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    {index === breadcrumbItems.length - 1 ? (
                      <BreadcrumbPage className="dark:text-zinc-300  text-base font-normal tracking-widest">
                        {textTf(item.label)}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        className="dark:text-zinc-300  text-base font-normal tracking-widest"
                        href={item.path}
                      >
                        {textTf(item.label)}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer active:scale-95 duration-200 ease-in-out"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {" "}
            {theme === "dark" ? <SunIcon size={28} /> : <MoonIcon size={28} />}
          </Button>

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
                  <div className="hidden md:grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-normal tracking-widest">
                      {session?.user?.name?.split(" ")[0] || "-"}
                    </span>
                    <span className="text-zinc-700 dark:text-zinc-300 truncate text-xs font-normal tracking-widest">
                      {session?.user?.email?.split("@")[0] || "-"}
                    </span>
                  </div>
                  <CaretUpDownIcon className="hidden md:block text-zinc-700 dark:text-zinc-300 ml-auto" />
                </Button>
              }
            />
            <DropdownMenuContent
              align="end"
              side="top"
              className="w-(--anchor-width) min-w-56 dark:bg-zinc-900"
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
