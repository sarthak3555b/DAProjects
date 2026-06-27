"use client";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

const C = {
  learning: "hsl(217 91% 60%)", completed: "hsl(142 71% 45%)", current: "hsl(25 95% 53%)",
  project: "hsl(271 81% 66%)", analytics: "hsl(187 85% 53%)", border: "hsl(220 14% 20%)",
};

export function ProgressRing({ pct, label, sub }: { pct: number; label?: string; sub?: string }) {
  const size = 140, sw = 12, r = (size - sw) / 2, circ = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={sw} />
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={C.learning} /><stop offset="100%" stopColor={C.project} />
          </linearGradient>
        </defs>
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ring)" strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ * (1 - Math.min(1, pct / 100)) }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-extrabold">{Math.round(pct)}%</span>
        {sub && <span className="text-[11px] text-muted">{sub}</span>}
      </div>
    </div>
  );
}

export function ActivityBars({ data }: { data: { label: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 10, right: 0, left: -22, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fill: "hsl(var(--faint))", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "hsl(var(--faint))", fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={{ background: "hsl(var(--panel))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }} />
        <Bar dataKey="value" fill={C.learning} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function VelocityArea({ data }: { data: { label: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 10, right: 4, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="vel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.completed} stopOpacity={0.4} /><stop offset="100%" stopColor={C.completed} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "hsl(var(--faint))", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "hsl(var(--faint))", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ background: "hsl(var(--panel))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }} />
        <Area type="monotone" dataKey="value" stroke={C.completed} strokeWidth={2.5} fill="url(#vel)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SkillRadar({ data }: { data: { label: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="label" tick={{ fill: "hsl(var(--muted))", fontSize: 10 }} />
        <Radar dataKey="value" stroke={C.learning} fill={C.learning} fillOpacity={0.35} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function Heatmap({ activity, weeks = 26 }: { activity: Record<string, number>; weeks?: number }) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - (weeks * 7 - 1));
  start.setDate(start.getDate() - start.getDay());
  const key = (d: Date) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const cells: { date: string; mins: number; future: boolean }[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    cells.push({ date: key(d), mins: activity[key(d)] || 0, future: d > today });
  }
  const level = (m: number) => (m === 0 ? 0 : m >= 120 ? 4 : m >= 60 ? 3 : m >= 30 ? 2 : 1);
  const colors = ["hsl(var(--border)/0.5)", "hsl(142 71% 45% / 0.35)", "hsl(142 71% 45% / 0.55)", "hsl(142 71% 45% / 0.78)", "hsl(142 71% 45%)"];
  return (
    <div className="overflow-x-auto pb-1">
      <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
        {cells.map((c, i) => (
          <div key={i} title={`${c.date}: ${c.mins} min`} className="h-3 w-3 rounded-[3px]"
            style={{ background: colors[level(c.mins)], visibility: c.future ? "hidden" : "visible" }} />
        ))}
      </div>
    </div>
  );
}
