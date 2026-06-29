"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { learningVelocity } from "@/lib/mock-data";
import { ChartTooltip, chartPalette } from "./chart-kit";

export function VelocityChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={learningVelocity} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartPalette.primary} stopOpacity={0.55} />
            <stop offset="100%" stopColor={chartPalette.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="xpStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={chartPalette.primary} />
            <stop offset="100%" stopColor={chartPalette.purple} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={chartPalette.grid} vertical={false} />
        <XAxis dataKey="week" stroke={chartPalette.axis} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={chartPalette.axis} fontSize={11} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<ChartTooltip unit=" XP" />} cursor={{ stroke: chartPalette.grid }} />
        <Area
          type="monotone"
          dataKey="xp"
          stroke="url(#xpStroke)"
          strokeWidth={2.5}
          fill="url(#xpFill)"
          dot={false}
          activeDot={{ r: 4, fill: chartPalette.primary, stroke: "#fff", strokeWidth: 1.5 }}
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
