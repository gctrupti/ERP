import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  trend?: { value: string; direction: "up" | "down" };
  tone?: "default" | "warning" | "success";
}

export function StatCard({ label, value, icon: Icon, hint, trend, tone = "default" }: StatCardProps) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
        </div>
        <span
          className={cn(
            "stat-icon shrink-0",
            tone === "warning" && "bg-warning/15 text-warning-foreground",
            tone === "success" && "bg-success/15 text-success",
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
              trend.direction === "up"
                ? "bg-success/12 text-success"
                : "bg-destructive/12 text-destructive",
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {trend.value}
          </span>
        ) : null}
        {hint ? <span className="truncate">{hint}</span> : null}
      </div>
    </div>
  );
}
