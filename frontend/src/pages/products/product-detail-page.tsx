import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Package, Pencil } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PagePermission, RoleGuard } from "@/components/shared/role-guard";
import { StatCard } from "@/components/cards/stat-card";
import { StatusBadge } from "@/components/badges/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { inventoryService, productService } from "@/services/product-service";
import { queryKeys } from "@/lib/query-keys";
import { formatCurrency, formatDateTime, formatNumber } from "@/utils/format";

export function ProductDetailPage() {
  const { productId } = useParams({ from: "/_portal/products/$productId/" });

  const { data: product, isLoading } = useQuery({
    queryKey: queryKeys.product(productId),
    queryFn: () => productService.get(productId),
  });
  const { data: movements } = useQuery({
    queryKey: queryKeys.productMovements(productId),
    queryFn: () => inventoryService.byProduct(productId),
  });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />;

  if (!product) {
    return (
      <EmptyState
        icon={Package}
        title="Product not found"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/products">Back to catalog</Link>
          </Button>
        }
      />
    );
  }

  const coverage = Math.min(
    100,
    Math.round((product.currentStock / Math.max(1, product.minimumStock * 2)) * 100),
  );
  const isLow = product.currentStock <= product.minimumStock;

  return (
    <PagePermission permission="products.view">
      <div className="space-y-6">
        <PageHeader
          title={product.name}
          description={`${product.sku} · ${product.category} · ${product.warehouse}`}
          actions={
            <>
              <Button asChild variant="outline" className="rounded-xl">
                <Link to="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Link>
              </Button>
              <RoleGuard permission="products.manage">
                <Button asChild className="rounded-xl">
                  <Link to="/products/$productId/edit" params={{ productId }}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Link>
                </Button>
              </RoleGuard>
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Current stock"
            value={formatNumber(product.currentStock)}
            icon={Package}
            tone={isLow ? "warning" : "success"}
            hint={isLow ? "Below minimum level" : "Healthy"}
          />
          <StatCard
            label="Minimum stock"
            value={formatNumber(product.minimumStock)}
            icon={Package}
            hint="Reorder threshold"
          />
          <StatCard
            label="Unit price"
            value={formatCurrency(product.unitPrice)}
            icon={Package}
          />
          <StatCard
            label="Stock value"
            value={formatCurrency(product.unitPrice * product.currentStock)}
            icon={Package}
          />
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Stock coverage</h2>
            <span className="text-xs text-muted-foreground">{coverage}% of target buffer</span>
          </div>
          <Progress value={coverage} className="mt-3" />
        </div>

        <div className="surface-card">
          <div className="border-b border-border p-4">
            <h2 className="text-sm font-semibold">Movement history</h2>
            <p className="text-xs text-muted-foreground">
              Every stock change is logged with reason and actor.
            </p>
          </div>
          {(movements ?? []).length === 0 ? (
            <EmptyState icon={Package} title="No movements recorded yet" />
          ) : (
            <ul className="divide-y divide-border">
              {(movements ?? []).map((movement) => (
                <li key={movement.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{movement.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(movement.createdAt)} · {movement.createdBy}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-medium tabular-nums">
                      {movement.type === "IN" ? "+" : "−"}
                      {formatNumber(movement.quantity)}
                    </span>
                    <StatusBadge status={movement.type} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PagePermission>
  );
}
