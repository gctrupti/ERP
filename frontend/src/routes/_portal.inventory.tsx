import { createFileRoute } from "@tanstack/react-router";
import { InventoryPage } from "@/pages/inventory/inventory-page";

export const Route = createFileRoute("/_portal/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory & Stock Movement — Nexora ERP" },
      { name: "description", content: "Stock in, stock out, movement logs and low stock alerts." },
      { property: "og:title", content: "Inventory & Stock Movement — Nexora ERP" },
      { property: "og:description", content: "Warehouse stock control with negative stock prevention." },
    ],
  }),
  component: InventoryPage,
});
