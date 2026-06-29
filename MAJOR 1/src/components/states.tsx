"use client";

import { type LucideIcon, AlertTriangle, Inbox, RefreshCw, WifiOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOnlineStatus } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/* ------------------------------- Empty ---------------------------- */
export function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description = "Get started by exploring — your progress will appear here.",
  action,
  className,
}: {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/30 px-6 py-16 text-center", className)}>
      <div className="relative mb-4">
        <div className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-2xl" />
        <div className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-card/60">
          <Icon className="size-7 text-muted-foreground" />
        </div>
      </div>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ------------------------------- Error ---------------------------- */
export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn("flex flex-col items-center justify-center rounded-2xl border border-red/20 bg-red/[0.04] px-6 py-16 text-center", className)}
    >
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-red/20 bg-red/10">
        <AlertTriangle className="size-7 text-red" />
      </div>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          <RefreshCw className="size-4" /> Try again
        </Button>
      )}
    </div>
  );
}

/* ------------------------------ Offline --------------------------- */
export function OfflineState({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-orange/20 bg-orange/[0.04] px-6 py-16 text-center", className)}>
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-orange/20 bg-orange/10">
        <WifiOff className="size-7 text-orange" />
      </div>
      <h3 className="font-display text-base font-semibold">You're offline</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Check your connection. We'll refresh automatically once you're back online.
      </p>
    </div>
  );
}

/* ------------------------------ Loading --------------------------- */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-5 animate-spin text-primary", className)} aria-label="Loading" />;
}

export function LoadingState({ label = "Loading", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-16 text-center", className)} role="status" aria-live="polite">
      <Spinner className="size-6" />
      <p className="text-sm text-muted-foreground">{label}…</p>
    </div>
  );
}

/* --------------------------- Query Boundary ----------------------- */
type Status = "pending" | "error" | "success";

/**
 * Wires every data surface through its full set of states.
 * Renders offline → loading(skeleton) → error(retry) → empty → success.
 */
export function QueryBoundary<T>({
  status,
  data,
  isEmpty,
  onRetry,
  skeleton,
  empty,
  errorTitle,
  children,
}: {
  status: Status;
  data: T | undefined;
  isEmpty?: (d: T) => boolean;
  onRetry?: () => void;
  skeleton: React.ReactNode;
  empty?: React.ReactNode;
  errorTitle?: string;
  children: (data: T) => React.ReactNode;
}) {
  const online = useOnlineStatus();
  if (!online && status !== "success") return <OfflineState />;
  if (status === "pending") return <>{skeleton}</>;
  if (status === "error") return <ErrorState title={errorTitle} onRetry={onRetry} />;
  if (data === undefined) return <ErrorState onRetry={onRetry} />;
  if (isEmpty?.(data)) return <>{empty ?? <EmptyState />}</>;
  return <>{children(data)}</>;
}
