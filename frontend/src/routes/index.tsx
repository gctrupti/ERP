import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/auth/login-page";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Nexora ERP + CRM Operations Portal" },
      {
        name: "description",
        content:
          "Secure role-based sign in to the Nexora ERP + CRM operations portal for wholesale customers, inventory, and sales challans.",
      },
      { property: "og:title", content: "Nexora ERP + CRM Operations Portal" },
      {
        property: "og:description",
        content:
          "Manage customers, inventory, stock movement, and sales challans from one enterprise dashboard.",
      },
    ],
  }),
  component: LoginPage,
});
