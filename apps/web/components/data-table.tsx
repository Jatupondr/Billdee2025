"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="border rounded-xl overflow-hidden">
      <Table className="w-full">
        {/* ---- Table Header ---- */}
        <TableHeader className="bg-muted sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id + 64}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={`${headerGroup.id + 88}_${header.id + 22}`} // ✅ guaranteed unique
                  className="text-base  font-normal tracking-widest"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        {/* ---- Table Body ---- */}
        <TableBody className=" ">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={row.id + 2}
                data-state={row.getIsSelected() && "selected"}
                className={`${index % 2 === 0 ? " dark:bg-gray-800" : "bg-muted dark:bg-gray-700"}`}
              >
                {row.getVisibleCells().map((cell, index) => (
                  <TableCell
                    key={`${row.id + 4}_${cell.id + 3}`} // ✅ unique even for duplicate accessorKeys
                    className={`text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 tracking-widest`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center tracking-widest"
              >
                ไม่พบข้อมูล
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
