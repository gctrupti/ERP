import { APP_NAME, APP_TAGLINE } from "@/constants";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function AppInfoTab() {
  const { can, roleLabel } = useAuth();

  const handleReset = async () => {
    toast.info("Demo data reset is disabled. You are now connected to the live database.");
  };

  return (
    <div className="space-y-6">
      <section className="surface-card grid gap-4 p-5 sm:grid-cols-2">
        <Field label="Application" value={APP_NAME} />
        <Field label="Purpose" value={APP_TAGLINE} />
        <Field label="Signed in as" value={roleLabel} />
        <Field label="Data source" value="Live Database Connected" />
      </section>

      <section className="surface-card space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold">Demo data</h2>
          <Badge variant="secondary" className="rounded-full text-xs">
            {can("users.manage") ? "Admin only" : "Read-only"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Resetting restores the seeded customers, products, challans and movement logs. All local
          changes are discarded.
        </p>
        {can("users.manage") ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="rounded-xl">
                <RotateCcw className="mr-2 h-4 w-4" /> Reset demo data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all demo data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This cannot be undone. Everything returns to the original seeded dataset.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep my data</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <p className="text-xs text-muted-foreground">
            Sign in as an administrator to reset the dataset.
          </p>
        )}
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}
