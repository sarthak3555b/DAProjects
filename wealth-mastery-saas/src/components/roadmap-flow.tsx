"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ReactFlow, {
  Background, Controls, MiniMap, useNodesState, useEdgesState,
  type Node, type Edge, Handle, Position, BackgroundVariant, ReactFlowProvider,
} from "reactflow";
import dagre from "dagre";
import { Search, Maximize2, Crosshair } from "lucide-react";

export type RoadmapNode = {
  id: string; slug: string; title: string; phaseCode: string; phaseTitle: string;
  moduleName: string; difficulty: string; hours: number; status: string; current?: boolean; color: string;
};

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: "hsl(142 71% 45%)", IN_PROGRESS: "hsl(217 91% 60%)", AVAILABLE: "hsl(217 91% 60%)",
  LOCKED: "hsl(220 10% 46%)", CURRENT: "hsl(25 95% 53%)",
};

function RoadmapNodeCard({ data }: { data: RoadmapNode & { dimmed?: boolean; highlighted?: boolean } }) {
  const color = data.current ? STATUS_COLOR.CURRENT : STATUS_COLOR[data.status] || STATUS_COLOR.AVAILABLE;
  const isModule = data.id.startsWith("mod:");
  return (
    <div
      className="rounded-xl border bg-panel px-3.5 py-2.5 shadow-soft transition-all"
      style={{
        width: isModule ? 230 : 196,
        borderColor: data.highlighted ? "hsl(217 91% 60%)" : color,
        opacity: data.dimmed ? 0.2 : data.status === "LOCKED" ? 0.55 : 1,
        boxShadow: data.current ? "0 0 0 2px hsl(25 95% 53% / 0.3)" : data.highlighted ? "0 0 0 2px hsl(217 91% 60% / 0.4)" : undefined,
        background: isModule ? "linear-gradient(135deg, hsl(217 91% 60% / 0.16), hsl(var(--panel)))" : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} className="!h-1.5 !w-1.5 !border-0 !bg-white/20" />
      <div className={isModule ? "font-display text-sm font-bold" : "text-[13px] font-semibold leading-tight"}>{data.title}</div>
      {!isModule && (
        <div className="mt-2 flex items-center gap-2 text-[10px] text-muted">
          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
          {Math.round(data.hours)}h · {data.difficulty.toLowerCase()}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!h-1.5 !w-1.5 !border-0 !bg-white/20" />
    </div>
  );
}

const nodeTypes = { wm: RoadmapNodeCard };

function layout(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 28, ranksep: 64, marginx: 40, marginy: 40 });
  nodes.forEach((n) => g.setNode(n.id, { width: (n.data as any).id?.startsWith("mod:") ? 230 : 196, height: 64 }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map((n) => {
    const p = g.node(n.id);
    return { ...n, position: { x: p.x - p.width / 2, y: p.y - p.height / 2 } };
  });
}

function Flow({ data, edges: rawEdges, phases }: { data: RoadmapNode[]; edges: { source: string; target: string }[]; phases: { code: string; title: string }[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const initialNodes: Node[] = useMemo(
    () => data.map((d) => ({ id: d.id, type: "wm", data: d as any, position: { x: 0, y: 0 } })),
    [data]
  );
  const initialEdges: Edge[] = useMemo(
    () => rawEdges.map((e, i) => ({
      id: "e" + i, source: e.source, target: e.target, animated: false, type: "smoothstep",
      style: { stroke: "hsl(var(--border))", strokeWidth: 1.5 },
    })),
    [rawEdges]
  );

  const laidOut = useMemo(() => layout(initialNodes, initialEdges), [initialNodes, initialEdges]);
  const [nodes, setNodes, onNodesChange] = useNodesState(laidOut);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const applyFilters = useCallback(() => {
    const q = query.trim().toLowerCase();
    setNodes((ns) => ns.map((n) => {
      const d = n.data as RoadmapNode;
      let dim = false, hl = false;
      if (phaseFilter && d.phaseCode !== phaseFilter) dim = true;
      if (statusFilter && (statusFilter === "CURRENT" ? !d.current : d.status !== statusFilter)) dim = true;
      if (q) { const match = (d.title + " " + d.moduleName).toLowerCase().includes(q); hl = match; if (!match) dim = true; }
      return { ...n, data: { ...d, dimmed: dim, highlighted: hl } };
    }));
  }, [query, phaseFilter, statusFilter, setNodes]);

  useMemo(() => { applyFilters(); }, [applyFilters]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    const d = node.data as RoadmapNode;
    if (d.id.startsWith("mod:")) return;
    router.push(`/node/${d.slug}`);
  }, [router]);

  return (
    <div className="relative h-full w-full">
      <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex flex-wrap gap-2">
        <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-border bg-panel/90 px-3 py-2 backdrop-blur">
          <Search className="h-4 w-4 text-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter nodes…" className="w-40 bg-transparent text-sm outline-none" />
        </div>
        <select className="pointer-events-auto rounded-lg border border-border bg-panel/90 px-3 py-2 text-sm backdrop-blur" value={phaseFilter} onChange={(e) => setPhaseFilter(e.target.value)}>
          <option value="">All phases</option>
          {phases.map((p) => <option key={p.code} value={p.code}>Phase {p.code} · {p.title}</option>)}
        </select>
        <select className="pointer-events-auto rounded-lg border border-border bg-panel/90 px-3 py-2 text-sm backdrop-blur" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="CURRENT">Current</option>
          <option value="AVAILABLE">Available</option>
          <option value="LOCKED">Locked</option>
        </select>
      </div>

      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={nodeTypes}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeClick={onNodeClick}
        fitView minZoom={0.15} maxZoom={2} proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="hsl(var(--border))" />
        <Controls className="!shadow-soft" />
        <MiniMap pannable zoomable nodeColor={(n) => { const d = n.data as RoadmapNode; return d.current ? STATUS_COLOR.CURRENT : STATUS_COLOR[d.status] || STATUS_COLOR.AVAILABLE; }} maskColor="hsl(240 10% 4% / 0.7)" style={{ background: "hsl(var(--panel))" }} />
      </ReactFlow>

      <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex flex-wrap gap-3 rounded-lg border border-border bg-panel/90 px-3 py-2 text-[11px] text-muted backdrop-blur">
        {[["Available", STATUS_COLOR.AVAILABLE], ["Completed", STATUS_COLOR.COMPLETED], ["Current", STATUS_COLOR.CURRENT], ["Locked", STATUS_COLOR.LOCKED]].map(([l, c]) => (
          <span key={l as string} className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: c as string }} /> {l}</span>
        ))}
      </div>
    </div>
  );
}

export function RoadmapFlow(props: { data: RoadmapNode[]; edges: { source: string; target: string }[]; phases: { code: string; title: string }[] }) {
  return <ReactFlowProvider><Flow {...props} /></ReactFlowProvider>;
}
