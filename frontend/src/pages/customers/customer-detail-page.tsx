import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  CalendarPlus,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { PagePermission, RoleGuard } from "@/components/shared/role-guard";
import { StatusBadge } from "@/components/badges/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { customerService } from "@/services/customer-service";
import { challanService } from "@/services/challan-service";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/contexts/auth-context";
import { formatCurrency, formatDate } from "@/utils/format";

export function CustomerDetailPage() {
  const { customerId } = useParams({ from: "/_portal/customers/$customerId/" });
  const queryClient = useQueryClient();
  const { user, roleLabel } = useAuth();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const { data: customer, isLoading } = useQuery({
    queryKey: queryKeys.customer(customerId),
    queryFn: () => customerService.get(customerId),
  });
  const { data: followUps } = useQuery({
    queryKey: queryKeys.followUps(customerId),
    queryFn: () => customerService.followUps(customerId),
  });
  const { data: challans } = useQuery({
    queryKey: queryKeys.challans({ pageSize: 100 }),
    queryFn: () => challanService.list({ pageSize: 100 }),
  });

  const addFollowUp = useMutation({
    mutationFn: () =>
      customerService.addFollowUp({
        customerId,
        date,
        note,
        createdBy: `${user?.name} (${roleLabel})`,
        outcome: "PENDING",
      }),
    onSuccess: async () => {
      toast.success("Follow-up logged");
      setNote("");
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: queryKeys.followUps(customerId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!customer) {
    return (
      <EmptyState
        icon={Building2}
        title="Customer not found"
        description="This record may have been removed."
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/customers">Back to customers</Link>
          </Button>
        }
      />
    );
  }

  const customerChallans = (challans?.rows ?? []).filter((c) => c.customerId === customerId);

  return (
    <PagePermission permission="customers.view">
      <div className="space-y-6">
        <PageHeader
          title={customer.businessName}
          description={`${customer.name} · ${customer.city}`}
          actions={
            <>
              <Button asChild variant="outline" className="rounded-xl">
                <Link to="/customers">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Link>
              </Button>
              <RoleGuard permission="customers.manage">
                <Button asChild className="rounded-xl">
                  <Link to="/customers/$customerId/edit" params={{ customerId }}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Link>
                </Button>
              </RoleGuard>
            </>
          }
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="surface-card space-y-4 p-5">
            <div className="flex items-center gap-2">
              <StatusBadge status={customer.status} />
              <StatusBadge status={customer.type} />
            </div>
            <dl className="space-y-3 text-sm">
              <Row icon={Phone} label="Mobile" value={customer.mobile} />
              <Row icon={Mail} label="Email" value={customer.email} />
              <Row icon={Receipt} label="GSTIN" value={customer.gst} />
              <Row icon={MapPin} label="Address" value={`${customer.address}, ${customer.city}`} />
              <Row icon={CalendarPlus} label="Next follow-up" value={formatDate(customer.followUpDate)} />
            </dl>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Notes
              </p>
              <p className="mt-1 text-sm">{customer.notes || "—"}</p>
            </div>
          </section>

          <section className="lg:col-span-2">
            <Tabs defaultValue="timeline">
              <TabsList className="rounded-xl">
                <TabsTrigger value="timeline">Follow-up timeline</TabsTrigger>
                <TabsTrigger value="challans">Challans ({customerChallans.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-4">
                <div className="surface-card">
                  <div className="flex items-center justify-between gap-3 border-b border-border p-4">
                    <h2 className="text-sm font-semibold">Interaction history</h2>
                    <RoleGuard permission="followups.manage">
                      <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="rounded-xl">
                            <CalendarPlus className="mr-2 h-3.5 w-3.5" /> Log follow-up
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Log a follow-up</DialogTitle>
                            <DialogDescription>
                              Recorded against {customer.businessName} with your name and role.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Date</Label>
                              <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="rounded-xl"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Note</Label>
                              <Textarea
                                rows={4}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Discussed pending order, shared rate card…"
                                className="rounded-xl"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() => addFollowUp.mutate()}
                              disabled={!note.trim() || addFollowUp.isPending}
                              className="rounded-xl"
                            >
                              Save follow-up
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </RoleGuard>
                  </div>

                  {(followUps ?? []).length === 0 ? (
                    <EmptyState
                      icon={CalendarPlus}
                      title="No follow-ups yet"
                      description="Log the first interaction to start the timeline."
                    />
                  ) : (
                    <ol className="space-y-0 p-4">
                      {(followUps ?? []).map((followUp, index) => (
                        <li key={followUp.id} className="relative flex gap-4 pb-5 last:pb-0">
                          <span className="relative flex flex-col items-center">
                            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                            {index < (followUps ?? []).length - 1 ? (
                              <span className="mt-1 w-px flex-1 bg-border" />
                            ) : null}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xs font-medium">{formatDate(followUp.date)}</p>
                              <StatusBadge status={followUp.outcome} />
                            </div>
                            <p className="mt-1 text-sm">{followUp.note}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {followUp.createdBy}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="challans" className="mt-4">
                <div className="surface-card">
                  {customerChallans.length === 0 ? (
                    <EmptyState icon={Receipt} title="No challans issued yet" />
                  ) : (
                    <ul className="divide-y divide-border">
                      {customerChallans.map((challan) => (
                        <li key={challan.id}>
                          <Link
                            to="/challans/$challanId"
                            params={{ challanId: challan.id }}
                            className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-muted/50"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{challan.challanNo}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(challan.createdAt)} · {challan.totalQuantity} units
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                              <span className="text-sm tabular-nums">
                                {formatCurrency(challan.totalValue)}
                              </span>
                              <StatusBadge status={challan.status} />
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </PagePermission>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="truncate">{value || "—"}</dd>
      </div>
    </div>
  );
}
