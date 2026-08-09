import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save } from "lucide-react";
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
import { CUSTOMER_STATUSES, CUSTOMER_TYPES } from "@/constants";
import { customerService, type CustomerInput } from "@/services/customer-service";
import { queryKeys } from "@/lib/query-keys";
import type { Customer } from "@/types";

const EMPTY: CustomerInput = {
  name: "",
  mobile: "",
  email: "",
  businessName: "",
  gst: "",
  address: "",
  city: "",
  type: "RETAILER",
  status: "PROSPECT",
  followUpDate: "",
  notes: "",
};

type Errors = Partial<Record<keyof CustomerInput, string>>;

function validate(values: CustomerInput): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Contact name is required";
  if (!values.businessName.trim()) errors.businessName = "Business name is required";
  if (!/^\d{10}$/.test(values.mobile.trim())) errors.mobile = "Enter a 10 digit mobile number";
  if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Enter a valid email";
  if (values.gst && values.gst.trim().length !== 15) errors.gst = "GSTIN must be 15 characters";
  return errors;
}

export function CustomerFormPage({ mode }: { mode: "create" | "edit" }) {
  const params = useParams({ strict: false }) as { customerId?: string };
  const customerId = params.customerId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<CustomerInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  const { data: existing, isLoading } = useQuery({
    queryKey: queryKeys.customer(customerId ?? "new"),
    queryFn: () => customerService.get(customerId!),
    enabled: mode === "edit" && Boolean(customerId),
  });

  useEffect(() => {
    if (existing) {
      const { id: _id, createdAt: _createdAt, ...rest } = existing as Customer;
      setValues({ ...rest, followUpDate: rest.followUpDate ?? "" });
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: async (input: CustomerInput) =>
      mode === "create"
        ? customerService.create(input)
        : customerService.update(customerId!, input),
    onSuccess: async (customer) => {
      toast.success(mode === "create" ? "Customer created" : "Customer updated");
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      navigate({ to: "/customers/$customerId", params: { customerId: customer.id } });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const setField = <K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    mutation.mutate({ ...values, followUpDate: values.followUpDate || null });
  };

  return (
    <PagePermission permission="customers.manage">
      <div className="space-y-6">
        <PageHeader
          title={mode === "create" ? "Add customer" : "Edit customer"}
          description="Master data feeds CRM follow-ups, challans and reporting."
          actions={
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/customers">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>
          }
        />

        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-3">
          <section className="surface-card space-y-4 p-5 lg:col-span-2">
            <h2 className="text-sm font-semibold">Business & contact</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Business name" error={errors.businessName}>
                <Input
                  value={values.businessName}
                  onChange={(e) => setField("businessName", e.target.value)}
                  disabled={isLoading}
                  className="rounded-xl"
                />
              </Field>
              <Field label="Contact person" error={errors.name}>
                <Input
                  value={values.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="rounded-xl"
                />
              </Field>
              <Field label="Mobile" error={errors.mobile}>
                <Input
                  value={values.mobile}
                  onChange={(e) => setField("mobile", e.target.value)}
                  inputMode="numeric"
                  className="rounded-xl"
                />
              </Field>
              <Field label="Email" error={errors.email}>
                <Input
                  type="email"
                  value={values.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className="rounded-xl"
                />
              </Field>
              <Field label="GSTIN" error={errors.gst}>
                <Input
                  value={values.gst}
                  onChange={(e) => setField("gst", e.target.value.toUpperCase())}
                  className="rounded-xl"
                />
              </Field>
              <Field label="City">
                <Input
                  value={values.city}
                  onChange={(e) => setField("city", e.target.value)}
                  className="rounded-xl"
                />
              </Field>
            </div>
            <Field label="Address">
              <Textarea
                value={values.address}
                onChange={(e) => setField("address", e.target.value)}
                rows={3}
                className="rounded-xl"
              />
            </Field>
          </section>

          <section className="surface-card space-y-4 p-5">
            <h2 className="text-sm font-semibold">Segmentation & CRM</h2>
            <Field label="Customer type">
              <Select
                value={values.type}
                onValueChange={(value) => setField("type", value as CustomerInput["type"])}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={values.status}
                onValueChange={(value) => setField("status", value as CustomerInput["status"])}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Next follow-up date">
              <Input
                type="date"
                value={values.followUpDate ?? ""}
                onChange={(e) => setField("followUpDate", e.target.value)}
                className="rounded-xl"
              />
            </Field>
            <Field label="Notes">
              <Textarea
                value={values.notes}
                onChange={(e) => setField("notes", e.target.value)}
                rows={4}
                className="rounded-xl"
                placeholder="Credit terms, dispatch preferences…"
              />
            </Field>

            <Button type="submit" className="w-full rounded-xl" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {mode === "create" ? "Create customer" : "Save changes"}
            </Button>
          </section>
        </form>
      </div>
    </PagePermission>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
