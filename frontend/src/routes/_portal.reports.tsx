import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/pages/reports/reports-page";

export const Route = createFileRoute("/_portal/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Nexora ERP" },
      { name: "description", content: "Inventory summary, customer summary and sales summary reports." },
      { property: "og:title", content: "Reports — Nexora ERP" },
      { property: "og:description", content: "Operational reporting across stock, customers and sales." },
    ],
  }),
  component: ReportsPage,
});
