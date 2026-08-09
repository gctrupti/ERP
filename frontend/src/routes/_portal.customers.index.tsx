import { createFileRoute } from "@tanstack/react-router";
import { CustomerListPage } from "@/pages/customers/customer-list-page";

export const Route = createFileRoute("/_portal/customers/")({
  head: () => ({
    meta: [
      { title: "Customer CRM — Nexora ERP" },
      { name: "description", content: "Search, segment and manage wholesale customers and leads." },
      { property: "og:title", content: "Customer CRM — Nexora ERP" },
      { property: "og:description", content: "Customer master with lead tracking and follow-ups." },
    ],
  }),
  component: CustomerListPage,
});
