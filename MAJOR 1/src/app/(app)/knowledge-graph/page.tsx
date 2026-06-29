"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Search, Tag, GitBranch, Box, Layers, X, Sparkles } from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ErrorState, LoadingState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/lib/hooks";
import { KnowledgeGraph2D, domainColor } from "@/components/knowledge/graph-2d";
import type { Domain } from "@/lib/types";

const KnowledgeGraph3D = dynamic(() => import("@/components/knowledge/graph-3d"), {
  ssr: false,
  loading: () => <LoadingState label="Entering the 3D universe" />,
});

export default function KnowledgeGraphPage() {
  const online = useOnlineStatus();
  const { data, status, refetch } = useQuery({ queryKey: queryKeys.concepts, queryFn: api.concepts });

  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [query, setQuery] = useState("");
  const [showLabels, setShowLabels] = useState(true);
  const [showDeps, setShowDeps] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = data?.find((c) => c.id === selectedId) ?? null;
  const domains = data ? (Array.from(new Set(data.map((c) => c.domain))) as Domain[]) : [];

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] flex-col">
      <PageHeader
        eyebrow="Knowledge Graph"
        title="A galaxy of connected ideas"
        description="Concepts are stars; dependencies are constellations. Search, focus, and fly between ideas."
        actions={
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-card/50 p-1">
            <Button variant={mode === "2d" ? "primary" : "ghost"} size="sm" onClick={() => setMode("2d")}>
              <Layers className="size-4" /> 2D
            </Button>
            <Button variant={mode === "3d" ? "primary" : "ghost"} size="sm" onClick={() => setMode("3d")}>
              <Box className="size-4" /> 3D
            </Button>
          </div>
        }
      />

      <div className="relative flex flex-1 gap-4 overflow-hidden">
        {/* Graph canvas */}
        <div className="relative flex-1 overflow-hidden rounded-2xl border border-border/70 bg-surface/20">
          <div className="pointer-events-none absolute inset-0 mesh-gradient opacity-30" aria-hidden />

          {/* Controls overlay (2D only) */}
          {mode === "2d" && status === "success" && (
            <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
              <div className="flex w-64 max-w-[70vw] items-center gap-2 rounded-xl border border-white/10 bg-card/70 px-3 py-2 backdrop-blur-xl">
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search concepts…"
                  aria-label="Search concepts"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                {query && <button onClick={() => setQuery("")} aria-label="Clear"><X className="size-3.5 text-muted-foreground" /></button>}
              </div>
              <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-card/70 p-3 text-sm backdrop-blur-xl">
                <label className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-muted-foreground"><Tag className="size-3.5" /> Labels</span>
                  <Switch checked={showLabels} onCheckedChange={setShowLabels} />
                </label>
                <label className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-muted-foreground"><GitBranch className="size-3.5" /> Dependencies</span>
                  <Switch checked={showDeps} onCheckedChange={setShowDeps} />
                </label>
              </div>
            </div>
          )}

          {/* Legend */}
          {status === "success" && (
            <div className="absolute bottom-3 left-3 z-10 flex max-w-[80%] flex-wrap gap-x-3 gap-y-1.5 rounded-xl border border-white/10 bg-card/70 px-3 py-2 backdrop-blur-xl">
              {domains.map((d) => (
                <span key={d} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="size-2.5 rounded-full" style={{ background: domainColor[d] }} />
                  {d}
                </span>
              ))}
            </div>
          )}

          {!online && status !== "success" ? (
            <div className="grid h-full place-items-center"><OfflineState /></div>
          ) : status === "pending" ? (
            <div className="grid h-full place-items-center"><LoadingState label="Mapping the universe" /></div>
          ) : status === "error" ? (
            <div className="grid h-full place-items-center"><ErrorState onRetry={() => refetch()} /></div>
          ) : mode === "2d" ? (
            <KnowledgeGraph2D
              concepts={data}
              query={query}
              showLabels={showLabels}
              showDeps={showDeps}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          ) : (
            <KnowledgeGraph3D concepts={data} selectedId={selectedId} onSelect={setSelectedId} />
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selected && (
            <motion.aside
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="absolute right-0 top-0 z-20 h-full w-full max-w-xs overflow-hidden rounded-2xl border border-white/10 bg-card/90 p-5 backdrop-blur-2xl sm:relative sm:max-w-[320px]"
            >
              <button onClick={() => setSelectedId(null)} aria-label="Close" className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
              <span className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl" style={{ background: `${domainColor[selected.domain]}22`, color: domainColor[selected.domain] }}>
                <Sparkles className="size-6" />
              </span>
              <Badge variant="outline" className="mb-2">{selected.domain}</Badge>
              <h3 className="font-display text-xl font-bold">{selected.label}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{selected.definition}</p>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Mastery</span><span>{selected.mastery}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-purple" style={{ width: `${selected.mastery}%` }} />
                </div>
              </div>
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Connected concepts</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.connections.map((id) => {
                    const c = data?.find((x) => x.id === id);
                    if (!c) return null;
                    return (
                      <button key={id} onClick={() => setSelectedId(id)} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs transition-colors hover:bg-white/10">
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
