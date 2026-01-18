"use client";
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

const Paginations = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(i);
            }}
            className={`
              px-4 py-2 text-sm font-normal tracking-widest rounded-xl
              transition-colors duration-200 cursor-pointer
              ${
                currentPage === i
                  ? "bg-primary text-white hover:bg-primary/90 hover:text-white dark:bg-white dark:text-black hover:dark:bg-muted hover:dark:text-muted-foreground"
                  : "bg-muted text-zinc-700 hover:bg-muted hover:text-zinc-700 dark:bg-white dark:text-black hover:dark:bg-muted hover:dark:text-zinc-700"
              }
            `}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between w-full items-center gap-4 sm:gap-2">
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-zinc-600 dark:text-zinc-300 whitespace-nowrap font-normal tracking-widest">
            แสดงรายการต่อหน้า:
          </span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => onItemsPerPageChange(Number(value))}
          >
            <SelectTrigger className="w-20 h-8 ">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span className=" whitespace-nowrap ">
          {totalItems === 0
            ? "ไม่มีรายการ"
            : `${Math.min(
                (currentPage - 1) * itemsPerPage + 1,
                totalItems
              )}-${Math.min(
                currentPage * itemsPerPage,
                totalItems
              )} จาก ${totalItems} แถว`}
        </span>
      </div>
      <div className="flex items-center">
        <Pagination>
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage - 1);
                }}
                className={`
                  rounded-md transition-all duration-200 cursor-pointer font-normal tracking-widest

                  ${
                    currentPage <= 1
                      ? "pointer-events-none opacity-50"
                      : "hover:text-primary"
                  }
                `}
              />
            </PaginationItem>
            {renderPageNumbers()}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage + 1);
                }}
                className={`
                  rounded-md transition-all duration-200 cursor-pointer font-normal tracking-widest

                  ${
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                `}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default Paginations;
