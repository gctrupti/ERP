import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, LockKeyhole, PackageSearch, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { APP_NAME, APP_TAGLINE, ROLE_LABELS } from "@/constants";
import { useAuth } from "@/contexts/auth-context";

const HIGHLIGHTS = [
  "Role based access for Admin, Sales, Warehouse and Accounts",
  "Negative-stock prevention on every challan confirmation",
  "Audited stock movement logs with product snapshots",
];

export function LoginPage() {
  const { login, isAuthenticated, isReady } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isReady && isAuthenticated) navigate({ to: "/dashboard", replace: true });
  }, [isReady, isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      toast.success("Signed in successfully");
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-gradient grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between p-10 lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <PackageSearch className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-lg font-semibold">{APP_NAME}</p>
            <p className="text-xs text-muted-foreground">{APP_TAGLINE}</p>
          </div>
        </div>

        <div className="max-w-lg">
          <h1 className="text-4xl font-semibold leading-tight">
            Mini ERP + CRM operations, unified.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Customers, catalog, warehouse stock and sales challans in one governed workspace —
            built for distribution teams that outgrew spreadsheets.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">
          Frontend architecture demo · REST-ready service layer
        </p>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="surface-card w-full max-w-md p-7">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <PackageSearch className="h-4.5 w-4.5" />
            </span>
            <p className="font-display font-semibold">{APP_NAME}</p>
          </div>

          <h2 className="text-xl font-semibold">Sign in to your workspace</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use a demo role below to explore permission-aware modules.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>

            {error ? (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="h-10 w-full rounded-xl" disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LockKeyhole className="mr-2 h-4 w-4" />
              )}
              Sign in
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
