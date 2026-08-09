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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_CATEGORIES, WAREHOUSES } from "@/constants";
import { productService, type ProductInput } from "@/services/product-service";
import { queryKeys } from "@/lib/query-keys";

const EMPTY: ProductInput = {
  name: "",
  sku: "",
  category: "Packaging",
  unitPrice: 0,
  currentStock: 0,
  minimumStock: 0,
  warehouse: "Pune Central",
};

type Errors = Partial<Record<keyof ProductInput, string>>;

function validate(values: ProductInput): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Product name is required";
  if (!/^[A-Z]{3}-\d{3,5}$/.test(values.sku.trim()))
    errors.sku = "SKU format: ABC-1234";
  if (values.unitPrice <= 0) errors.unitPrice = "Unit price must be greater than zero";
  if (values.currentStock < 0) errors.currentStock = "Stock cannot be negative";
  if (values.minimumStock < 0) errors.minimumStock = "Minimum stock cannot be negative";
  return errors;
}

export function ProductFormPage({ mode }: { mode: "create" | "edit" }) {
  const params = useParams({ strict: false }) as { productId?: string };
  const productId = params.productId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<ProductInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  const { data: existing } = useQuery({
    queryKey: queryKeys.product(productId ?? "new"),
    queryFn: () => productService.get(productId!),
    enabled: mode === "edit" && Boolean(productId),
  });

  useEffect(() => {
    if (existing) {
      const { id: _id, createdAt: _createdAt, ...rest } = existing;
      setValues(rest);
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: (input: ProductInput) =>
      mode === "create" ? productService.create(input) : productService.update(productId!, input),
    onSuccess: async (product) => {
      toast.success(mode === "create" ? "Product created" : "Product updated");
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      navigate({ to: "/products/$productId", params: { productId: product.id } });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const setField = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    mutation.mutate(values);
  };

  return (
    <PagePermission permission="products.manage">
      <div className="space-y-6">
        <PageHeader
          title={mode === "create" ? "Add product" : "Edit product"}
          description="Catalog data drives challan pricing snapshots and stock alerts."
          actions={
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/products">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>
          }
        />

        <form onSubmit={handleSubmit} className="surface-card grid gap-4 p-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Product name</Label>
            <Input
              value={values.name}
              onChange={(e) => setField("name", e.target.value)}
              className="rounded-xl"
            />
            {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">SKU</Label>
            <Input
              value={values.sku}
              onChange={(e) => setField("sku", e.target.value.toUpperCase())}
              placeholder="PKG-1201"
              className="rounded-xl"
            />
            {errors.sku ? <p className="text-xs text-destructive">{errors.sku}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Select value={values.category} onValueChange={(v) => setField("category", v)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Unit price (₹)</Label>
            <Input
              type="number"
              min={0}
              value={values.unitPrice}
              onChange={(e) => setField("unitPrice", Number(e.target.value))}
              className="rounded-xl"
            />
            {errors.unitPrice ? (
              <p className="text-xs text-destructive">{errors.unitPrice}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Warehouse</Label>
            <Select value={values.warehouse} onValueChange={(v) => setField("warehouse", v)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WAREHOUSES.map((warehouse) => (
                  <SelectItem key={warehouse} value={warehouse}>
                    {warehouse}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {mode === "create" ? "Opening stock" : "Current stock"}
            </Label>
            <Input
              type="number"
              min={0}
              value={values.currentStock}
              onChange={(e) => setField("currentStock", Number(e.target.value))}
              className="rounded-xl"
            />
            {errors.currentStock ? (
              <p className="text-xs text-destructive">{errors.currentStock}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Minimum stock</Label>
            <Input
              type="number"
              min={0}
              value={values.minimumStock}
              onChange={(e) => setField("minimumStock", Number(e.target.value))}
              className="rounded-xl"
            />
            {errors.minimumStock ? (
              <p className="text-xs text-destructive">{errors.minimumStock}</p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" className="rounded-xl" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {mode === "create" ? "Create product" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </PagePermission>
  );
}
