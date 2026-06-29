"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Lock, Check, Play, Circle, Clock, Bookmark } from "lucide-react";
import type { RoadmapNode as RoadmapNodeType, Difficulty } from "@/lib/types";
import { cn } from "@/lib/utils";

const difficultyColor: Record<Difficulty, string> = {
  BEGINNER: "text-green",
  INTERMEDIATE: "text-primary",
  ADVANCED: "text-orange",
  EXPERT: "text-red",
};

const statusMeta = {
  LOCKED: { ring: "border-white/8 bg-card/30", glow: "", icon: Lock, iconColor: "text-muted-foreground/60", label: "Locked" },
  AVAILABLE: { ring: "border-white/12 bg-card/60", glow: "", icon: Circle, iconColor: "text-muted-foreground", label: "Available" },
  IN_PROGRESS: { ring: "border-primary/50 bg-card/70", glow: "shadow-[0_0_30px_-6px_rgba(59,130,246,0.6)]", icon: Play, iconColor: "text-primary", label: "In Progress" },
  COMPLETED: { ring: "border-green/40 bg-card/60", glow: "shadow-[0_0_26px_-8px_rgba(16,185,129,0.55)]", icon: Check, iconColor: "text-green", label: "Completed" },
} as const;

type Data = { node: RoadmapNodeType };
type RoadmapFlowNode = Node<Data, "roadmap">;

function RoadmapNodeInner({ data, selected }: NodeProps<RoadmapFlowNode>) {
  const n = data.node;
  const meta = statusMeta[n.status];
  const Icon = meta.icon;
  const locked = n.status === "LOCKED";

  return (
    <div
      className={cn(
        "group relative w-64 rounded-2xl border backdrop-blur-xl transition-all duration-300",
        meta.ring,
        meta.glow,
        locked && "opacity-55 grayscale-[0.3]",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-bg",
        n.status === "IN_PROGRESS" && "before:absolute before:inset-0 before:rounded-2xl before:border before:border-primary/30 before:animate-pulse-glow before:content-['']",
      )}
    >
      <Handle type="target" position={Position.Left} className="!size-2 !border-0 !bg-white/30" />
      <Handle type="source" position={Position.Right} className="!size-2 !border-0 !bg-white/30" />

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
            {n.phase}
          </span>
          <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-lg bg-white/5", meta.iconColor)}>
            <Icon className="size-3.5" />
          </span>
        </div>

        <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug">{n.title}</h3>

        <div className="mt-2.5 flex items-center gap-2.5 text-[11px] text-muted-foreground">
          <span className={cn("font-medium", difficultyColor[n.difficulty])}>
            {n.difficulty.charAt(0) + n.difficulty.slice(1).toLowerCase()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" /> {n.estimatedHours}h
          </span>
          {n.type === "ELECTIVE" && (
            <span className="flex items-center gap-1 text-purple">
              <Bookmark className="size-3" /> Elective
            </span>
          )}
        </div>

        {(n.status === "IN_PROGRESS" || n.status === "COMPLETED") && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
              <span>{meta.label}</span>
              <span>{n.completion}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={cn("h-full rounded-full transition-all duration-700", n.status === "COMPLETED" ? "bg-green" : "bg-gradient-to-r from-primary to-purple")}
                style={{ width: `${n.completion}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const RoadmapNode = memo(RoadmapNodeInner);
