import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/pages/settings/profile-page";

export const Route = createFileRoute("/_portal/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Nexora ERP" },
      { name: "description", content: "Your account details, role and module permissions." },
      { property: "og:title", content: "My Profile — Nexora ERP" },
      { property: "og:description", content: "Signed-in user profile and access scope." },
    ],
  }),
  component: ProfilePage,
});
