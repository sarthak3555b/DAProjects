"use client";

/**
 * Shared chart primitives + a consistent premium tooltip and theme palette.
 * All charts are client-only and use ResponsiveContainer so they adapt to any
 * viewport (320 → 2560) without overflow.
 */

export const chartPalette = {
  primary: "#3b82f6",
  green: "#10b981",
  orange: "#f59e0b",
  purple: "#8b5cf6",
  red: "#ef4444",
  cyan: "#22d3ee",
  grid: "rgba(255,255,255,0.06)",
  axis: "#64748b",
};

export function ChartTooltip({
  active,
  payload,
  label,
  unit = "",
}: {
  active?: boolean;
  payload?: { name?: string; value?: number | string; color?: string; dataKey?: string }[];
  label?: string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-card/95 px-3 py-2 text-xs shadow-glow-lg backdrop-blur-xl">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      <div className="space-y-0.5">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: p.color }} />
            <span className="capitalize text-muted-foreground">{p.name ?? p.dataKey}</span>
            <span className="ml-auto font-semibold text-foreground">
              {p.value}
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
