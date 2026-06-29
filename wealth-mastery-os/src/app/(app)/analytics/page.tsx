"use client";

import {
  Activity, LineChart as LineChartIcon, Radar as RadarIcon, PieChart,
  Boxes, SlidersHorizontal, TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Panel } from "@/components/dashboard/panel";
import { Reveal } from "@/components/fx/reveal";
import { AnimatedCounter } from "@/components/fx/animated-counter";
import {
  LazyVelocityChart, LazyKnowledgeRadar, LazyContributionHeatmap,
  LazyTreemap, LazySunburst, LazyCapitalSimulator,
} from "@/components/charts/lazy";

const kpis = [
  { label: "Total XP", value: 8420, suffix: "", icon: TrendingUp, color: "text-primary" },
  { label: "Avg. session", value: 38, suffix: "m", icon: Activity, color: "text-green" },
  { label: "Mastery index", value: 61, suffix: "%", icon: RadarIcon, color: "text-purple" },
  { label: "Consistency", value: 84, suffix: "%", icon: LineChartIcon, color: "text-orange" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Your mastery, instrumented"
        description="A terminal-grade view of momentum, knowledge distribution, and capital strategy."
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={i}>
            <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/40 p-4 backdrop-blur-xl">
              <span className={`flex size-10 items-center justify-center rounded-xl bg-white/5 ${k.color}`}><k.icon className="size-5" /></span>
              <div>
                <p className="font-display text-xl font-bold"><AnimatedCounter value={k.value} suffix={k.suffix} /></p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Panel title="Learning Velocity" subtitle="XP / week" icon={<LineChartIcon className="size-4" />} className="h-full">
            <div className="h-[280px]"><LazyVelocityChart /></div>
          </Panel>
        </Reveal>
        <Reveal>
          <Panel title="Knowledge Radar" subtitle="Mastery by domain" icon={<RadarIcon className="size-4" />} className="h-full">
            <div className="h-[280px]"><LazyKnowledgeRadar /></div>
          </Panel>
        </Reveal>
      </div>

      <Reveal>
        <Panel title="Consistency Heatmap" subtitle="Sessions over the last 18 weeks" icon={<Activity className="size-4" />}>
          <LazyContributionHeatmap />
        </Panel>
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <Panel title="Capital Allocation" subtitle="Asset distribution (treemap)" icon={<Boxes className="size-4" />} className="h-full">
            <div className="h-[320px]"><LazyTreemap /></div>
          </Panel>
        </Reveal>
        <Reveal>
          <Panel title="Knowledge Distribution" subtitle="Domains & subtopics (sunburst)" icon={<PieChart className="size-4" />} className="h-full">
            <div className="h-[320px]"><LazySunburst /></div>
          </Panel>
        </Reveal>
      </div>

      <Reveal>
        <Panel title="Capital Allocation Simulator" subtitle="Model a portfolio and project its compounding path" icon={<SlidersHorizontal className="size-4" />}>
          <LazyCapitalSimulator />
        </Panel>
      </Reveal>
    </div>
  );
}
