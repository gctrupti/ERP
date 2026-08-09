import { createFileRoute } from "@tanstack/react-router";
import { ProductFormPage } from "@/pages/products/product-form-page";

export const Route = createFileRoute("/_portal/products/$productId/edit")({
  head: () => ({
    meta: [
      { title: "Edit Product — Nexora ERP" },
      { name: "description", content: "Update SKU pricing, thresholds and warehouse allocation." },
      { property: "og:title", content: "Edit Product — Nexora ERP" },
      { property: "og:description", content: "Keep catalog data accurate." },
    ],
  }),
  component: () => <ProductFormPage mode="edit" />,
});
