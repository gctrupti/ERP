import { createFileRoute } from "@tanstack/react-router";
import { ProductFormPage } from "@/pages/products/product-form-page";

export const Route = createFileRoute("/_portal/products/new")({
  head: () => ({
    meta: [
      { title: "Add Product — Nexora ERP" },
      { name: "description", content: "Create a product with SKU, price, stock and warehouse." },
      { property: "og:title", content: "Add Product — Nexora ERP" },
      { property: "og:description", content: "Extend the catalog with a new SKU." },
    ],
  }),
  component: () => <ProductFormPage mode="create" />,
});
