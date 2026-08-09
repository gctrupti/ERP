import { createFileRoute } from "@tanstack/react-router";
import { ChallanListPage } from "@/pages/challans/challan-list-page";

export const Route = createFileRoute("/_portal/challans/")({
  head: () => ({
    meta: [
      { title: "Sales Challans — Nexora ERP" },
      { name: "description", content: "Draft, confirmed and cancelled sales challans in one register." },
      { property: "og:title", content: "Sales Challans — Nexora ERP" },
      { property: "og:description", content: "Issue challans that update inventory on confirmation." },
    ],
  }),
  component: ChallanListPage,
});
