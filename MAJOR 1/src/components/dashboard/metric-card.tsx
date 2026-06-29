"use client";

import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { TiltCard } from "@/components/fx/tilt-card";
import { AnimatedCounter } from "@/components/fx/animated-counter";
import { cn } from "@/lib/utils";

export interface Metric {
  label: string;
  value: number;
  display?: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  icon: LucideIcon;
  accent: "primary" | "green" | "orange" | "purple" | "red" | "cyan";
  trend?: number;
  spark?: number[];
}

const accentMap = {
  primary: { text: "text-primary", glow: "bg-primary/20", stroke: "#3b82f6" },
  green: { text: "text-green", glow: "bg-green/20", stroke: "#10b981" },
  orange: { text: "text-orange", glow: "bg-orange/20", stroke: "#f59e0b" },
  purple: { text: "text-purple", glow: "bg-purple/20", stroke: "#8b5cf6" },
  red: { text: "text-red", glow: "bg-red/20", stroke: "#ef4444" },
  cyan: { text: "text-cyan-400", glow: "bg-cyan-400/20", stroke: "#22d3ee" },
} as const;

function Sparkline({ data, stroke }: { data: number[]; stroke: string }) {
  if (!data.length) return null;
  const w = 96;
  const h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / range) * h]);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${d} L${w},${h} L0,${h} Z`;
  const id = `spark-${stroke.replace("#", "")}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MetricCard({ metric }: { metric: Metric }) {
  const a = accentMap[metric.accent];
  const up = (metric.trend ?? 0) >= 0;
  return (
    <TiltCard intensity={6}>
      <div className="group relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/50 p-5 backdrop-blur-xl transition-colors hover:border-white/15">
        <div className={cn("absolute -right-6 -top-6 size-24 rounded-full blur-2xl opacity-50 transition-opacity duration-300 group-hover:opacity-90", a.glow)} />
        <div className="relative flex items-start justify-between">
          <div className={cn("flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5", a.text)}>
            <metric.icon className="size-5" />
          </div>
          {metric.trend !== undefined && (
            <span className={cn("flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium", up ? "text-green" : "text-red")}>
              {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {Math.abs(metric.trend)}%
            </span>
          )}
        </div>
        <div className="relative mt-4">
          <p className="font-display text-2xl font-bold tracking-tight sm:text-[1.7rem]">
            {metric.display ?? (
              <AnimatedCounter value={metric.value} decimals={metric.decimals} prefix={metric.prefix} suffix={metric.suffix} />
            )}
          </p>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{metric.label}</p>
        </div>
        {metric.spark && (
          <div className="relative mt-3 flex justify-end">
            <Sparkline data={metric.spark} stroke={a.stroke} />
          </div>
        )}
      </div>
    </TiltCard>
  );
}
