"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this would report to an observability pipeline.
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-bg px-6 text-center">
      <div className="pointer-events-none absolute inset-0 mesh-gradient opacity-50" aria-hidden />
      <div className="relative mb-5 flex size-16 items-center justify-center rounded-2xl border border-red/20 bg-red/10">
        <AlertTriangle className="size-7 text-red" />
      </div>
      <h1 className="relative font-display text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="relative mt-2 max-w-md text-muted-foreground">
        An unexpected error interrupted the experience. You can retry, or head back to your dashboard.
      </p>
      {error.digest && (
        <code className="relative mt-3 rounded-lg bg-white/5 px-2 py-1 font-mono text-xs text-muted-foreground">
          ref: {error.digest}
        </code>
      )}
      <div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
        <Button variant="gradient" onClick={reset}>
          <RefreshCw /> Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard"><Home /> Back to Dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
