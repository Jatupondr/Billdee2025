"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
const Main = () => {
  return (
    <>
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No results found</EmptyTitle>
          <EmptyDescription>
            No results found for your search. Try adjusting your search terms.
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
    </>
  );
};

export default Main;
