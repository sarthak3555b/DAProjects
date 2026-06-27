import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeProgress, periodMinutes } from "@/lib/progress";
import { skillAxes } from "@/lib/skills";
import { fmtHours, relativeTime } from "@/lib/utils";
import { ProgressRing, ActivityBars, SkillRadar, Heatmap } from "@/components/charts";
import { LogSessionButton } from "@/components/log-session";
import { ArrowRight, Flame, Clock, CheckCircle2, BookOpen, Wrench, Trophy, NotebookPen, Target } from "lucide-react";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const settings = await prisma.settings.findUnique({ where: { userId } });
  let p;
  try { p = await computeProgress(userId); }
  catch {
    return (
      <div className="p-8">
        <div className="card max-w-lg"><h2 className="font-display text-lg font-bold">Almost there</h2>
          <p className="mt-2 text-sm text-muted">The content database isn&apos;t seeded yet. An admin should visit <code className="rounded bg-white/10 px-1.5 py-0.5">/api/seed?secret=YOUR_SEED_SECRET</code> once to load all 22 phases and 326 nodes.</p>
        </div>
      </div>
    );
  }

  const goals = {
    weekly: { done: periodMinutes(p.activity, "weekly"), goal: settings?.weeklyGoalMin ?? 240 },
    monthly: { done: periodMinutes(p.activity, "monthly"), goal: settings?.monthlyGoalMin ?? 960 },
    yearly: { done: periodMinutes(p.activity, "yearly"), goal: settings?.yearlyGoalMin ?? 11520 },
  };

  // 14-day activity bars
  const bars: { label: string; value: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    bars.push({ label: d.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 1), value: p.activity[key] || 0 });
  }

  const stats = [
    { icon: Target, color: "var(--current)", value: "Phase " + (p.currentPhase?.code ?? "—"), label: p.currentPhase?.title ?? "All phases" },
    { icon: CheckCircle2, color: "var(--completed)", value: Math.round(p.overallPct) + "%", label: "Completion" },
    { icon: Clock, color: "var(--learning)", value: fmtHours(p.hours), label: "Hours studied" },
    { icon: Flame, color: "var(--current)", value: p.streak + "d", label: "Current streak" },
    { icon: BookOpen, color: "var(--project)", value: String(p.books), label: "Books completed" },
    { icon: Wrench, color: "var(--project)", value: String(p.projectsCompleted), label: "Projects done" },
    { icon: Trophy, color: "var(--gold)", value: String(p.phasesCompleted), label: "Phases completed" },
    { icon: NotebookPen, color: "var(--learning)", value: String(p.journalCount), label: "Journal entries" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-5 md:p-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-border p-6 md:p-8"
        style={{ background: "linear-gradient(120deg, hsl(var(--learning)/0.14), hsl(var(--project)/0.10) 60%, hsl(var(--current)/0.07))" }}>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-[260px] flex-1">
            <div className="text-xs font-bold uppercase tracking-widest text-learning">Wealth Mastery OS</div>
            <h1 className="mt-2 font-display text-3xl font-extrabold">Welcome back, {session.user.name || "Learner"}</h1>
            <p className="mt-2 text-muted">
              {p.currentNode ? <>Your frontier: <span className="text-fg">{p.currentNode.title}</span> — Phase {p.currentNode.phaseCode} · {p.currentNode.moduleName}</> : "You've reached the current frontier. Time to review and apply."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {p.currentNode
                ? <Link href={`/node/${p.currentNode.slug}`} className="btn btn-primary">Continue learning <ArrowRight className="h-4 w-4" /></Link>
                : <Link href="/roadmap" className="btn btn-primary">Open roadmap <ArrowRight className="h-4 w-4" /></Link>}
              <LogSessionButton />
            </div>
          </div>
          <ProgressRing pct={p.overallPct} sub={`${p.completedCount}/${p.totalNodes} nodes`} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card card-hover">
            <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl" style={{ background: `hsl(${s.color} / 0.16)`, color: `hsl(${s.color})` }}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="font-display text-2xl font-extrabold">{s.value}</div>
            <div className="text-xs text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="chip">Last activity: {relativeTime(p.activity && Object.keys(p.activity).length ? new Date() : null)}</span>
        <span className="chip">60 min/day · 4 days/week · ~200 h/yr</span>
      </div>

      {/* Goals */}
      <h2 className="font-display text-lg font-bold">Goals</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {([["Weekly", goals.weekly], ["Monthly", goals.monthly], ["Yearly", goals.yearly]] as const).map(([label, g]) => {
          const pct = Math.min(100, g.goal ? (g.done / g.goal) * 100 : 0);
          return (
            <div key={label} className="card">
              <div className="flex items-center justify-between text-sm"><span className="font-semibold text-muted">{label} goal</span><span className="text-muted">{fmtHours(g.done / 60)} / {fmtHours(g.goal / 60)}</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full transition-all" style={{ width: pct + "%", background: pct >= 100 ? "hsl(var(--completed))" : "linear-gradient(90deg, hsl(var(--learning)), hsl(var(--project)))" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights */}
      <h2 className="font-display text-lg font-bold">Insights</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="text-sm font-semibold text-muted">Learning activity — last 14 days (minutes)</div>
          <div className="mt-3"><ActivityBars data={bars} /></div>
        </div>
        <div className="card">
          <div className="text-sm font-semibold text-muted">Skill progress</div>
          <SkillRadar data={skillAxes(p.phases)} />
        </div>
      </div>

      <div className="card">
        <div className="text-sm font-semibold text-muted">Knowledge heatmap — daily study (26 weeks)</div>
        <div className="mt-4"><Heatmap activity={p.activity} weeks={26} /></div>
      </div>

      {/* Timeline */}
      <h2 className="font-display text-lg font-bold">Completion timeline</h2>
      <div className="card space-y-3">
        {p.phases.map((ph) => {
          const pct = ph.total ? (ph.done / ph.total) * 100 : 0;
          return (
            <Link key={ph.code} href="/roadmap" className="block">
              <div className="flex items-center justify-between text-sm"><span>Phase {ph.code} · {ph.title}</span><span className="text-muted">{Math.round(pct)}%</span></div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full" style={{ width: pct + "%", background: pct === 100 ? "hsl(var(--completed))" : "hsl(var(--learning))" }} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
