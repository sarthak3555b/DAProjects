"use client";

import * as React from "react";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * 3D tilt card with a cursor-following sheen. The whole surface reacts to
 * the pointer with depth — used for premium, non-template card surfaces.
 */
export function TiltCard({
  children,
  className,
  intensity = 8,
  glow = true,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glow?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * -2 * intensity;
    const ry = (px - 0.5) * 2 * intensity;
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div style={{ perspective: "1200px" }} className={cn("group/tilt", className)}>
      <div
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={reset}
        className="relative h-full w-full rounded-2xl transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: "rotateX(var(--rx,0)) rotateY(var(--ry,0))",
          transformStyle: "preserve-3d",
        }}
      >
        {glow && !reduced && (
          <div
            className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
            style={{
              background:
                "radial-gradient(300px circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.10), transparent 60%)",
            }}
          />
        )}
        {children}
      </div>
    </div>
  );
}
