import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  message = "Something went wrong while loading this data.",
  onRetry,
}: {
  message?: string | undefined;
  onRetry?: (() => void) | undefined;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Retry
        </Button>
      ) : null}
    </div>
  );
}
