import { createFileRoute } from "@tanstack/react-router";
import { ChallanCreatePage } from "@/pages/challans/challan-create-page";

export const Route = createFileRoute("/_portal/challans/new")({
  head: () => ({
    meta: [
      { title: "Create Challan — Nexora ERP" },
      { name: "description", content: "Build a multi-line sales challan with live stock validation." },
      { property: "og:title", content: "Create Challan — Nexora ERP" },
      { property: "og:description", content: "Select a customer, add products and save as draft." },
    ],
  }),
  component: ChallanCreatePage,
});
