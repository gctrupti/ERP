import { Link, useRouterState } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  customers: "Customers",
  products: "Products",
  inventory: "Inventory",
  challans: "Sales Challans",
  reports: "Reports",
  settings: "Settings",
  profile: "Profile",
  new: "Create",
};

export function Breadcrumbs() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const label = LABELS[segment] ?? segment.replace(/^(cus|prd|chl)_/, "#");
          return (
            <span key={`${segment}-${index}`} className="inline-flex items-center">
              <BreadcrumbSeparator className="mx-1.5" />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="capitalize">{label}</BreadcrumbPage>
                ) : (
                  <span className="capitalize text-muted-foreground">{label}</span>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
