"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { useUIStore } from "@/lib/stores/ui-store";
import { cn } from "@/lib/utils";

/**
 * Ambient, mouse-responsive background: layered aurora + mesh gradients,
 * a subtle drifting particle field on canvas, and a noise overlay.
 * Honors reduced-motion and the user's ambient toggle.
 */
export function AmbientBackground({ className, particles = true }: { className?: string; particles?: boolean }) {
  const reduced = useReducedMotion();
  const ambient = useUIStore((s) => s.ambientEnabled);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  // Mouse-responsive glow
  useEffect(() => {
    if (reduced || !ambient) return;
    const el = glowRef.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${e.clientX}px`);
        el.style.setProperty("--my", `${e.clientY}px`);
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced, ambient]);

  // Drifting particle field
  useEffect(() => {
    if (reduced || !ambient || !particles) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const count = Math.min(90, Math.floor((w * h) / 22000));
    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      a: Math.random() * 0.5 + 0.1,
    }));

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147,197,253,${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [reduced, ambient, particles]);

  return (
    <div className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg", className)} aria-hidden>
      {/* Base mesh gradient */}
      <div className="absolute inset-0 mesh-gradient opacity-80" />
      {/* Aurora blobs */}
      {ambient && (
        <>
          <div className="absolute -left-40 -top-40 h-[40rem] w-[40rem] rounded-full bg-primary/20 blur-[120px] animate-float" style={{ animationDuration: "12s" }} />
          <div className="absolute -right-40 top-20 h-[36rem] w-[36rem] rounded-full bg-purple/20 blur-[120px] animate-float" style={{ animationDuration: "16s", animationDelay: "1s" }} />
          <div className="absolute bottom-[-10rem] left-1/3 h-[34rem] w-[34rem] rounded-full bg-green/15 blur-[120px] animate-float" style={{ animationDuration: "18s", animationDelay: "2s" }} />
        </>
      )}
      {/* Mouse-responsive glow */}
      {ambient && !reduced && (
        <div
          ref={glowRef}
          className="absolute inset-0 opacity-60 transition-opacity"
          style={{
            background:
              "radial-gradient(420px circle at var(--mx, 50%) var(--my, 30%), rgba(59,130,246,0.10), transparent 60%)",
          }}
        />
      )}
      {/* Particles */}
      {particles && ambient && !reduced && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-70" />}
      {/* Vignette + grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(3,7,18,0.7)_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
    </div>
  );
}
