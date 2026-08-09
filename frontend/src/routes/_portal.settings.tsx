import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/pages/settings/settings-page";

export const Route = createFileRoute("/_portal/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Nexora ERP" },
      { name: "description", content: "Portal preferences, role permissions matrix and demo data controls." },
      { property: "og:title", content: "Settings — Nexora ERP" },
      { property: "og:description", content: "Configure the operations portal." },
    ],
  }),
  component: SettingsPage,
});
