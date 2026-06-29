"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BookOpen,
  Compass,
  FolderCheck,
  Flame,
  GraduationCap,
  Clock,
  Layers,
  LineChart as LineChartIcon,
  Radar as RadarIcon,
  Sparkles,
  CalendarRange,
} from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import { currentUser, roadmapPhases } from "@/lib/mock-data";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/fx/reveal";
import { MetricCard, type Metric } from "@/components/dashboard/metric-card";
import { Panel } from "@/components/dashboard/panel";
import {
  ActivityFeed,
  GoalsCard,
  NextActionCard,
  RecommendedLearning,
  WelcomeBanner,
} from "@/components/dashboard/dashboard-sections";
import {
  LazyContributionHeatmap,
  LazyKnowledgeRadar,
  LazyVelocityChart,
} from "@/components/charts/lazy";
import { ErrorState, EmptyState } from "@/components/states";

const metrics: Metric[] = [
  { label: "Current Phase", value: 4, display: "Phase 4", icon: Compass, accent: "primary", trend: 0, spark: [1, 2, 2, 3, 3, 4, 4] },
  { label: "Assessment Score", value: 92, suffix: "%", icon: GraduationCap, accent: "green", trend: 6, spark: [70, 74, 80, 78, 85, 88, 92] },
  { label: "Resources Read", value: 24, icon: BookOpen, accent: "purple", trend: 12, spark: [8, 11, 14, 16, 19, 22, 24] },
  { label: "Projects Completed", value: 8, icon: FolderCheck, accent: "orange", trend: 4, spark: [2, 3, 4, 5, 6, 7, 8] },
  { label: "Hours Studied", value: 146, icon: Clock, accent: "cyan", trend: 18, spark: [90, 102, 112, 120, 130, 138, 146] },
  { label: "Current Streak", value: currentUser.streak, suffix: "d", icon: Flame, accent: "red", trend: 8, spark: [12, 15, 18, 20, 23, 25, 27] },
];

export default function DashboardPage() {
  const activity = useQuery({ queryKey: queryKeys.activity, queryFn: api.activity });
  const goals = useQuery({ queryKey: queryKeys.goals, queryFn: api.goals });
  const resources = useQuery({ queryKey: queryKeys.resources, queryFn: api.resources });

  const recommended = resources.data?.filter((r) => r.progress === 0).slice(0, 4) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Your wealth operating system"
        description="Momentum, mastery, and the next best move — at a glance."
        actions={
          <>
            <Button variant="secondary" size="sm" asChild>
              <a href="/analytics"><LineChartIcon /> Analytics</a>
            </Button>
            <Button variant="gradient" size="sm" asChild>
              <a href="/ai-mentor"><Sparkles /> Ask Mentor</a>
            </Button>
          </>
        }
      />

      <Reveal>
        <WelcomeBanner name={currentUser.name} streak={currentUser.streak} />
      </Reveal>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map((m, i) => (
          <Reveal key={m.label} delay={i % 6}>
            <MetricCard metric={m} />
          </Reveal>
        ))}
      </div>

      {/* Primary bento */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Panel title="Learning Velocity" subtitle="XP earned per week" icon={<LineChartIcon className="size-4" />} href="/analytics" className="h-full">
            <div className="h-[260px] w-full">
              <LazyVelocityChart />
            </div>
          </Panel>
        </Reveal>

        <div className="grid gap-4">
          <Reveal>
            <NextActionCard />
          </Reveal>
          <Reveal>
            <Panel title="Goals" subtitle="Weekly · Monthly · Yearly" icon={<CalendarRange className="size-4" />}>
              {goals.status === "pending" && <Skeleton className="h-24 w-full" />}
              {goals.status === "error" && <ErrorState onRetry={() => goals.refetch()} />}
              {goals.status === "success" && <GoalsCard goals={goals.data} />}
            </Panel>
          </Reveal>
        </div>
      </div>

      {/* Secondary bento */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Panel title="Contribution Heatmap" subtitle="Your consistency over time" icon={<Activity className="size-4" />} className="h-full">
            <LazyContributionHeatmap />
            <div className="mt-5 border-t border-border/50 pt-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Layers className="size-3.5" /> Completion timeline
              </p>
              <ol className="relative ml-1 space-y-2.5 border-l border-border/60 pl-4">
                {roadmapPhases.map((p, i) => {
                  const done = i < 3;
                  const active = i === 3;
                  return (
                    <li key={p} className="relative">
                      <span
                        className={`absolute -left-[21px] top-1 size-2.5 rounded-full ${
                          done ? "bg-green" : active ? "bg-primary animate-pulse-glow" : "bg-white/15"
                        }`}
                      />
                      <span className={`text-sm ${done ? "text-muted-foreground line-through" : active ? "font-medium text-foreground" : "text-muted-foreground/60"}`}>
                        {p}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </Panel>
        </Reveal>

        <Reveal>
          <Panel title="Knowledge Radar" subtitle="Mastery by domain" icon={<RadarIcon className="size-4" />} className="h-full" href="/knowledge-graph">
            <div className="h-[260px] w-full">
              <LazyKnowledgeRadar />
            </div>
          </Panel>
        </Reveal>
      </div>

      {/* Tertiary */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <Panel title="Recent Activity" icon={<Activity className="size-4" />} className="h-full">
            {activity.status === "pending" && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="size-8 rounded-lg" />
                    <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-2/3" /><Skeleton className="h-3 w-1/3" /></div>
                  </div>
                ))}
              </div>
            )}
            {activity.status === "error" && <ErrorState onRetry={() => activity.refetch()} />}
            {activity.status === "success" &&
              (activity.data.length ? <ActivityFeed items={activity.data} /> : <EmptyState />)}
          </Panel>
        </Reveal>

        <Reveal>
          <Panel title="Recommended for you" subtitle="Curated from your roadmap" icon={<BookOpen className="size-4" />} className="h-full" href="/resources">
            {resources.status === "pending" && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="size-10 rounded-lg" />
                    <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>
                  </div>
                ))}
              </div>
            )}
            {resources.status === "error" && <ErrorState onRetry={() => resources.refetch()} />}
            {resources.status === "success" &&
              (recommended.length ? <RecommendedLearning items={recommended} /> : <EmptyState title="All caught up" description="You've started every recommended resource." />)}
          </Panel>
        </Reveal>
      </div>
    </div>
  );
}
