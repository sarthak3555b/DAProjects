"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { knowledgeRadar } from "@/lib/mock-data";
import { ChartTooltip, chartPalette } from "./chart-kit";

export function KnowledgeRadar() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={knowledgeRadar} outerRadius="72%">
        <defs>
          <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartPalette.purple} stopOpacity={0.5} />
            <stop offset="100%" stopColor={chartPalette.primary} stopOpacity={0.25} />
          </linearGradient>
        </defs>
        <PolarGrid stroke={chartPalette.grid} />
        <PolarAngleAxis dataKey="axis" tick={{ fill: chartPalette.axis, fontSize: 11 }} />
        <Tooltip content={<ChartTooltip unit="%" />} />
        <Radar
          dataKey="value"
          stroke={chartPalette.purple}
          strokeWidth={2}
          fill="url(#radarFill)"
          animationDuration={1200}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
