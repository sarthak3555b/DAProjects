"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const fallback = () => <Skeleton className="size-full min-h-[160px]" />;

export const LazyVelocityChart = dynamic(
  () => import("./velocity-chart").then((m) => m.VelocityChart),
  { ssr: false, loading: fallback },
);

export const LazyKnowledgeRadar = dynamic(
  () => import("./radar-chart").then((m) => m.KnowledgeRadar),
  { ssr: false, loading: fallback },
);

export const LazyContributionHeatmap = dynamic(
  () => import("./contribution-heatmap").then((m) => m.ContributionHeatmap),
  { ssr: false, loading: fallback },
);

export const LazyTreemap = dynamic(
  () => import("./allocation-treemap").then((m) => m.AllocationTreemap),
  { ssr: false, loading: fallback },
);

export const LazySunburst = dynamic(
  () => import("./sunburst-chart").then((m) => m.SunburstChart),
  { ssr: false, loading: fallback },
);

export const LazyCapitalSimulator = dynamic(
  () => import("./capital-simulator").then((m) => m.CapitalSimulator),
  { ssr: false, loading: fallback },
);
