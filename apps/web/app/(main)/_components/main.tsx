"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

import Dashboard from "./dashboard";

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
          <p>Loading...</p>
        </div>
      ) : activeOrg ? (
        <>
          <Dashboard />
          <div className="text-center mt-4">
            <h2>Main Component Content</h2>
            <p>Organization: {activeOrg.name}</p>
            <p>Organization ID: {activeOrg.id}</p>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-center items-center  min-h-[calc(100vh-60px)] ">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>ไม่พบร้านค้า</EmptyTitle>
                <EmptyDescription>
                  คลิกที่ปุ่มด้านล่างเพื่อสร้างร้านค้าใหม่
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => router.push("/organization")}>
                  สร้างร้านค้าใหม่
                </Button>
                {/* <Button
                  variant="link"
                  className="text-muted-foreground"
                  nativeButton={false}
                  render={
                    <a href="#">
                      Learn more <ArrowUpRightIcon />
                    </a>
                  }
                /> */}
              </EmptyContent>
            </Empty>
          </div>
        </>
      )}
    </>
  );
};

export default Main;
