import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Loader2,
  Warehouse,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { PagePermission, RoleGuard } from "@/components/shared/role-guard";
import { DataTable, type Column } from "@/components/tables/data-table";
import { SearchInput } from "@/components/search/search-input";
import { FilterSelect } from "@/components/filters/filter-select";
import { StatCard } from "@/components/cards/stat-card";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MOVEMENT_REASONS } from "@/constants";
import { inventoryService, productService } from "@/services/product-service";
import { queryKeys } from "@/lib/query-keys";
import { useTableParams } from "@/hooks/use-table-params";
import { useAuth } from "@/contexts/auth-context";
import { formatCurrency, formatDateTime, formatNumber } from "@/utils/format";
import type { MovementType, StockMovement } from "@/types";

export function InventoryPage() {
  const { params, setSearch, setPage, setFilter, toggleSort } = useTableParams({
    sortBy: "createdAt",
    sortDir: "desc",
  });
  const queryClient = useQueryClient();
  const { user, roleLabel } = useAuth();

  const [dialogType, setDialogType] = useState<MovementType | null>(null);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState<string>(MOVEMENT_REASONS[0]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.movements(params),
    queryFn: () => inventoryService.movements(params),
  });
  const { data: products } = useQuery({
    queryKey: queryKeys.productOptions,
    queryFn: () => productService.all(),
  });

  const selected = (products ?? []).find((p) => p.id === productId);
  const lowStock = (products ?? []).filter((p) => p.currentStock <= p.minimumStock);
  const stockValue = (products ?? []).reduce((s, p) => s + p.currentStock * p.unitPrice, 0);
  const totalUnits = (products ?? []).reduce((s, p) => s + p.currentStock, 0);

  const move = useMutation({
    mutationFn: () =>
      inventoryService.move({
        productId,
        quantity,
        type: dialogType ?? "IN",
        reason,
        createdBy: `${user?.name} (${roleLabel})`,
      }),
    onSuccess: async () => {
      toast.success(dialogType === "IN" ? "Stock added" : "Stock issued");
      setDialogType(null);
      setProductId("");
      setQuantity(1);
      await queryClient.invalidateQueries({ queryKey: ["movements"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      await queryClient.invalidateQueries({ queryKey: queryKeys.reports });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const columns: Column<StockMovement>[] = [
    {
      key: "productName",
      header: "Product",
      sortable: true,
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.productName}</p>
          <p className="text-xs text-muted-foreground">{row.sku}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      cell: (row) => <StatusBadge status={row.type} />,
    },
    {
      key: "quantity",
      header: "Quantity",
      sortable: true,
      align: "right",
      cell: (row) => (
        <span className="font-medium tabular-nums">
          {row.type === "IN" ? "+" : "−"}
          {formatNumber(row.quantity)}
        </span>
      ),
    },
    { key: "reason", header: "Reason", cell: (row) => row.reason },
    {
      key: "createdAt",
      header: "Logged",
      sortable: true,
      cell: (row) => (
        <div>
          <p className="text-sm">{formatDateTime(row.createdAt)}</p>
          <p className="text-xs text-muted-foreground">{row.createdBy}</p>
        </div>
      ),
    },
  ];

  const openDialog = (type: MovementType) => {
    setDialogType(type);
    setReason(type === "IN" ? MOVEMENT_REASONS[0] : MOVEMENT_REASONS[3]);
  };

  const insufficient =
    dialogType === "OUT" && selected ? quantity > selected.currentStock : false;

  return (
    <PagePermission permission="inventory.view">
      <div className="space-y-6">
        <PageHeader
          title="Inventory & stock movement"
          description="Every adjustment is logged with reason and actor. Stock can never go negative."
          actions={
            <RoleGuard permission="inventory.manage">
              <Button variant="outline" className="rounded-xl" onClick={() => openDialog("OUT")}>
                <ArrowUpFromLine className="mr-2 h-4 w-4" /> Stock out
              </Button>
              <Button className="rounded-xl" onClick={() => openDialog("IN")}>
                <ArrowDownToLine className="mr-2 h-4 w-4" /> Stock in
              </Button>
            </RoleGuard>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="SKUs tracked" value={formatNumber(products?.length ?? 0)} icon={Warehouse} />
          <StatCard label="Units on hand" value={formatNumber(totalUnits)} icon={Warehouse} />
          <StatCard label="Stock value" value={formatCurrency(stockValue)} icon={Warehouse} tone="success" />
          <StatCard
            label="Low stock alerts"
            value={formatNumber(lowStock.length)}
            icon={AlertTriangle}
            tone={lowStock.length > 0 ? "warning" : "default"}
            hint={lowStock.length > 0 ? "Reorder required" : "All healthy"}
          />
        </div>

        {lowStock.length > 0 ? (
          <section className="surface-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4 text-warning" /> Reorder list
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {lowStock.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2 text-sm"
                >
                  <span className="min-w-0 truncate">{product.name}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatNumber(product.currentStock)} / {formatNumber(product.minimumStock)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

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
          emptyTitle="No stock movements yet"
          emptyDescription="Record a stock-in to start the ledger."
          toolbar={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <SearchInput
                value={params.search ?? ""}
                onChange={setSearch}
                placeholder="Search product, reason or user…"
              />
              <FilterSelect
                label="Type"
                options={["IN", "OUT"]}
                value={params.filters["type"]}
                onChange={(value) => setFilter("type", value)}
              />
            </div>
          }
        />

        <Dialog open={dialogType !== null} onOpenChange={(open) => !open && setDialogType(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogType === "IN" ? "Stock in" : "Stock out"}</DialogTitle>
              <DialogDescription>
                {dialogType === "IN"
                  ? "Add received or corrected quantity to a SKU."
                  : "Issue or write off stock. Quantities beyond available stock are blocked."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Product</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {(products ?? []).map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} · {formatNumber(product.currentStock)} in stock
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="rounded-xl"
                />
                {insufficient ? (
                  <p className="text-xs text-destructive">
                    Only {formatNumber(selected!.currentStock)} units available
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOVEMENT_REASONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                className="rounded-xl"
                onClick={() => move.mutate()}
                disabled={!productId || quantity <= 0 || insufficient || move.isPending}
              >
                {move.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Record movement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PagePermission>
  );
}
