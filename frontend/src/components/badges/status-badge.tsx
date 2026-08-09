import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  ACTIVE: "bg-success/12 text-success border-success/25",
  CONFIRMED: "bg-success/12 text-success border-success/25",
  DONE: "bg-success/12 text-success border-success/25",
  IN: "bg-success/12 text-success border-success/25",
  PROSPECT: "bg-info/12 text-info border-info/25",
  DRAFT: "bg-warning/15 text-warning-foreground border-warning/30",
  PENDING: "bg-warning/15 text-warning-foreground border-warning/30",
  LOW: "bg-warning/15 text-warning-foreground border-warning/30",
  INACTIVE: "bg-muted text-muted-foreground border-border",
  CANCELLED: "bg-destructive/12 text-destructive border-destructive/25",
  MISSED: "bg-destructive/12 text-destructive border-destructive/25",
  OUT: "bg-destructive/12 text-destructive border-destructive/25",
};

const LABELS: Record<string, string> = {
  IN: "Stock In",
  OUT: "Stock Out",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const label =
    LABELS[status] ?? status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        TONES[status] ?? "bg-secondary text-secondary-foreground border-border",
        className,
      )}
    >
      {label}
    </Badge>
  );
}
