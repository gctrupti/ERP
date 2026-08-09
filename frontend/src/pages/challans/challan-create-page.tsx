import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { PagePermission } from "@/components/shared/role-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { customerService } from "@/services/customer-service";
import { productService } from "@/services/product-service";
import { challanService } from "@/services/challan-service";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/contexts/auth-context";
import { formatCurrency, formatNumber } from "@/utils/format";

interface Line {
  id: string;
  productId: string;
  quantity: number;
}

const newLine = (): Line => ({ id: Math.random().toString(36).slice(2), productId: "", quantity: 1 });

export function ChallanCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, roleLabel } = useAuth();
  const [customerId, setCustomerId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([newLine()]);

  const { data: customers } = useQuery({
    queryKey: ["customers", "options"],
    queryFn: () => customerService.list({ pageSize: 200 }),
  });
  const { data: products } = useQuery({
    queryKey: queryKeys.productOptions,
    queryFn: () => productService.all(),
  });

  const productMap = useMemo(
    () => new Map((products ?? []).map((p) => [p.id, p])),
    [products],
  );

  const totals = lines.reduce(
    (acc, line) => {
      const product = productMap.get(line.productId);
      if (!product) return acc;
      acc.quantity += line.quantity;
      acc.value += line.quantity * product.unitPrice;
      return acc;
    },
    { quantity: 0, value: 0 },
  );

  const stockIssues = lines.filter((line) => {
    const product = productMap.get(line.productId);
    return product ? line.quantity > product.currentStock : false;
  });

  const mutation = useMutation({
    mutationFn: () =>
      challanService.createDraft({
        customerId,
        notes,
        createdBy: `${user?.name} (${roleLabel})`,
        items: lines
          .filter((line) => line.productId)
          .map((line) => ({ productId: line.productId, quantity: line.quantity })),
      }),
    onSuccess: async (challan) => {
      toast.success(`${challan.challanNo} saved as draft`);
      await queryClient.invalidateQueries({ queryKey: ["challans"] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      navigate({ to: "/challans/$challanId", params: { challanId: challan.id } });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateLine = (id: string, patch: Partial<Line>) =>
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, ...patch } : line)));

  const handleSubmit = () => {
    if (!customerId) {
      toast.error("Select a customer first");
      return;
    }
    const filled = lines.filter((line) => line.productId);
    if (filled.length === 0) {
      toast.error("Add at least one product line");
      return;
    }
    if (filled.some((line) => line.quantity <= 0)) {
      toast.error("Quantities must be greater than zero");
      return;
    }
    mutation.mutate();
  };

  return (
    <PagePermission permission="challans.manage">
      <div className="space-y-6">
        <PageHeader
          title="New sales challan"
          description="Prices are snapshotted from the catalog at the time of saving."
          actions={
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/challans">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>
          }
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <section className="surface-card space-y-4 p-5">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Customer</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {(customers?.rows ?? []).map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.businessName} · {customer.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Notes</Label>
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dispatch instructions, vehicle number…"
                  className="rounded-xl"
                />
              </div>
            </section>

            <section className="surface-card">
              <div className="flex items-center justify-between gap-3 border-b border-border p-4">
                <h2 className="text-sm font-semibold">Line items</h2>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setLines((prev) => [...prev, newLine()])}
                >
                  <Plus className="mr-2 h-3.5 w-3.5" /> Add line
                </Button>
              </div>
              <ul className="divide-y divide-border">
                {lines.map((line) => {
                  const product = productMap.get(line.productId);
                  const over = product ? line.quantity > product.currentStock : false;
                  return (
                    <li key={line.id} className="space-y-2 p-4">
                      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_110px_auto] sm:items-end">
                        <div className="min-w-0 space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Product</Label>
                          <Select
                            value={line.productId}
                            onValueChange={(value) => updateLine(line.id, { productId: value })}
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {(products ?? []).map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.name} · {formatNumber(option.currentStock)} in stock
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Qty</Label>
                          <Input
                            type="number"
                            min={1}
                            value={line.quantity}
                            onChange={(e) =>
                              updateLine(line.id, { quantity: Number(e.target.value) })
                            }
                            className="rounded-xl"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Remove line"
                          disabled={lines.length === 1}
                          onClick={() =>
                            setLines((prev) => prev.filter((item) => item.id !== line.id))
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {product ? (
                        <p
                          className={
                            over
                              ? "flex items-center gap-1.5 text-xs text-destructive"
                              : "text-xs text-muted-foreground"
                          }
                        >
                          {over ? <AlertTriangle className="h-3.5 w-3.5" /> : null}
                          {over
                            ? `Only ${formatNumber(product.currentStock)} units available`
                            : `${formatCurrency(product.unitPrice)} × ${line.quantity} = ${formatCurrency(product.unitPrice * line.quantity)}`}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <aside className="surface-card h-fit space-y-4 p-5">
            <h2 className="text-sm font-semibold">Summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Lines</dt>
                <dd className="tabular-nums">{lines.filter((l) => l.productId).length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total units</dt>
                <dd className="tabular-nums">{formatNumber(totals.quantity)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <dt>Total value</dt>
                <dd className="tabular-nums">{formatCurrency(totals.value)}</dd>
              </div>
            </dl>
            {stockIssues.length > 0 ? (
              <p className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {stockIssues.length} line(s) exceed available stock. You can still save a draft, but
                confirmation will be blocked.
              </p>
            ) : null}
            <Button
              className="w-full rounded-xl"
              onClick={handleSubmit}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save as draft
            </Button>
          </aside>
        </div>
      </div>
    </PagePermission>
  );
}
