import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarClock,
  FileText,
  Package,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/cards/stat-card";
import { StatusBadge } from "@/components/badges/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { analyticsService } from "@/services/analytics-service";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/contexts/auth-context";
import { formatCurrency, formatDate, formatNumber } from "@/utils/format";

export function DashboardPage() {
  const { user, can } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => analyticsService.dashboard(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name.split(" ")[0] ?? "there"}`}
        description="Operational snapshot across customers, catalog, warehouse stock and sales."
        actions={
          can("challans.manage") ? (
            <Button asChild className="rounded-xl">
              <Link to="/challans/new">
                <FileText className="mr-2 h-4 w-4" /> New challan
              </Link>
            </Button>
          ) : null
        }
      />

      {isLoading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total customers"
              value={formatNumber(data.totalCustomers)}
              icon={Users}
              hint="Across all segments"
            />
            <StatCard
              label="Active customers"
              value={formatNumber(data.activeCustomers)}
              icon={UserCheck}
              tone="success"
              trend={{ value: "+8.4%", direction: "up" }}
            />
            <StatCard
              label="Products"
              value={formatNumber(data.totalProducts)}
              icon={Package}
              hint={`Stock value ${formatCurrency(data.stockValue)}`}
            />
            <StatCard
              label="Low stock items"
              value={formatNumber(data.lowStockCount)}
              icon={AlertTriangle}
              tone="warning"
              hint="At or below minimum level"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="surface-card p-5 lg:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">Challan activity</h2>
                  <p className="text-xs text-muted-foreground">Last 6 days</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {data.confirmedThisMonth} confirmed
                </span>
              </div>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.salesTrend}>
                    <defs>
                      <linearGradient id="challanFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--color-border)",
                        background: "var(--color-popover)",
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="challans"
                      stroke="var(--color-chart-1)"
                      strokeWidth={2}
                      fill="url(#challanFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="surface-card p-5">
              <h2 className="text-sm font-semibold">Stock by category</h2>
              <p className="text-xs text-muted-foreground">Units on hand</p>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.categoryMix}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="category" tickLine={false} axisLine={false} fontSize={10} interval={0} angle={-20} textAnchor="end" height={50} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--color-border)",
                        background: "var(--color-popover)",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="units" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="surface-card lg:col-span-2">
              <div className="flex items-center justify-between gap-3 border-b border-border p-4">
                <h2 className="text-sm font-semibold">Recent challans</h2>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/challans">View all</Link>
                </Button>
              </div>
              <ul className="divide-y divide-border">
                {data.recentChallans.map((challan) => (
                  <li key={challan.id}>
                    <Link
                      to="/challans/$challanId"
                      params={{ challanId: challan.id }}
                      className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{challan.challanNo}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {challan.customerName} · {formatDate(challan.createdAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-sm font-medium tabular-nums">
                          {formatCurrency(challan.totalValue)}
                        </span>
                        <StatusBadge status={challan.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="surface-card">
                <div className="flex items-center gap-2 border-b border-border p-4">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <h2 className="text-sm font-semibold">Low stock alerts</h2>
                </div>
                {data.lowStockItems.length === 0 ? (
                  <EmptyState icon={Package} title="All stock healthy" />
                ) : (
                  <ul className="divide-y divide-border">
                    {data.lowStockItems.map((product) => (
                      <li key={product.id} className="flex items-center justify-between gap-3 p-3.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.sku}</p>
                        </div>
                        <span className="shrink-0 text-xs font-medium text-warning-foreground">
                          {product.currentStock}/{product.minimumStock}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="surface-card">
                <div className="flex items-center gap-2 border-b border-border p-4">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold">Today's follow-ups</h2>
                </div>
                {data.todaysFollowUps.length === 0 ? (
                  <EmptyState icon={CalendarClock} title="No follow-ups due today" />
                ) : (
                  <ul className="divide-y divide-border">
                    {data.todaysFollowUps.slice(0, 4).map((followUp) => (
                      <li key={followUp.id} className="p-3.5">
                        <p className="text-sm">{followUp.note}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(followUp.date)} · {followUp.createdBy}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="surface-card flex items-center gap-3 p-4">
                <span className="stat-icon shrink-0">
                  <Wallet className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Inventory valuation</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCurrency(data.stockValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
