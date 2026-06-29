"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Search, Star, BookOpen, GraduationCap, Video, FileText, Mic, ScrollText,
  LayoutGrid, List as ListIcon, Table as TableIcon, Bookmark,
} from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import type { Resource, ResourceType } from "@/lib/types";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const typeIcon: Record<ResourceType, typeof BookOpen> = {
  Book: BookOpen, Course: GraduationCap, Video: Video, Article: FileText, Podcast: Mic, Paper: ScrollText,
};
const types: ("All" | ResourceType)[] = ["All", "Book", "Course", "Video", "Article", "Podcast", "Paper"];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Rated ${rating} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("size-3", i < Math.round(rating) ? "fill-orange text-orange" : "text-muted-foreground/40")} />
      ))}
    </span>
  );
}

export default function ResourcesPage() {
  const online = useOnlineStatus();
  const { data, status, refetch } = useQuery({ queryKey: queryKeys.resources, queryFn: api.resources });
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"All" | ResourceType>("All");
  const [view, setView] = useState<"cards" | "table" | "list">("cards");

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((r) => {
      const matchType = type === "All" || r.type === type;
      const matchQuery = !query || r.title.toLowerCase().includes(query.toLowerCase()) || r.author.toLowerCase().includes(query.toLowerCase());
      return matchType && matchQuery;
    });
  }, [data, type, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resources"
        title="Your living library"
        description="Books, courses, papers, and talks — organized for deep work."
        actions={
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-card/50 p-1">
            {([["cards", LayoutGrid], ["table", TableIcon], ["list", ListIcon]] as const).map(([v, Icon]) => (
              <Button key={v} variant={view === v ? "primary" : "ghost"} size="icon-sm" aria-label={`${v} view`} aria-pressed={view === v} onClick={() => setView(v)}>
                <Icon className="size-4" />
              </Button>
            ))}
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-surface/60 px-3 py-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search instantly by title or author…"
            aria-label="Search resources"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", type === t ? "bg-primary text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {!online && status !== "success" ? (
        <OfflineState />
      ) : status === "pending" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : status === "error" ? (
        <ErrorState onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No resources found" description="Try a different search or filter." />
      ) : view === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((r, i) => {
            const Icon = typeIcon[r.type];
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="group flex flex-col rounded-2xl border border-border/70 bg-card/50 p-5 backdrop-blur-xl transition-colors hover:border-white/15">
                <div className="flex items-start justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-purple/25 text-primary"><Icon className="size-5" /></span>
                  {r.bookmarked && <Bookmark className="size-4 fill-primary text-primary" />}
                </div>
                <h3 className="mt-3 font-display text-sm font-semibold leading-snug">{r.title}</h3>
                <p className="text-xs text-muted-foreground">{r.author}</p>
                <p className="mt-2 line-clamp-2 flex-1 text-xs text-muted-foreground/80">{r.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <Stars rating={r.rating} />
                  <Badge variant="outline">{r.durationLabel}</Badge>
                </div>
                {r.progress > 0 && (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-purple" style={{ width: `${r.progress}%` }} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : view === "list" ? (
        <div className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/70 bg-card/40">
          {filtered.map((r) => {
            const Icon = typeIcon[r.type];
            return (
              <div key={r.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-white/[0.03]">
                <span className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-primary"><Icon className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.author} · {r.type} · {r.durationLabel}</p>
                </div>
                <Stars rating={r.rating} />
                {r.bookmarked && <Bookmark className="size-4 fill-primary text-primary" />}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Rating</th>
                <th className="p-4 font-medium">Duration</th>
                <th className="p-4 font-medium">Progress</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border/30 transition-colors last:border-0 hover:bg-white/[0.03]">
                  <td className="p-4"><span className="font-medium">{r.title}</span><span className="block text-xs text-muted-foreground">{r.author}</span></td>
                  <td className="p-4"><Badge variant="outline">{r.type}</Badge></td>
                  <td className="p-4"><Stars rating={r.rating} /></td>
                  <td className="p-4 text-muted-foreground">{r.durationLabel}</td>
                  <td className="p-4"><span className="font-mono text-xs">{r.progress}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
