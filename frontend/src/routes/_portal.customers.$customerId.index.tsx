import { createFileRoute } from "@tanstack/react-router";
import { CustomerDetailPage } from "@/pages/customers/customer-detail-page";

export const Route = createFileRoute("/_portal/customers/$customerId/")({
  head: () => ({
    meta: [
      { title: "Customer Details — Nexora ERP" },
      { name: "description", content: "Customer profile, follow-up timeline and challan history." },
      { property: "og:title", content: "Customer Details — Nexora ERP" },
      { property: "og:description", content: "360 degree view of a wholesale customer." },
    ],
  }),
  component: CustomerDetailPage,
});
