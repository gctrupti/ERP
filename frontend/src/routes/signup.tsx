import { createFileRoute } from "@tanstack/react-router";
import { SignupPage } from "@/pages/auth/signup-page";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Nexora ERP + CRM Operations Portal" },
      {
        name: "description",
        content: "Create an account to join the Nexora ERP + CRM operations portal.",
      },
    ],
  }),
  component: SignupPage,
});
