import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, PackageSearch, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APP_NAME, APP_TAGLINE } from "@/constants";
import { useAuth } from "@/contexts/auth-context";

const HIGHLIGHTS = [
  "Role based access for Admin, Sales, Warehouse and Accounts",
  "Negative-stock prevention on every challan confirmation",
  "Audited stock movement logs with product snapshots",
];

export function SignupPage() {
  const { isAuthenticated, isReady } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Sales"); // Default role
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
      const response = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, roleName: role })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Signup failed');
      }

      toast.success("Account created successfully. Please sign in.");
      navigate({ to: "/", replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign up";
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

          <h2 className="text-xl font-semibold">Create your account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Join the workspace to start managing your operations.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                  <SelectItem value="Accounts">Accounts</SelectItem>
                </SelectContent>
              </Select>
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
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Sign up
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/" className="text-primary hover:underline font-medium">
              Sign in
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
