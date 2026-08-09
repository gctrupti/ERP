import { Link, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, FileText, Printer, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { PagePermission, RoleGuard } from "@/components/shared/role-guard";
import { StatusBadge } from "@/components/badges/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { challanService } from "@/services/challan-service";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/contexts/auth-context";
import { formatCurrency, formatDateTime, formatNumber } from "@/utils/format";

export function ChallanDetailPage() {
  const { challanId } = useParams({ from: "/_portal/challans/$challanId" });
  const queryClient = useQueryClient();
  const { user, roleLabel } = useAuth();

  const { data: challan, isLoading } = useQuery({
    queryKey: queryKeys.challan(challanId),
    queryFn: () => challanService.get(challanId),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["challans"] });
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    await queryClient.invalidateQueries({ queryKey: ["movements"] });
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    await queryClient.invalidateQueries({ queryKey: queryKeys.reports });
  };

  const confirm = useMutation({
    mutationFn: () => challanService.confirm(challanId, `${user?.name} (${roleLabel})`),
    onSuccess: async () => {
      toast.success("Challan confirmed — stock deducted");
      await invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const cancel = useMutation({
    mutationFn: () => challanService.cancel(challanId),
    onSuccess: async () => {
      toast.success("Challan cancelled");
      await invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />;

  if (!challan) {
    return (
      <EmptyState
        icon={FileText}
        title="Challan not found"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/challans">Back to challans</Link>
          </Button>
        }
      />
    );
  }

  const isDraft = challan.status === "DRAFT";

  return (
    <PagePermission permission="challans.view">
      <div className="space-y-6">
        <PageHeader
          title={challan.challanNo}
          description={`${challan.customerName} · raised ${formatDateTime(challan.createdAt)}`}
          actions={
            <>
              <Button asChild variant="outline" className="rounded-xl">
                <Link to="/challans">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Link>
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
              <Button 
                variant="outline" 
                className="rounded-xl" 
                onClick={async () => {
                  try {
                    await challanService.downloadPdf(challanId, challan.challanNo);
                  } catch (e) {
                    toast.error("Failed to download PDF");
                  }
                }}
              >
                <FileText className="mr-2 h-4 w-4" /> Export PDF
              </Button>
              {isDraft ? (
                <RoleGuard permission="challans.manage">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="rounded-xl">
                        <XCircle className="mr-2 h-4 w-4" /> Cancel
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this challan?</AlertDialogTitle>
                        <AlertDialogDescription>
                          The challan stays on record as cancelled. Stock is untouched.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep draft</AlertDialogCancel>
                        <AlertDialogAction onClick={() => cancel.mutate()}>
                          Cancel challan
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="rounded-xl">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm and deduct stock?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This deducts {formatNumber(challan.totalQuantity)} units and writes stock
                          movement logs. Confirmed challans cannot be edited or cancelled.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Not now</AlertDialogCancel>
                        <AlertDialogAction onClick={() => confirm.mutate()}>
                          Confirm challan
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </RoleGuard>
              ) : null}
            </>
          }
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="surface-card space-y-3 p-5">
            <StatusBadge status={challan.status} />
            <dl className="space-y-2 text-sm">
              <Row label="Customer" value={challan.customerName} />
              <Row label="Raised by" value={challan.createdBy} />
              <Row label="Total units" value={formatNumber(challan.totalQuantity)} />
              <Row label="Total value" value={formatCurrency(challan.totalValue)} />
            </dl>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Notes
              </p>
              <p className="mt-1 text-sm">{challan.notes || "—"}</p>
            </div>
          </div>

          <div className="surface-card overflow-hidden lg:col-span-2">
            <div className="border-b border-border p-4">
              <h2 className="text-sm font-semibold">Line items</h2>
              <p className="text-xs text-muted-foreground">
                Prices snapshotted when the challan was created.
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {challan.items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.sku}</p>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(item.quantity)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-semibold">
                      Grand total
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatCurrency(challan.totalValue)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </PagePermission>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate text-right font-medium">{value}</dd>
    </div>
  );
}
