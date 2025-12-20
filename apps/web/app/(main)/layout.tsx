"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Top Header */}
          <div className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
            <header className="flex h-16 items-center bg-[#ffffff] shadow-md border-b border-border">
              <div className="flex w-full items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />

                <Separator orientation="vertical" className="mx-2 h-4" />

                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">
                        Building Your Application
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
          </div>

          {/* Main Content */}
          <main className="flex min-h-screen flex-col bg-[#f4f6f9] pt-16">
            <div className="p-6">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>

      {/* {children} */}
    </div>
  );
}
