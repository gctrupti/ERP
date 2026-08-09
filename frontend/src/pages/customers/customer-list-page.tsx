import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/tables/data-table";
import { SearchInput } from "@/components/search/search-input";
import { FilterSelect } from "@/components/filters/filter-select";
import { StatusBadge } from "@/components/badges/status-badge";
import { PagePermission, RoleGuard } from "@/components/shared/role-guard";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CUSTOMER_STATUSES, CUSTOMER_TYPES } from "@/constants";
import { customerService } from "@/services/customer-service";
import { queryKeys } from "@/lib/query-keys";
import { useTableParams } from "@/hooks/use-table-params";
import { formatDate } from "@/utils/format";
import type { Customer } from "@/types";

export function CustomerListPage() {
  const { params, setSearch, setPage, setFilter, toggleSort } = useTableParams({ sortBy: "name" });
  const [pendingDelete, setPendingDelete] = useState<Customer | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.customers(params),
    queryFn: () => customerService.list(params),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => customerService.remove(id),
    onSuccess: async () => {
      toast.success("Customer removed");
      setPendingDelete(null);
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Customer",
      sortable: true,
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.businessName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.name} · {row.city}
          </p>
        </div>
      ),
    },
    {
      key: "mobile",
      header: "Contact",
      cell: (row) => (
        <div className="min-w-0">
          <p className="tabular-nums">{row.mobile}</p>
          <p className="truncate text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    { key: "gst", header: "GSTIN", cell: (row) => <span className="text-xs">{row.gst}</span> },
    { key: "type", header: "Type", sortable: true, cell: (row) => <StatusBadge status={row.type} /> },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "followUpDate",
      header: "Next follow-up",
      sortable: true,
      cell: (row) => <span className="text-xs">{formatDate(row.followUpDate)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (row) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <RoleGuard permission="customers.manage">
            <Button asChild variant="ghost" size="icon" aria-label="Edit customer">
              <Link to="/customers/$customerId/edit" params={{ customerId: row.id }}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete customer"
              onClick={() => setPendingDelete(row)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </RoleGuard>
        </div>
      ),
    },
  ];

  return (
    <PagePermission permission="customers.view">
      <div className="space-y-6">
        <PageHeader
          title="Customer CRM"
          description="Single source of truth for buyers, distributors and open leads."
          actions={
            <RoleGuard permission="customers.manage">
              <Button asChild className="rounded-xl">
                <Link to="/customers/new">
                  <Plus className="mr-2 h-4 w-4" /> Add customer
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
            navigate({ to: "/customers/$customerId", params: { customerId: row.id } })
          }
          emptyTitle="No customers match your filters"
          emptyDescription="Adjust the search or add a new customer to get started."
          toolbar={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <SearchInput
                value={params.search ?? ""}
                onChange={setSearch}
                placeholder="Search name, GST, mobile…"
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <FilterSelect
                  label="Status"
                  options={CUSTOMER_STATUSES}
                  value={params.filters["status"]}
                  onChange={(value) => setFilter("status", value)}
                />
                <FilterSelect
                  label="Type"
                  options={CUSTOMER_TYPES}
                  value={params.filters["type"]}
                  onChange={(value) => setFilter("type", value)}
                />
              </div>
            </div>
          }
        />

        <AlertDialog open={Boolean(pendingDelete)} onOpenChange={() => setPendingDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove this customer?</AlertDialogTitle>
              <AlertDialogDescription>
                {pendingDelete?.businessName} will be removed from the customer master. Existing
                challans keep their stored snapshot.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => pendingDelete && removeMutation.mutate(pendingDelete.id)}
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          Sales and Admin roles can edit records; Accounts has read-only access.
        </p>
      </div>
    </PagePermission>
  );
}
