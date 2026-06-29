"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { Keyboard } from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import { roadmapPhases } from "@/lib/mock-data";
import { PageHeader } from "@/components/shell/page-header";
import { ErrorState, LoadingState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/lib/hooks";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const RoadmapCanvas = dynamic(
  () => import("@/components/roadmap/roadmap-canvas").then((m) => m.RoadmapCanvas),
  { ssr: false, loading: () => <LoadingState label="Loading roadmap" /> },
);

const legend = [
  { label: "Completed", color: "#10b981" },
  { label: "In Progress", color: "#3b82f6" },
  { label: "Available", color: "#64748b" },
  { label: "Locked", color: "#374151" },
];

function RoadmapView() {
  const params = useSearchParams();
  const nodeId = params.get("node") ?? undefined;
  const online = useOnlineStatus();
  const { data, status, refetch } = useQuery({ queryKey: queryKeys.roadmap, queryFn: api.roadmap });

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] flex-col">
      <PageHeader
        eyebrow="Roadmap"
        title="Your mastery universe"
        description="A living, spatial map of everything you'll master — navigate, focus, and present."
        actions={
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="hidden items-center gap-2 rounded-xl border border-white/10 bg-card/50 px-3 py-2 text-xs text-muted-foreground md:flex">
                <Keyboard className="size-3.5" />
                <kbd className="font-mono">F</kbd> focus · <kbd className="font-mono">P</kbd> present · <kbd className="font-mono">+/-</kbd> zoom
              </span>
            </TooltipTrigger>
            <TooltipContent>Keyboard shortcuts</TooltipContent>
          </Tooltip>
        }
      />

      {/* Legend */}
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {legend.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2.5 rounded-full" style={{ background: l.color, boxShadow: `0 0 8px ${l.color}55` }} />
            {l.label}
          </span>
        ))}
        <span className="ml-auto hidden text-xs text-muted-foreground sm:block">
          {roadmapPhases.length} phases · navigate with scroll & drag
        </span>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 overflow-hidden rounded-2xl border border-border/70 bg-surface/20 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-0 mesh-gradient opacity-30" aria-hidden />
        {!online && status !== "success" ? (
          <div className="grid h-full place-items-center"><OfflineState /></div>
        ) : status === "pending" ? (
          <div className="grid h-full place-items-center"><LoadingState label="Computing your roadmap" /></div>
        ) : status === "error" ? (
          <div className="grid h-full place-items-center"><ErrorState onRetry={() => refetch()} /></div>
        ) : (
          <RoadmapCanvas roadmapNodes={data.nodes} rawEdges={data.edges} initialNodeId={nodeId} />
        )}
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading roadmap" />}>
      <RoadmapView />
    </Suspense>
  );
}
