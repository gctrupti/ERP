import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import type { Permission } from "@/types";

/**
 * Renders children only when the signed-in role holds the permission.
 * Used for whole pages and for individual action buttons.
 */
export function RoleGuard({
  permission,
  children,
  fallback,
}: {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { can } = useAuth();
  if (can(permission)) return <>{children}</>;
  return <>{fallback ?? null}</>;
}

export function PagePermission({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  const { can, roleLabel } = useAuth();
  if (can(permission)) return <>{children}</>;

  return (
    <div className="surface-card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <ShieldAlert className="h-5 w-5" />
      </span>
      <div>
        <p className="font-medium">Access restricted</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Your role ({roleLabel}) does not have permission to view this module. Contact an
          administrator if you need access.
        </p>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
