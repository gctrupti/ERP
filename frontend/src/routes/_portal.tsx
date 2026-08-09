import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/_portal")({
  component: PortalLayout,
});

function PortalLayout() {
  const { isReady, isAuthenticated } = useAuth();

  if (!isReady) {
    return (
      <div className="min-h-screen space-y-4 p-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
