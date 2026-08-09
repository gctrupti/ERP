import { createFileRoute } from "@tanstack/react-router";
import { ProductListPage } from "@/pages/products/product-list-page";

export const Route = createFileRoute("/_portal/products/")({
  head: () => ({
    meta: [
      { title: "Product Catalog — Nexora ERP" },
      { name: "description", content: "SKU catalog with pricing, stock levels and warehouse mapping." },
      { property: "og:title", content: "Product Catalog — Nexora ERP" },
      { property: "og:description", content: "Manage products, SKUs and minimum stock thresholds." },
    ],
  }),
  component: ProductListPage,
});
