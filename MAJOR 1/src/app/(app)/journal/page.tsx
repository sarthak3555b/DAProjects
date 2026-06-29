"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, NotebookPen, Plus, Tag } from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/states";
import { Badge } from "@/components/ui/badge";

const JournalEditor = dynamic(() => import("@/components/journal/journal-editor").then((m) => m.JournalEditor), {
  ssr: false,
  loading: () => <Skeleton className="h-[460px] rounded-2xl" />,
});

function MiniCalendar({ activeDays }: { activeDays: number[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div>
      <p className="mb-2 text-center text-sm font-medium">{now.toLocaleString("en-US", { month: "long", year: "numeric" })}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => (
          <div key={i} className="flex aspect-square items-center justify-center">
            {d && (
              <span className={`relative flex size-7 items-center justify-center rounded-lg text-xs ${d === now.getDate() ? "bg-primary text-white" : "text-foreground/80 hover:bg-white/5"}`}>
                {d}
                {activeDays.includes(d) && d !== now.getDate() && <span className="absolute bottom-0.5 size-1 rounded-full bg-primary" />}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function JournalPage() {
  const { data, status, refetch } = useQuery({ queryKey: queryKeys.journal, queryFn: api.journal });
  const activeDays = (data ?? []).map((e) => new Date(e.date).getDate());

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Journal"
        title="Think on paper"
        description="Capture reflections, link ideas, and watch your thinking compound."
        actions={<Button variant="gradient" size="sm"><Plus className="size-4" /> New entry</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <JournalEditor />

        <div className="space-y-4">
          <div className="rounded-2xl border border-border/70 bg-card/40 p-4 backdrop-blur-xl">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><CalendarDays className="size-4 text-primary" /> Calendar</h3>
            <MiniCalendar activeDays={activeDays} />
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/40 p-4 backdrop-blur-xl">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><NotebookPen className="size-4 text-purple" /> Recent entries</h3>
            {status === "pending" ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
            ) : status === "error" ? (
              <ErrorState onRetry={() => refetch()} className="py-8" />
            ) : data.length === 0 ? (
              <EmptyState icon={NotebookPen} title="No entries yet" description="Write your first reflection." className="py-8" />
            ) : (
              <div className="space-y-2">
                {data.map((e) => (
                  <button key={e.id} className="w-full rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition-colors hover:bg-white/[0.05]">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium">{e.title}</p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{e.preview}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {e.tags.map((t) => <Badge key={t} variant="outline" className="text-[10px]"><Tag className="size-2.5" />{t}</Badge>)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
