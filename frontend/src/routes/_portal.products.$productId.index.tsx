import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "@/pages/products/product-detail-page";

export const Route = createFileRoute("/_portal/products/$productId/")({
  head: () => ({
    meta: [
      { title: "Product Details — Nexora ERP" },
      { name: "description", content: "Stock position, valuation and movement history for a SKU." },
      { property: "og:title", content: "Product Details — Nexora ERP" },
      { property: "og:description", content: "Inspect stock health and movement logs." },
    ],
  }),
  component: ProductDetailPage,
});
