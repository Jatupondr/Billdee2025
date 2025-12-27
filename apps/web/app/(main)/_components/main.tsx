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

const Main = () => {
  const router = useRouter();
  const orgid = true;
  useEffect(() => {
    if (!orgid) {
      router.push("/organization");
    }
  }, [orgid]);
  return (
    <>
      {orgid ? (
        <>
          <div className="text-center">Main Component Content</div>
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
