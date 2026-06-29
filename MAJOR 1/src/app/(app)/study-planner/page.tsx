"use client";

import dynamic from "next/dynamic";
import { CalendarDays, Clock, Flame, Target } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Panel } from "@/components/dashboard/panel";

const StudyCalendar = dynamic(() => import("@/components/planner/study-calendar").then((m) => m.StudyCalendar), {
  ssr: false,
  loading: () => <Skeleton className="h-[560px] rounded-2xl" />,
});

const upcoming = [
  { title: "Equity Valuation", when: "Today · 9:00 AM", color: "text-primary" },
  { title: "Reflection", when: "Today · 6:00 PM", color: "text-purple" },
  { title: "The Intelligent Investor", when: "Tomorrow · 8:00 AM", color: "text-green" },
  { title: "Assessment: Markets", when: "Wed · 2:00 PM", color: "text-orange" },
];

export default function StudyPlannerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Study Planner"
        title="Design your week of mastery"
        description="Schedule sessions, reflections, and assessments — then show up."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <StudyCalendar />

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Panel className="!p-0"><div className="p-4"><Flame className="mb-2 size-5 text-orange" /><p className="font-display text-xl font-bold">27</p><p className="text-xs text-muted-foreground">Day streak</p></div></Panel>
            <Panel className="!p-0"><div className="p-4"><Clock className="mb-2 size-5 text-primary" /><p className="font-display text-xl font-bold">6.5h</p><p className="text-xs text-muted-foreground">This week</p></div></Panel>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/40 p-4 backdrop-blur-xl">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><CalendarDays className="size-4 text-primary" /> Upcoming</h3>
            <div className="space-y-2">
              {upcoming.map((u) => (
                <div key={u.title} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className={`size-2 rounded-full bg-current ${u.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.title}</p>
                    <p className="text-xs text-muted-foreground">{u.when}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-4">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold"><Target className="size-4 text-primary" /> Weekly target</h3>
            <p className="text-xs text-muted-foreground">6.5 of 8 hours · 81%</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-purple" style={{ width: "81%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
