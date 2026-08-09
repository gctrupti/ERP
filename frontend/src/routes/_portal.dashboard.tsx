import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/dashboard/dashboard-page";

export const Route = createFileRoute("/_portal/dashboard")({
  head: () => ({
    meta: [
      { title: "Operations Dashboard — Nexora ERP" },
      { name: "description", content: "KPIs, low stock alerts, follow-ups and recent challans." },
      { property: "og:title", content: "Operations Dashboard — Nexora ERP" },
      { property: "og:description", content: "Live view of customers, stock health and sales activity." },
    ],
  }),
  component: DashboardPage,
});
