import { createFileRoute } from "@tanstack/react-router";
import { CustomerFormPage } from "@/pages/customers/customer-form-page";

export const Route = createFileRoute("/_portal/customers/new")({
  head: () => ({
    meta: [
      { title: "Add Customer — Nexora ERP" },
      { name: "description", content: "Create a new customer record with GST and follow-up details." },
      { property: "og:title", content: "Add Customer — Nexora ERP" },
      { property: "og:description", content: "Capture customer, business and follow-up information." },
    ],
  }),
  component: () => <CustomerFormPage mode="create" />,
});
