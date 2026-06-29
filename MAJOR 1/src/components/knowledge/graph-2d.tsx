"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import type { ConceptNode, Domain } from "@/lib/types";

export const domainColor: Record<Domain, string> = {
  Money: "#3b82f6",
  Economics: "#8b5cf6",
  Business: "#10b981",
  Investing: "#22d3ee",
  Technology: "#f59e0b",
  "Capital Allocation": "#ec4899",
  "Wealth Creation": "#ef4444",
};

type SimNode = ConceptNode & SimulationNodeDatum & { x: number; y: number };
type SimLink = SimulationLinkDatum<SimNode> & { source: string; target: string };

const WIDTH = 1000;
const HEIGHT = 680;

export function KnowledgeGraph2D({
  concepts,
  query,
  showLabels,
  showDeps,
  selectedId,
  onSelect,
}: {
  concepts: ConceptNode[];
  query: string;
  showLabels: boolean;
  showDeps: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Precompute a settled force layout once (performant — no continuous rAF).
  const { nodes, links } = useMemo(() => {
    const nodes: SimNode[] = concepts.map((c, i) => ({
      ...c,
      x: WIDTH / 2 + Math.cos((i / concepts.length) * Math.PI * 2) * 200,
      y: HEIGHT / 2 + Math.sin((i / concepts.length) * Math.PI * 2) * 200,
    }));
    const seen = new Set<string>();
    const links: SimLink[] = [];
    concepts.forEach((c) =>
      c.connections.forEach((t) => {
        const key = [c.id, t].sort().join("-");
        if (!seen.has(key) && concepts.find((n) => n.id === t)) {
          seen.add(key);
          links.push({ source: c.id, target: t });
        }
      }),
    );
    const sim = forceSimulation<SimNode>(nodes)
      .force("charge", forceManyBody().strength(-420))
      .force("link", forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(120).strength(0.6))
      .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
      .force("collide", forceCollide(46))
      .stop();
    for (let i = 0; i < 320; i++) sim.tick();
    return { nodes, links };
  }, [concepts]);

  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>();
    concepts.forEach((c) => map.set(c.id, new Set(c.connections)));
    links.forEach((l) => {
      map.get(l.source)?.add(l.target);
      map.get(l.target)?.add(l.source);
    });
    return map;
  }, [concepts, links]);

  const active = selectedId ?? hovered;
  const isLit = useCallback(
    (id: string) => {
      if (!active) return query ? matches(id) : true;
      return id === active || neighbors.get(active)?.has(id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active, neighbors, query, nodes],
  );

  function matches(id: string) {
    if (!query) return true;
    const n = nodes.find((x) => x.id === id);
    return n ? n.label.toLowerCase().includes(query.toLowerCase()) : false;
  }

  // Fly-to selected: center & zoom
  useEffect(() => {
    if (!selectedId) return;
    const n = nodes.find((x) => x.id === selectedId);
    if (!n) return;
    const k = 1.5;
    setView({ k, x: WIDTH / 2 - n.x * k, y: HEIGHT / 2 - n.y * k });
  }, [selectedId, nodes]);

  // Pan + zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setView((v) => {
      const k = Math.min(2.4, Math.max(0.5, v.k * (e.deltaY > 0 ? 0.9 : 1.1)));
      return { ...v, k };
    });
  };
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX - view.x, y: e.clientY - view.y };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setView((v) => ({ ...v, x: e.clientX - drag.current!.x, y: e.clientY - drag.current!.y }));
  };
  const onPointerUp = () => (drag.current = null);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="size-full cursor-grab touch-none active:cursor-grabbing"
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={() => onSelect(null)}
      role="img"
      aria-label="Knowledge graph of interconnected concepts"
    >
      <defs>
        <radialGradient id="kg-node" cx="35%" cy="35%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
        </radialGradient>
        <filter id="kg-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
        {/* Edges (constellations) */}
        {showDeps &&
          links.map((l, i) => {
            const s = nodes.find((n) => n.id === l.source)!;
            const t = nodes.find((n) => n.id === l.target)!;
            const lit = isLit(l.source) && isLit(l.target) && (active ? l.source === active || l.target === active : true);
            return (
              <line
                key={i}
                x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                stroke={lit ? "#93c5fd" : "rgba(148,163,184,0.25)"}
                strokeWidth={lit ? 1.8 : 0.8}
                opacity={active && !lit ? 0.08 : 1}
                style={{ transition: "opacity 0.3s, stroke 0.3s" }}
              />
            );
          })}

        {/* Nodes (stars / planets) */}
        {nodes.map((n) => {
          const lit = isLit(n.id);
          const r = 14 + (n.mastery / 100) * 14;
          const color = domainColor[n.domain];
          const isSel = selectedId === n.id;
          return (
            <g
              key={n.id}
              transform={`translate(${n.x},${n.y})`}
              opacity={lit ? 1 : 0.16}
              style={{ transition: "opacity 0.3s", cursor: "pointer" }}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(isSel ? null : n.id);
              }}
              tabIndex={0}
              role="button"
              aria-label={`${n.label}, ${n.domain}, mastery ${n.mastery}%`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(isSel ? null : n.id);
                }
              }}
            >
              {/* mastery ring */}
              <circle r={r + 6} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={2} />
              <circle
                r={r + 6}
                fill="none"
                stroke={color}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * (r + 6)}
                strokeDashoffset={2 * Math.PI * (r + 6) * (1 - n.mastery / 100)}
                transform="rotate(-90)"
              />
              <circle r={r} fill={color} filter={isSel || hovered === n.id ? "url(#kg-glow)" : undefined} />
              <circle r={r} fill="url(#kg-node)" opacity={0.5} />
              {(showLabels || isSel || hovered === n.id) && (
                <text
                  y={r + 16}
                  textAnchor="middle"
                  className="pointer-events-none select-none fill-white"
                  style={{ fontSize: 12, fontWeight: 600, paintOrder: "stroke", stroke: "rgba(3,7,18,0.8)", strokeWidth: 3 }}
                >
                  {n.label}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
