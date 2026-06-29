"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  BookMarked,
  CheckCircle2,
  Flame,
  PlayCircle,
  Sparkles,
  Trophy,
  Bookmark,
  Pencil,
  Target,
} from "lucide-react";
import type { ActivityItem, Goal, Resource } from "@/lib/types";
import { timeAgo, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

/* ----------------------------- Welcome ---------------------------- */
export function WelcomeBanner({ name, streak }: { name: string; streak: number }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-surface/70 to-card/40 p-6 backdrop-blur-xl sm:p-8">
      <div className="absolute inset-0 mesh-gradient opacity-60" aria-hidden />
      <div className="absolute -right-10 -top-10 size-48 rounded-full bg-primary/15 blur-3xl" aria-hidden />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting},</p>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {name.split(" ")[0]} <span className="gradient-text">— let's compound.</span>
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
            “The best investment you can make is in your own knowledge.”
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-orange/20 bg-orange/10 px-4 py-3">
            <Flame className="size-6 text-orange" />
            <div>
              <p className="font-display text-xl font-bold leading-none text-orange">{streak}</p>
              <p className="text-[11px] text-muted-foreground">day streak</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Next Action -------------------------- */
export function NextActionCard() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card/40 to-card/40 p-6 backdrop-blur-xl">
      <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/25 blur-3xl" aria-hidden />
      <div className="relative">
        <Badge variant="primary" className="mb-3">
          <Sparkles className="size-3" /> Next best action
        </Badge>
        <h3 className="font-display text-lg font-semibold">Continue “Debt & Leverage”</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          You're 55% through this module in Personal Finance Mastery. Finish it to unlock Macroeconomics.
        </p>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>55%</span>
          </div>
          <Progress value={55} />
        </div>
      </div>
      <Button variant="gradient" className="relative mt-5 w-full group" asChild>
        <Link href="/roadmap?node=n4">
          <PlayCircle /> Resume learning
          <ArrowRight className="ml-auto transition-transform group-hover:translate-x-1" />
        </Link>
      </Button>
    </div>
  );
}

/* -------------------------- Activity Feed ------------------------- */
const activityIcon = {
  completed: { icon: CheckCircle2, color: "text-green bg-green/10" },
  started: { icon: PlayCircle, color: "text-primary bg-primary/10" },
  assessment: { icon: Target, color: "text-purple bg-purple/10" },
  achievement: { icon: Trophy, color: "text-orange bg-orange/10" },
  note: { icon: Pencil, color: "text-cyan-400 bg-cyan-400/10" },
  bookmark: { icon: Bookmark, color: "text-primary bg-primary/10" },
} as const;

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div>
      <ul className="space-y-1">
        {items.map((it, i) => {
          const { icon: Icon, color } = activityIcon[it.kind];
          return (
            <motion.li
              key={it.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/[0.03]"
            >
              <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", color)}>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{it.title}</p>
                <p className="truncate text-xs text-muted-foreground">{it.detail}</p>
              </div>
              <span className="shrink-0 text-[11px] text-muted-foreground/70">{timeAgo(it.timestamp)}</span>
            </motion.li>
          );
        })}
      </ul>
      <Button variant="ghost" size="sm" className="mt-2 w-full" asChild>
        <Link href="/journal">View all activity</Link>
      </Button>
    </div>
  );
}

/* --------------------------- Goals rings -------------------------- */
function Ring({ value, label, sub }: { value: number; label: string; sub: string }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="relative size-[76px]">
        <svg className="size-full -rotate-90" viewBox="0 0 76 76">
          <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
          <circle
            cx="38" cy="38" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)" }}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold">
          {Math.round(value)}%
        </span>
      </div>
      <div>
        <p className="text-xs font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

export function GoalsCard({ goals }: { goals: Goal[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {goals.map((g) => (
        <Ring
          key={g.id}
          value={(g.current / g.target) * 100}
          label={g.period}
          sub={`${g.current}${g.unit} / ${g.target}${g.unit}`}
        />
      ))}
    </div>
  );
}

/* ----------------------- Recommended learning --------------------- */
export function RecommendedLearning({ items }: { items: Resource[] }) {
  return (
    <div className="space-y-2">
      {items.map((r) => (
        <Link
          key={r.id}
          href="/resources"
          className="group flex items-center gap-3 rounded-xl border border-transparent p-2.5 transition-colors hover:border-white/10 hover:bg-white/[0.03]"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/25 to-purple/25 text-primary">
            <BookMarked className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{r.title}</p>
            <p className="truncate text-xs text-muted-foreground">{r.author} · {r.type}</p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
      ))}
    </div>
  );
}
