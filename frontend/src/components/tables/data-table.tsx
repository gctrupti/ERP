import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: "left" | "right";
  className?: string;
  cell: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  sortBy?: string | undefined;
  sortDir?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  toolbar?: ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  isError,
  onRetry,
  total = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  sortBy,
  sortDir = "asc",
  onSort,
  onRowClick,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyAction,
  toolbar,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, total);

  return (
    <section className="surface-card overflow-hidden">
      {toolbar ? <div className="border-b border-border p-4">{toolbar}</div> : null}

      {isError ? (
        <ErrorState onRetry={onRetry} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={cn(
                        "whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                        column.align === "right" && "text-right",
                        column.className,
                      )}
                    >
                      {column.sortable && onSort ? (
                        <button
                          type="button"
                          onClick={() => onSort(column.key)}
                          className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                        >
                          {column.header}
                          {sortBy === column.key ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )
                          ) : null}
                        </button>
                      ) : (
                        column.header
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`skeleton-${i}`}>
                        {columns.map((column) => (
                          <TableCell key={column.key}>
                            <Skeleton className="h-4 w-full max-w-[140px]" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : rows.map((row) => (
                      <TableRow
                        key={rowKey(row)}
                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                        className={cn(onRowClick && "cursor-pointer")}
                      >
                        {columns.map((column) => (
                          <TableCell
                            key={column.key}
                            className={cn(
                              "py-3 text-sm",
                              column.align === "right" && "text-right",
                              column.className,
                            )}
                          >
                            {column.cell(row)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>

          {!isLoading && rows.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={emptyTitle}
              {...(emptyDescription ? { description: emptyDescription } : {})}
              {...(emptyAction ? { action: emptyAction } : {})}
            />
          ) : null}

          {onPageChange ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Showing {showingFrom}–{showingTo} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(page + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
