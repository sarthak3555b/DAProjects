"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Trophy, Lock, Sparkles, Medal, Crown, Gem, Award, Star } from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import type { Achievement, AchievementTier } from "@/lib/types";
import { PageHeader } from "@/components/shell/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/lib/hooks";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { sfx } from "@/lib/sound";

const tierMeta: Record<AchievementTier, { color: string; ring: string; icon: typeof Medal; glow: string }> = {
  Bronze: { color: "text-orange-300", ring: "border-orange-300/30", icon: Medal, glow: "shadow-[0_0_30px_-8px_rgba(251,146,60,0.5)]" },
  Silver: { color: "text-slate-300", ring: "border-slate-300/30", icon: Award, glow: "shadow-[0_0_30px_-8px_rgba(203,213,225,0.5)]" },
  Gold: { color: "text-yellow-300", ring: "border-yellow-300/30", icon: Star, glow: "shadow-[0_0_30px_-8px_rgba(253,224,71,0.55)]" },
  Platinum: { color: "text-cyan-200", ring: "border-cyan-200/30", icon: Trophy, glow: "shadow-[0_0_30px_-8px_rgba(165,243,252,0.55)]" },
  Diamond: { color: "text-sky-300", ring: "border-sky-300/30", icon: Gem, glow: "shadow-[0_0_30px_-8px_rgba(125,211,252,0.6)]" },
  Legendary: { color: "text-purple", ring: "border-purple/40", icon: Crown, glow: "shadow-[0_0_40px_-6px_rgba(139,92,246,0.7)]" },
};

function celebrate() {
  import("canvas-confetti").then(({ default: confetti }) => {
    confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 }, colors: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"] });
  }).catch(() => {});
  sfx.achievement();
}

function AchievementCard({ a, i }: { a: Achievement; i: number }) {
  const meta = tierMeta[a.tier];
  const Icon = meta.icon;
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(i * 0.05, 0.4) }}
      onClick={() => { if (a.unlocked) { celebrate(); toast.success(`${a.title} · +${a.xp} XP`); } else toast(`${a.progress}% toward “${a.title}”`); }}
      className={cn(
        "group relative flex flex-col items-center overflow-hidden rounded-2xl border bg-card/50 p-6 text-center backdrop-blur-xl transition-all hover:-translate-y-1",
        a.unlocked ? cn(meta.ring, meta.glow) : "border-border/60",
      )}
    >
      {!a.unlocked && <div className="absolute inset-0 z-10 bg-bg/40 backdrop-blur-[1px]" />}
      <div className={cn("relative mb-3 flex size-16 items-center justify-center rounded-2xl border", a.unlocked ? cn(meta.ring, "bg-white/5") : "border-white/10 bg-white/[0.03]")}>
        {a.unlocked ? <Icon className={cn("size-8", meta.color)} /> : <Lock className="size-7 text-muted-foreground" />}
        {a.unlocked && <Sparkles className="absolute -right-1 -top-1 size-4 text-yellow-300" />}
      </div>
      <span className={cn("text-[10px] font-semibold uppercase tracking-[0.18em]", a.unlocked ? meta.color : "text-muted-foreground")}>{a.tier}</span>
      <h3 className="mt-1 font-display text-sm font-semibold">{a.title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
      {a.unlocked ? (
        <span className="mt-3 rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-foreground">+{a.xp} XP</span>
      ) : (
        <div className="mt-3 w-full">
          <Progress value={a.progress} className="h-1.5" />
          <p className="mt-1 text-[10px] text-muted-foreground">{a.progress}%</p>
        </div>
      )}
    </motion.button>
  );
}

export default function AchievementsPage() {
  const online = useOnlineStatus();
  const { data, status, refetch } = useQuery({ queryKey: queryKeys.achievements, queryFn: api.achievements });

  const unlocked = data?.filter((a) => a.unlocked).length ?? 0;
  const totalXp = data?.filter((a) => a.unlocked).reduce((s, a) => s + a.xp, 0) ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Achievements"
        title="Trophies of mastery"
        description="Every streak, score, and milestone earns its place in your hall of progress."
        actions={
          status === "success" ? (
            <div className="flex gap-2">
              <span className="rounded-xl border border-white/10 bg-card/50 px-3 py-2 text-xs"><b className="text-foreground">{unlocked}</b><span className="text-muted-foreground"> / {data.length} unlocked</span></span>
              <span className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-medium text-primary">{totalXp.toLocaleString()} XP</span>
            </div>
          ) : null
        }
      />

      {!online && status !== "success" ? (
        <OfflineState />
      ) : status === "pending" ? (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
        </div>
      ) : status === "error" ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((a, i) => <AchievementCard key={a.id} a={a} i={i} />)}
        </div>
      )}
    </div>
  );
}
