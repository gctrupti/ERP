import { createFileRoute } from "@tanstack/react-router";
import { CustomerFormPage } from "@/pages/customers/customer-form-page";

export const Route = createFileRoute("/_portal/customers/$customerId/edit")({
  head: () => ({
    meta: [
      { title: "Edit Customer — Nexora ERP" },
      { name: "description", content: "Update customer master data, status and follow-up date." },
      { property: "og:title", content: "Edit Customer — Nexora ERP" },
      { property: "og:description", content: "Maintain accurate customer records." },
    ],
  }),
  component: () => <CustomerFormPage mode="edit" />,
});
