import { APP_NAME, APP_TAGLINE, ROLE_LABELS, ROLE_PERMISSIONS } from "@/constants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Minus } from "lucide-react";
import type { Permission, Role } from "@/types";

const ROLES = Object.keys(ROLE_PERMISSIONS) as Role[];
const ALL_PERMISSIONS = [...new Set(ROLES.flatMap((role) => ROLE_PERMISSIONS[role]))] as Permission[];

export function PermissionsTab() {
  return (
    <div className="surface-card overflow-hidden">
      <div className="border-b border-border p-4">
        <h2 className="text-sm font-semibold">Role Permission Matrix</h2>
        <p className="text-xs text-muted-foreground">
          Permissions are enforced in navigation, page guards and action buttons. (Read-only)
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Permission</TableHead>
              {ROLES.map((role) => (
                <TableHead key={role} className="text-center">
                  {ROLE_LABELS[role]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ALL_PERMISSIONS.map((permission) => (
              <TableRow key={permission}>
                <TableCell className="font-mono text-xs">{permission}</TableCell>
                {ROLES.map((role) => (
                  <TableCell key={role} className="text-center">
                    {ROLE_PERMISSIONS[role].includes(permission) ? (
                      <Check className="mx-auto h-4 w-4 text-success" />
                    ) : (
                      <Minus className="mx-auto h-4 w-4 text-muted-foreground/50" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
