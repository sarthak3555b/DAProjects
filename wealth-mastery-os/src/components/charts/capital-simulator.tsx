"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact } from "@/lib/utils";
import { ChartTooltip, chartPalette } from "./chart-kit";

type Asset = { key: string; label: string; color: string; ret: number; vol: number };

const ASSETS: Asset[] = [
  { key: "equities", label: "Equities", color: chartPalette.primary, ret: 0.09, vol: 0.16 },
  { key: "bonds", label: "Bonds", color: chartPalette.purple, ret: 0.04, vol: 0.05 },
  { key: "real", label: "Real Assets", color: chartPalette.green, ret: 0.06, vol: 0.11 },
  { key: "cash", label: "Cash", color: chartPalette.cyan, ret: 0.02, vol: 0.01 },
];

export function CapitalSimulator() {
  const [alloc, setAlloc] = useState<Record<string, number>>({
    equities: 50,
    bonds: 25,
    real: 18,
    cash: 7,
  });
  const [principal, setPrincipal] = useState(25000);
  const [years] = useState(20);

  const total = Object.values(alloc).reduce((a, b) => a + b, 0);

  const { expReturn, expVol, series } = useMemo(() => {
    const weights = ASSETS.map((a) => (total > 0 ? alloc[a.key] / total : 0));
    const expReturn = ASSETS.reduce((acc, a, i) => acc + weights[i] * a.ret, 0);
    const expVol = Math.sqrt(ASSETS.reduce((acc, a, i) => acc + (weights[i] * a.vol) ** 2, 0));
    const series = Array.from({ length: years + 1 }, (_, y) => {
      const base = principal * Math.pow(1 + expReturn, y);
      const up = principal * Math.pow(1 + expReturn + expVol * 0.5, y);
      const down = principal * Math.pow(1 + Math.max(expReturn - expVol * 0.5, 0), y);
      return { year: `Y${y}`, base: Math.round(base), up: Math.round(up), down: Math.round(down) };
    });
    return { expReturn, expVol, series };
  }, [alloc, principal, total, years]);

  const final = series[series.length - 1].base;

  const update = (key: string, value: number) => setAlloc((a) => ({ ...a, [key]: value }));

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Controls */}
      <div className="space-y-4">
        <div>
          <label className="flex items-center justify-between text-xs text-muted-foreground">
            Starting capital
            <span className="font-mono font-semibold text-foreground">${formatCompact(principal)}</span>
          </label>
          <input
            type="range"
            min={1000}
            max={250000}
            step={1000}
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            aria-label="Starting capital"
            className="mt-2 w-full accent-[var(--color-primary)]"
          />
        </div>

        <div className="space-y-3">
          {ASSETS.map((a) => (
            <div key={a.key}>
              <label className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ background: a.color }} />
                  {a.label}
                </span>
                <span className="font-mono font-semibold text-foreground">{Math.round((alloc[a.key] / total) * 100)}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={alloc[a.key]}
                onChange={(e) => update(a.key, Number(e.target.value))}
                aria-label={`${a.label} allocation`}
                className="mt-1.5 w-full"
                style={{ accentColor: a.color }}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Exp. return</p>
            <p className="font-display text-lg font-bold text-green">{(expReturn * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Volatility</p>
            <p className="font-display text-lg font-bold text-orange">{(expVol * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Projection */}
      <div className="flex flex-col">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-sm text-muted-foreground">Projected in {years} years</p>
          <p className="font-display text-2xl font-bold gradient-text">${formatCompact(final)}</p>
        </div>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartPalette.primary} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={chartPalette.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={chartPalette.grid} vertical={false} />
              <XAxis dataKey="year" stroke={chartPalette.axis} fontSize={11} tickLine={false} axisLine={false} interval={3} />
              <YAxis stroke={chartPalette.axis} fontSize={11} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => `$${formatCompact(v)}`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="up" stroke="none" fill="url(#bandFill)" animationDuration={800} />
              <Area type="monotone" dataKey="down" stroke="none" fill="#030712" fillOpacity={1} animationDuration={800} />
              <Area type="monotone" dataKey="base" stroke={chartPalette.primary} strokeWidth={2.5} fill="none" dot={false} animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
