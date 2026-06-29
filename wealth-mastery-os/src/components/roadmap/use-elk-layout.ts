"use client";

import { useEffect, useState } from "react";
import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkNode } from "elkjs";
import type { Edge, Node } from "@xyflow/react";
import type { RoadmapNode } from "@/lib/types";

const elk = new ELK();

export const NODE_W = 256;
export const NODE_H = 140;

const layoutOptions = {
  "elk.algorithm": "layered",
  "elk.direction": "RIGHT",
  "elk.layered.spacing.nodeNodeBetweenLayers": "120",
  "elk.spacing.nodeNode": "48",
  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
  "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
};

export type RFNode = Node<{ node: RoadmapNode }>;

/**
 * Computes a clean, deterministic left-to-right layered layout via ELK.
 * Returns positioned React Flow nodes/edges once layout resolves.
 */
export function useElkLayout(
  roadmapNodes: RoadmapNode[],
  rawEdges: { id: string; source: string; target: string }[],
) {
  const [nodes, setNodes] = useState<RFNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const graph: ElkNode = {
      id: "root",
      layoutOptions,
      children: roadmapNodes.map((n) => ({ id: n.id, width: NODE_W, height: NODE_H })),
      edges: rawEdges.map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] })),
    };

    elk
      .layout(graph)
      .then((res) => {
        if (cancelled) return;
        const positioned: RFNode[] = (res.children ?? []).map((c) => {
          const data = roadmapNodes.find((n) => n.id === c.id)!;
          return {
            id: c.id,
            type: "roadmap",
            position: { x: c.x ?? 0, y: c.y ?? 0 },
            data: { node: data },
            draggable: true,
          };
        });

        const rfEdges: Edge[] = rawEdges.map((e) => {
          const target = roadmapNodes.find((n) => n.id === e.target);
          const source = roadmapNodes.find((n) => n.id === e.source);
          const unlocked = source?.status === "COMPLETED";
          const active = target?.status === "IN_PROGRESS" || target?.status === "AVAILABLE";
          return {
            id: e.id,
            source: e.source,
            target: e.target,
            type: "smoothstep",
            animated: unlocked && active,
            data: { unlocked },
            style: {
              stroke: unlocked ? "#3b82f6" : "rgba(148,163,184,0.35)",
              strokeWidth: unlocked ? 2 : 1.5,
            },
          };
        });

        setNodes(positioned);
        setEdges(rfEdges);
        setReady(true);
      })
      .catch(() => setReady(true));

    return () => {
      cancelled = true;
    };
  }, [roadmapNodes, rawEdges]);

  return { nodes, edges, ready, setNodes, setEdges };
}
