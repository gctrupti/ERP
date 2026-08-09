import { createFileRoute } from "@tanstack/react-router";
import { ChallanDetailPage } from "@/pages/challans/challan-detail-page";

export const Route = createFileRoute("/_portal/challans/$challanId")({
  head: () => ({
    meta: [
      { title: "Challan Details — Nexora ERP" },
      { name: "description", content: "Line items, product snapshots and confirmation workflow." },
      { property: "og:title", content: "Challan Details — Nexora ERP" },
      { property: "og:description", content: "Confirm or cancel a sales challan." },
    ],
  }),
  component: ChallanDetailPage,
});
