"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useUIStore } from "@/lib/stores/ui-store";

/**
 * Applies the persisted theme preference to <html> (light/dark/system) so the
 * theme toggle and Appearance settings are never dead controls.
 */
function ThemeApplier() {
  const theme = useUIStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    const apply = () => {
      const resolved = theme === "system" ? (mql.matches ? "light" : "dark") : theme;
      root.classList.toggle("light", resolved === "light");
      root.style.colorScheme = resolved;
    };
    apply();
    if (theme === "system") {
      mql.addEventListener("change", apply);
      return () => mql.removeEventListener("change", apply);
    }
  }, [theme]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200} skipDelayDuration={300}>
        <ThemeApplier />
        {children}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
