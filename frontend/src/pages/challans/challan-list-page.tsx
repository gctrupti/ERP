import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/tables/data-table";
import { SearchInput } from "@/components/search/search-input";
import { FilterSelect } from "@/components/filters/filter-select";
import { StatusBadge } from "@/components/badges/status-badge";
import { PagePermission, RoleGuard } from "@/components/shared/role-guard";
import { Button } from "@/components/ui/button";
import { challanService } from "@/services/challan-service";
import { queryKeys } from "@/lib/query-keys";
import { useTableParams } from "@/hooks/use-table-params";
import { formatCurrency, formatDate, formatNumber } from "@/utils/format";
import type { Challan } from "@/types";

const STATUSES = ["DRAFT", "CONFIRMED", "CANCELLED"] as const;

export function ChallanListPage() {
  const { params, setSearch, setPage, setFilter, toggleSort } = useTableParams({
    sortBy: "createdAt",
    sortDir: "desc",
  });
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.challans(params),
    queryFn: () => challanService.list(params),
  });

  const columns: Column<Challan>[] = [
    {
      key: "challanNo",
      header: "Challan",
      sortable: true,
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.challanNo}</p>
          <p className="text-xs text-muted-foreground">{formatDate(row.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "customerName",
      header: "Customer",
      sortable: true,
      cell: (row) => <span className="truncate">{row.customerName}</span>,
    },
    {
      key: "items",
      header: "Lines",
      align: "right",
      cell: (row) => <span className="tabular-nums">{row.items.length}</span>,
    },
    {
      key: "totalQuantity",
      header: "Units",
      sortable: true,
      align: "right",
      cell: (row) => <span className="tabular-nums">{formatNumber(row.totalQuantity)}</span>,
    },
    {
      key: "totalValue",
      header: "Value",
      sortable: true,
      align: "right",
      cell: (row) => (
        <span className="font-medium tabular-nums">{formatCurrency(row.totalValue)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdBy",
      header: "Raised by",
      cell: (row) => <span className="text-xs text-muted-foreground">{row.createdBy}</span>,
    },
  ];

  return (
    <PagePermission permission="challans.view">
      <div className="space-y-6">
        <PageHeader
          title="Sales challans"
          description="Drafts hold stock aside on paper only — confirming a challan deducts inventory."
          actions={
            <RoleGuard permission="challans.manage">
              <Button asChild className="rounded-xl">
                <Link to="/challans/new">
                  <Plus className="mr-2 h-4 w-4" /> New challan
                </Link>
              </Button>
            </RoleGuard>
          }
        />

        <DataTable
          columns={columns}
          rows={data?.rows ?? []}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          total={data?.total ?? 0}
          page={params.page}
          pageSize={params.pageSize}
          onPageChange={setPage}
          sortBy={params.sortBy}
          sortDir={params.sortDir}
          onSort={toggleSort}
          onRowClick={(row) =>
            navigate({ to: "/challans/$challanId", params: { challanId: row.id } })
          }
          emptyTitle="No challans yet"
          emptyDescription="Raise your first challan to start tracking dispatches."
          toolbar={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <SearchInput
                value={params.search ?? ""}
                onChange={setSearch}
                placeholder="Search challan no. or customer…"
              />
              <FilterSelect
                label="Status"
                options={STATUSES}
                value={params.filters["status"]}
                onChange={(value) => setFilter("status", value)}
              />
            </div>
          }
        />

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          Confirmed challans are immutable — cancel only while in draft.
        </p>
      </div>
    </PagePermission>
  );
}
