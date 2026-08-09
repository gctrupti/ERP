import { useAuth } from "@/contexts/auth-context";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, ROLE_PERMISSIONS } from "@/constants";
import { initialsOf } from "@/utils/format";

export function ProfilePage() {
  const { user, roleLabel } = useAuth();
  if (!user) return null;
  const roleKey = user.role.toUpperCase() as Role;
  const permissions = ROLE_PERMISSIONS[roleKey] || [];

  return (
    <div className="space-y-6">
      <PageHeader title="My profile" description="Your identity and access scope in this portal." />

      <section className="surface-card p-5">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/12 text-lg font-semibold text-primary">
            {initialsOf(user.name)}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{user.name}</h2>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            <Badge variant="secondary" className="mt-2 rounded-full text-xs">
              {roleLabel}
            </Badge>
          </div>
        </div>
      </section>

      <section className="surface-card p-5">
        <h2 className="text-sm font-semibold">Granted permissions</h2>
        <p className="text-xs text-muted-foreground">
          {permissions.length} of {Object.keys(ROLE_PERMISSIONS).length && "all"} module actions for{" "}
          {ROLE_LABELS[roleKey] || user.role}.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {permissions.map((permission) => (
            <li key={permission}>
              <Badge variant="outline" className="rounded-full font-mono text-xs">
                {permission}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
