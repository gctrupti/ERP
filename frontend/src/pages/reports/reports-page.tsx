import { useQuery } from "@tanstack/react-query";
import { BarChart3, Download } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { PagePermission } from "@/components/shared/role-guard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/badges/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { analyticsService } from "@/services/analytics-service";
import { queryKeys } from "@/lib/query-keys";
import { formatCurrency, formatNumber } from "@/utils/format";

export function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.reports,
    queryFn: () => analyticsService.reports(),
  });

  const exportCsv = () => {
    if (!data) return;
    const lines = [
      "Section,Key,Metric1,Metric2,Metric3",
      ...data.inventory.map(
        (r) => `Inventory,${r.warehouse},${r.products},${r.units},${r.value}`,
      ),
      ...data.customers.map((r) => `Customers,${r.type},${r.count},${r.active},`),
      ...data.sales.map((r) => `Sales,${r.status},${r.count},${r.quantity},${r.value}`),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([lines], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "nexora-operations-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <PagePermission permission="reports.view">
      <div className="space-y-6">
        <PageHeader
          title="Operational reports"
          description="Warehouse stock summary, customer mix and sales challan status roll-up."
          actions={
            <Button variant="outline" className="rounded-xl" onClick={exportCsv}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          }
        />

        <Panel title="Inventory summary" subtitle="Stock position by warehouse">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Warehouse</TableHead>
                <TableHead className="text-right">SKUs</TableHead>
                <TableHead className="text-right">Units</TableHead>
                <TableHead className="text-right">Stock value</TableHead>
                <TableHead className="text-right">Low stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.inventory.map((row) => (
                <TableRow key={row.warehouse}>
                  <TableCell className="font-medium">{row.warehouse}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.products}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(row.units)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(row.value)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.lowStock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Customer summary" subtitle="Segment mix and active share">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Segment</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.customers.map((row) => (
                  <TableRow key={row.type}>
                    <TableCell>
                      <StatusBadge status={row.type} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.active}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>

          <Panel title="Sales summary" subtitle="Challan status roll-up">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Challans</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.sales.map((row) => (
                  <TableRow key={row.status}>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(row.quantity)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(row.value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </div>

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <BarChart3 className="h-3.5 w-3.5" />
          Figures recalculate from live portal data on every visit.
        </p>
      </div>
    </PagePermission>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card overflow-hidden">
      <div className="border-b border-border p-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}
