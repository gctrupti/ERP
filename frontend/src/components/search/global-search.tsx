import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, Package, Users } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { customerService } from "@/services/customer-service";
import { productService } from "@/services/product-service";
import { challanService } from "@/services/challan-service";
import { queryKeys } from "@/lib/query-keys";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const { data: customers } = useQuery({
    queryKey: queryKeys.customers({ pageSize: 50 }),
    queryFn: () => customerService.list({ pageSize: 50 }),
    enabled: open,
  });
  const { data: products } = useQuery({
    queryKey: queryKeys.productOptions,
    queryFn: () => productService.all(),
    enabled: open,
  });
  const { data: challans } = useQuery({
    queryKey: queryKeys.challans({ pageSize: 50 }),
    queryFn: () => challanService.list({ pageSize: 50 }),
    enabled: open,
  });

  const go = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search customers, products, challans…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Customers">
          {(customers?.rows ?? []).slice(0, 6).map((customer) => (
            <CommandItem
              key={customer.id}
              value={`${customer.name} ${customer.businessName}`}
              onSelect={() =>
                go(() =>
                  navigate({ to: "/customers/$customerId", params: { customerId: customer.id } }),
                )
              }
            >
              <Users className="mr-2 h-4 w-4" />
              {customer.businessName}
              <span className="ml-auto text-xs text-muted-foreground">{customer.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Products">
          {(products ?? []).slice(0, 6).map((product) => (
            <CommandItem
              key={product.id}
              value={`${product.name} ${product.sku}`}
              onSelect={() =>
                go(() => navigate({ to: "/products/$productId", params: { productId: product.id } }))
              }
            >
              <Package className="mr-2 h-4 w-4" />
              {product.name}
              <span className="ml-auto text-xs text-muted-foreground">{product.sku}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Challans">
          {(challans?.rows ?? []).slice(0, 6).map((challan) => (
            <CommandItem
              key={challan.id}
              value={`${challan.challanNo} ${challan.customerName}`}
              onSelect={() =>
                go(() => navigate({ to: "/challans/$challanId", params: { challanId: challan.id } }))
              }
            >
              <FileText className="mr-2 h-4 w-4" />
              {challan.challanNo}
              <span className="ml-auto text-xs text-muted-foreground">{challan.customerName}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
