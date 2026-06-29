"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/hooks";

const UniverseScene = dynamic(() => import("./universe-scene"), {
  ssr: false,
  loading: () => <UniverseFallback />,
});

/** Static, accessible fallback that mirrors the universe aesthetic. */
function UniverseFallback() {
  return (
    <div className="absolute inset-0">
      <div className="absolute left-1/4 top-1/3 size-40 rounded-full bg-primary/30 blur-3xl" />
      <div className="absolute right-1/4 top-1/2 size-48 rounded-full bg-purple/30 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/2 size-40 rounded-full bg-green/20 blur-3xl" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, #fff, transparent), radial-gradient(1px 1px at 70% 60%, #93c5fd, transparent), radial-gradient(1px 1px at 40% 80%, #fff, transparent), radial-gradient(1.5px 1.5px at 85% 25%, #c4b5fd, transparent)",
          backgroundSize: "300px 300px",
        }}
      />
    </div>
  );
}

export function HeroUniverse() {
  const reduced = useReducedMotion();
  if (reduced) return <UniverseFallback />;
  return (
    <div className="absolute inset-0" aria-hidden>
      <UniverseScene />
    </div>
  );
}
