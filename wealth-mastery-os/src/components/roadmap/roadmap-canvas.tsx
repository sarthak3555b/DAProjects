"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  useReactFlow,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Minus,
  Maximize2,
  Crosshair,
  Search,
  Focus,
  Presentation,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
} from "lucide-react";
import type { RoadmapNode as RoadmapNodeType, NodeStatus } from "@/lib/types";
import { roadmapPhases } from "@/lib/mock-data";
import { RoadmapNode } from "./roadmap-node";
import { useElkLayout, type RFNode } from "./use-elk-layout";
import { NodeDetailsDrawer } from "./node-details-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LoadingState } from "@/components/states";

const nodeTypes = { roadmap: RoadmapNode };

const statusColor: Record<NodeStatus, string> = {
  LOCKED: "#374151",
  AVAILABLE: "#64748b",
  IN_PROGRESS: "#3b82f6",
  COMPLETED: "#10b981",
};

const STATUS_FILTERS: NodeStatus[] = ["COMPLETED", "IN_PROGRESS", "AVAILABLE", "LOCKED"];

function Flow({
  roadmapNodes,
  rawEdges,
  initialNodeId,
}: {
  roadmapNodes: RoadmapNodeType[];
  rawEdges: { id: string; source: string; target: string }[];
  initialNodeId?: string;
}) {
  const layout = useElkLayout(roadmapNodes, rawEdges);
  const [nodes, setNodes, onNodesChange] = useNodesState<RFNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { zoomIn, zoomOut, fitView, setCenter, getNodes } = useReactFlow();

  const [selected, setSelected] = useState<RoadmapNodeType | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<Set<NodeStatus>>(new Set(STATUS_FILTERS));
  const [focusMode, setFocusMode] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Seed positioned nodes/edges once layout resolves
  useEffect(() => {
    if (layout.ready) {
      setNodes(layout.nodes);
      setEdges(layout.edges);
      requestAnimationFrame(() => fitView({ duration: 600, padding: 0.2 }));
    }
  }, [layout.ready, layout.nodes, layout.edges, setNodes, setEdges, fitView]);

  // Open drawer from deep link
  useEffect(() => {
    if (initialNodeId && layout.ready) {
      const n = roadmapNodes.find((r) => r.id === initialNodeId);
      if (n) {
        setSelected(n);
        setDrawerOpen(true);
        const ln = layout.nodes.find((x) => x.id === initialNodeId);
        if (ln) setCenter(ln.position.x + 128, ln.position.y + 70, { zoom: 1.2, duration: 800 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNodeId, layout.ready]);

  // Connected ids for dependency highlighting / focus mode
  const connectedIds = useMemo(() => {
    if (!selected) return null;
    const ids = new Set<string>([selected.id]);
    rawEdges.forEach((e) => {
      if (e.source === selected.id) ids.add(e.target);
      if (e.target === selected.id) ids.add(e.source);
    });
    return ids;
  }, [selected, rawEdges]);

  // Apply visual emphasis: search dim, filter dim, focus dim
  const displayNodes = useMemo<RFNode[]>(() => {
    return nodes.map((n) => {
      const data = (n.data as { node: RoadmapNodeType }).node;
      const matchesQuery = query ? data.title.toLowerCase().includes(query.toLowerCase()) || data.phase.toLowerCase().includes(query.toLowerCase()) : true;
      const matchesFilter = activeStatuses.has(data.status);
      const inFocus = focusMode && connectedIds ? connectedIds.has(n.id) : true;
      const dim = !matchesQuery || !matchesFilter || !inFocus;
      return {
        ...n,
        selected: selected?.id === n.id,
        style: { ...n.style, opacity: dim ? 0.18 : 1, transition: "opacity 0.3s ease" },
      };
    });
  }, [nodes, query, activeStatuses, focusMode, connectedIds, selected]);

  const displayEdges = useMemo<Edge[]>(() => {
    return edges.map((e) => {
      const highlight = selected && (e.source === selected.id || e.target === selected.id);
      return {
        ...e,
        animated: highlight ? true : e.animated,
        style: {
          ...e.style,
          opacity: selected && !highlight ? 0.12 : 1,
          stroke: highlight ? "#93c5fd" : (e.style?.stroke as string),
          strokeWidth: highlight ? 2.5 : (e.style?.strokeWidth as number),
          transition: "opacity 0.3s ease",
        },
      };
    });
  }, [edges, selected]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const data = (node.data as { node: RoadmapNodeType }).node;
    setSelected(data);
    setDrawerOpen(true);
  }, []);

  const centerCurrent = useCallback(() => {
    const current = roadmapNodes.find((n) => n.status === "IN_PROGRESS");
    const ln = getNodes().find((x) => x.id === current?.id);
    if (ln) setCenter(ln.position.x + 128, ln.position.y + 70, { zoom: 1.15, duration: 800 });
  }, [getNodes, roadmapNodes, setCenter]);

  const goToPhase = useCallback(
    (idx: number) => {
      const phase = roadmapPhases[idx];
      const phaseNodes = getNodes().filter((n) => (n.data as { node: RoadmapNodeType }).node.phase === phase);
      if (!phaseNodes.length) return;
      const xs = phaseNodes.map((n) => n.position.x);
      const ys = phaseNodes.map((n) => n.position.y);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2 + 128;
      const cy = (Math.min(...ys) + Math.max(...ys)) / 2 + 70;
      setCenter(cx, cy, { zoom: 1.1, duration: 900 });
    },
    [getNodes, setCenter],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "f") setFocusMode((v) => !v);
      if (e.key === "p") {
        setPresenting((v) => !v);
        if (!presenting) goToPhase(0);
      }
      if (e.key === "Escape") {
        setPresenting(false);
        setFocusMode(false);
        setSelected(null);
      }
      if (e.key === "+" || e.key === "=") zoomIn({ duration: 200 });
      if (e.key === "-") zoomOut({ duration: 200 });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [presenting, goToPhase, zoomIn, zoomOut]);

  const toggleStatus = (s: NodeStatus) => {
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  if (!layout.ready) {
    return (
      <div className="grid h-full place-items-center">
        <LoadingState label="Computing your roadmap" />
      </div>
    );
  }

  return (
    <>
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={() => setSelected(null)}
        fitView
        minZoom={0.25}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesFocusable
        className="bg-transparent"
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1.4} color="rgba(148,163,184,0.18)" />

        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => statusColor[(n.data as { node: RoadmapNodeType }).node.status]}
          nodeStrokeWidth={0}
          maskColor="rgba(3,7,18,0.7)"
          className="!bottom-4 !right-4 !rounded-xl !border !border-white/10 !bg-card/70 !backdrop-blur-xl"
          style={{ width: 180, height: 120 }}
        />

        {/* Top-left: search + filters */}
        <Panel position="top-left" className="!m-3 flex flex-col gap-2">
          <div className="flex w-72 max-w-[78vw] items-center gap-2 rounded-xl border border-white/10 bg-card/70 px-3 py-2 backdrop-blur-xl">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search modules…"
              aria-label="Search roadmap"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search" className="text-muted-foreground hover:text-foreground">
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="relative">
            <Button variant="secondary" size="sm" onClick={() => setShowFilters((v) => !v)} className="gap-1.5">
              <Filter className="size-3.5" /> Filters
              <Badge variant="primary" className="ml-1 px-1.5 py-0">{activeStatuses.size}</Badge>
            </Button>
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute z-10 mt-2 w-48 rounded-xl border border-white/10 bg-card/90 p-1.5 backdrop-blur-xl"
                >
                  {STATUS_FILTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleStatus(s)}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-white/5"
                    >
                      <span className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ background: statusColor[s] }} />
                        {s.replace("_", " ").toLowerCase()}
                      </span>
                      {activeStatuses.has(s) && <Check className="size-3.5 text-primary" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Panel>

        {/* Top-right: modes */}
        <Panel position="top-right" className="!m-3 flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={focusMode ? "primary" : "secondary"} size="icon-sm" aria-label="Focus mode" aria-pressed={focusMode} onClick={() => setFocusMode((v) => !v)}>
                <Focus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Focus mode (F)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={presenting ? "primary" : "secondary"}
                size="icon-sm"
                aria-label="Presentation mode"
                aria-pressed={presenting}
                onClick={() => {
                  setPresenting((v) => !v);
                  if (!presenting) {
                    setPhaseIndex(0);
                    goToPhase(0);
                  }
                }}
              >
                <Presentation className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Presentation (P)</TooltipContent>
          </Tooltip>
        </Panel>

        {/* Bottom-left: zoom controls */}
        <Panel position="bottom-left" className="!m-3">
          <div className="flex flex-col gap-1 rounded-xl border border-white/10 bg-card/70 p-1 backdrop-blur-xl">
            <Button variant="ghost" size="icon-sm" aria-label="Zoom in" onClick={() => zoomIn({ duration: 200 })}><Plus className="size-4" /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Zoom out" onClick={() => zoomOut({ duration: 200 })}><Minus className="size-4" /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Fit view" onClick={() => fitView({ duration: 600, padding: 0.2 })}><Maximize2 className="size-4" /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Center current module" onClick={centerCurrent}><Crosshair className="size-4" /></Button>
          </div>
        </Panel>
      </ReactFlow>

      {/* Presentation overlay */}
      <AnimatePresence>
        {presenting && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="pointer-events-auto absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/10 bg-card/90 px-4 py-3 shadow-glow-lg backdrop-blur-2xl"
          >
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Previous phase"
              disabled={phaseIndex === 0}
              onClick={() => {
                const i = Math.max(0, phaseIndex - 1);
                setPhaseIndex(i);
                goToPhase(i);
              }}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="min-w-44 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Phase {phaseIndex + 1} of {roadmapPhases.length}
              </p>
              <p className="font-display text-sm font-semibold">{roadmapPhases[phaseIndex]}</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Next phase"
              disabled={phaseIndex === roadmapPhases.length - 1}
              onClick={() => {
                const i = Math.min(roadmapPhases.length - 1, phaseIndex + 1);
                setPhaseIndex(i);
                goToPhase(i);
              }}
            >
              <ChevronRight className="size-4" />
            </Button>
            <span className="mx-1 h-6 w-px bg-border" />
            <Button variant="ghost" size="icon-sm" aria-label="Exit presentation" onClick={() => setPresenting(false)}>
              <X className="size-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <NodeDetailsDrawer node={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}

export function RoadmapCanvas(props: {
  roadmapNodes: RoadmapNodeType[];
  rawEdges: { id: string; source: string; target: string }[];
  initialNodeId?: string;
}) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}
