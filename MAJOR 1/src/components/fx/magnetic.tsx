"use client";

import * as React from "react";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/** Magnetic wrapper — element gently follows the cursor when hovered. */
export function Magnetic({
  children,
  className,
  strength = 0.35,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const y = (e.clientY - (rect.top + rect.height / 2)) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate(0px, 0px)";
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={cn("inline-flex transition-transform duration-300 ease-out will-change-transform", className)}
    >
      {children}
    </div>
  );
}
