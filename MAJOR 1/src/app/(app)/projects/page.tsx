"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Clock, GripVertical, Layers, CheckCircle2, Circle, Loader2, Package } from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import type { Project, ProjectStatus, Difficulty } from "@/lib/types";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { sfx } from "@/lib/sound";

const columns: { id: ProjectStatus; label: string; icon: typeof Circle; accent: string }[] = [
  { id: "PLANNED", label: "Planned", icon: Circle, accent: "text-muted-foreground" },
  { id: "IN_PROGRESS", label: "In Progress", icon: Loader2, accent: "text-primary" },
  { id: "COMPLETED", label: "Completed", icon: CheckCircle2, accent: "text-green" },
];

const diffColor: Record<Difficulty, "green" | "primary" | "orange" | "red"> = {
  BEGINNER: "green", INTERMEDIATE: "primary", ADVANCED: "orange", EXPERT: "red",
};

function Card({ p, onDragStart }: { p: Project; onDragStart: (id: string) => void }) {
  return (
    <motion.div
      layout
      draggable
      onDragStart={() => onDragStart(p.id)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group cursor-grab rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-xl transition-colors hover:border-white/20 active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-display text-sm font-semibold leading-snug">{p.title}</h4>
        <GripVertical className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge variant={diffColor[p.difficulty]}>{p.difficulty.charAt(0) + p.difficulty.slice(1).toLowerCase()}</Badge>
        <Badge variant="outline"><Clock className="size-3" /> {p.hours}h</Badge>
        <Badge variant="outline"><Layers className="size-3" /> {p.deliverables.length} deliverables</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {p.tags.map((t) => (
          <span key={t} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-muted-foreground">#{t}</span>
        ))}
      </div>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const online = useOnlineStatus();
  const { data, status, refetch } = useQuery({ queryKey: queryKeys.projects, queryFn: api.projects });
  const [items, setItems] = useState<Project[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<ProjectStatus | null>(null);

  useEffect(() => { if (data) setItems(data); }, [data]);

  const drop = (col: ProjectStatus) => {
    if (!dragId) return;
    setItems((prev) => prev.map((p) => (p.id === dragId ? { ...p, status: col } : p)));
    const moved = items.find((p) => p.id === dragId);
    if (moved && moved.status !== col) {
      sfx.click();
      toast.success(`Moved “${moved.title}” to ${columns.find((c) => c.id === col)?.label}`);
    }
    setDragId(null);
    setOver(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Projects"
        title="Build to understand"
        description="Turn theory into proof of work. Drag cards across the board as you progress."
      />

      {!online && status !== "success" ? (
        <OfflineState />
      ) : status === "pending" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {columns.map((c) => (
            <div key={c.id} className="space-y-3">
              <Skeleton className="h-8 w-32" />
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
            </div>
          ))}
        </div>
      ) : status === "error" ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {columns.map((col) => {
            const colItems = items.filter((p) => p.status === col.id);
            const Icon = col.icon;
            return (
              <div
                key={col.id}
                onDragOver={(e) => { e.preventDefault(); setOver(col.id); }}
                onDragLeave={() => setOver((o) => (o === col.id ? null : o))}
                onDrop={() => drop(col.id)}
                className={cn(
                  "flex min-h-[200px] flex-col gap-3 rounded-2xl border bg-surface/20 p-3 transition-colors",
                  over === col.id ? "border-primary/50 bg-primary/[0.04]" : "border-border/60",
                )}
              >
                <div className="flex items-center justify-between px-1">
                  <h3 className={cn("flex items-center gap-2 text-sm font-semibold", col.accent)}>
                    <Icon className={cn("size-4", col.id === "IN_PROGRESS" && "animate-spin-slow")} /> {col.label}
                  </h3>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">{colItems.length}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {colItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-10 text-center text-xs text-muted-foreground">
                      <Package className="mb-2 size-5 opacity-50" />
                      Drop projects here
                    </div>
                  ) : (
                    colItems.map((p) => <Card key={p.id} p={p} onDragStart={setDragId} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
