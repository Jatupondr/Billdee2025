"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import SiteHeader from "./_components/site-header";

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
          <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
            <SiteHeader />
          </div>

          {/* Main Content */}
          <main className=" flex-1  bg-[#f4f6f9] dark:bg-zinc-900 h-full">
            <div className="p-4 sm:p-5 md:p-6 lg:p-6">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>

      {/* {children} */}
    </div>
  );
}
