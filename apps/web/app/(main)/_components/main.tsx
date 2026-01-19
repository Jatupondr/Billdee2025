"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

import Dashboard from "./dashboard";
import { ShoppingBagIcon } from "@phosphor-icons/react";

const Main = () => {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const { data: organizations } = authClient.useListOrganizations();

  const { data: activeOrg, isPending } = authClient.useActiveOrganization();
  useEffect(() => {
    const setActiveOrganization = async () => {
      if (
        !sessionPending &&
        !isPending &&
        organizations &&
        organizations.length > 0 &&
        !activeOrg
      ) {
        const dd = await authClient.organization.setActive({
          organizationId: organizations[0].id,
          organizationSlug: organizations[0].slug,
        });
        if (!dd) {
          router.push("/organization");
        }
      }
    };
    setActiveOrganization();
  }, [activeOrg, isPending, sessionPending, router, organizations]);
  return (
    <>
      {isPending || sessionPending ? (
        <div className="flex justify-center items-center min-h-[calc(100vh-60px)]">
          <p className="font-normal tracking-widest text-2xl">Loading...</p>
        </div>
      ) : activeOrg ? (
        <>
          <Dashboard />
          {/* <div className="text-center mt-4">
            <h2>Main Component Content</h2>
            <p>Organization: {activeOrg.name}</p>
            <p>Organization ID: {activeOrg.id}</p>
          </div> */}
        </>
      ) : (
        <>
          <div className="flex justify-center items-center  min-h-[calc(100vh-60px)] ">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShoppingBagIcon size={24} />

                </EmptyMedia>
                <EmptyTitle className="font-normal tracking-widest">
                  ไม่พบร้านค้า
                </EmptyTitle>
                <EmptyDescription className="font-normal tracking-widest">
                  คลิกที่ปุ่มด้านล่างเพื่อสร้างร้านค้าใหม่
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="font-normal tracking-widest">
                <Button
                  className="font-normal tracking-widest cursor-pointer active:scale-95 transition-all duration-100"
                  onClick={() => router.push("/organization")}
                >
                  สร้างร้านค้าใหม่
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        </>
      )}
    </>
  );
};

export default Main;
