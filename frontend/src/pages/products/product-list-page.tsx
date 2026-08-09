import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Package, Pencil, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/tables/data-table";
import { SearchInput } from "@/components/search/search-input";
import { FilterSelect } from "@/components/filters/filter-select";
import { PagePermission, RoleGuard } from "@/components/shared/role-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_CATEGORIES, WAREHOUSES } from "@/constants";
import { productService } from "@/services/product-service";
import { queryKeys } from "@/lib/query-keys";
import { useTableParams } from "@/hooks/use-table-params";
import { formatCurrency, formatNumber } from "@/utils/format";
import type { Product } from "@/types";

export function ProductListPage() {
  const { params, setSearch, setPage, setFilter, toggleSort } = useTableParams({ sortBy: "name" });
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.products(params),
    queryFn: () => productService.list(params),
  });

  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "Product",
      sortable: true,
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.sku}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      cell: (row) => (
        <Badge variant="secondary" className="rounded-full text-xs">
          {row.category}
        </Badge>
      ),
    },
    { key: "warehouse", header: "Warehouse", sortable: true, cell: (row) => row.warehouse },
    {
      key: "unitPrice",
      header: "Unit price",
      sortable: true,
      align: "right",
      cell: (row) => <span className="tabular-nums">{formatCurrency(row.unitPrice)}</span>,
    },
    {
      key: "currentStock",
      header: "Stock",
      sortable: true,
      align: "right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.currentStock <= row.minimumStock ? (
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
          ) : null}
          <span className="tabular-nums font-medium">{formatNumber(row.currentStock)}</span>
          <span className="text-xs text-muted-foreground">/ {row.minimumStock}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (row) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <RoleGuard permission="products.manage">
            <Button asChild variant="ghost" size="icon" aria-label="Edit product">
              <Link to="/products/$productId/edit" params={{ productId: row.id }}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
          </RoleGuard>
        </div>
      ),
    },
  ];

  return (
    <PagePermission permission="products.view">
      <div className="space-y-6">
        <PageHeader
          title="Product catalog"
          description="SKU master with pricing, warehouse allocation and reorder thresholds."
          actions={
            <RoleGuard permission="products.manage">
              <Button asChild className="rounded-xl">
                <Link to="/products/new">
                  <Plus className="mr-2 h-4 w-4" /> Add product
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
          onRowClick={(row) => navigate({ to: "/products/$productId", params: { productId: row.id } })}
          emptyTitle="No products found"
          emptyDescription="Try a different search term or add a new SKU."
          toolbar={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <SearchInput
                value={params.search ?? ""}
                onChange={setSearch}
                placeholder="Search name or SKU…"
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <FilterSelect
                  label="Category"
                  options={PRODUCT_CATEGORIES}
                  value={params.filters["category"]}
                  onChange={(value) => setFilter("category", value)}
                />
                <FilterSelect
                  label="Warehouse"
                  options={WAREHOUSES}
                  value={params.filters["warehouse"]}
                  onChange={(value) => setFilter("warehouse", value)}
                />
                <Button
                  variant={params.filters["stock"] === "LOW" ? "default" : "outline"}
                  size="sm"
                  className="h-9 rounded-xl"
                  onClick={() =>
                    setFilter("stock", params.filters["stock"] === "LOW" ? "ALL" : "LOW")
                  }
                >
                  <AlertTriangle className="mr-2 h-3.5 w-3.5" /> Low stock
                </Button>
              </div>
            </div>
          }
        />

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Package className="h-3.5 w-3.5" />
          Warehouse and Admin roles can edit the catalog; Sales has read-only access.
        </p>
      </div>
    </PagePermission>
  );
}
