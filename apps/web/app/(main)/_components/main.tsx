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
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const Main = () => {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: activeOrg, isPending } = authClient.useActiveOrganization();

  useEffect(() => {
    if (!sessionPending && !isPending && !activeOrg) {
      router.push("/organization");
    }
  }, [activeOrg, isPending, sessionPending, router]);
  return (
    <>
      {isPending || sessionPending ? (
        <div className="flex justify-center items-center min-h-[calc(100vh-60px)]">
          <p>Loading...</p>
        </div>
      ) : activeOrg ? (
        <>
          <div className="text-center">
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
                <EmptyTitle>No results found</EmptyTitle>
                <EmptyDescription>
                  No results found for your search. Try adjusting your search
                  terms.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button>Try again</Button>
                <Button
                  variant="link"
                  className="text-muted-foreground"
                  nativeButton={false}
                  render={
                    <a href="#">
                      Learn more <ArrowUpRightIcon />
                    </a>
                  }
                />
              </EmptyContent>
            </Empty>
          </div>
        </>
      )}
    </>
  );
};

export default Main;
