import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeProgress } from "@/lib/progress";
import { skillAxes } from "@/lib/skills";
import { fmtHours } from "@/lib/utils";
import { SkillRadar, Heatmap, VelocityArea } from "@/components/charts";

export const metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  let p;
  try { p = await computeProgress(userId); } catch { return <div className="p-8 text-muted">Seed the database to view analytics.</div>; }

  // velocity: nodes completed per week (last 12 weeks)
  const completedProg = await prisma.userProgress.findMany({ where: { userId, status: "COMPLETED", completedAt: { not: null } }, select: { completedAt: true } });
  const weeks = 12; const buckets = new Array(weeks).fill(0);
  const now = Date.now();
  for (const c of completedProg) { const w = Math.floor((now - c.completedAt!.getTime()) / (7 * 86400000)); if (w >= 0 && w < weeks) buckets[weeks - 1 - w]++; }
  const velocity = buckets.map((v, i) => ({ label: i === weeks - 1 ? "now" : `-${weeks - 1 - i}w`, value: v }));

  // mastery by difficulty
  const diffs = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT", "MASTER"];
  const byDiff = await Promise.all(diffs.map(async (d) => {
    const total = await prisma.node.count({ where: { difficulty: d as any } });
    const done = await prisma.userProgress.count({ where: { userId, status: "COMPLETED", node: { difficulty: d as any } } });
    return { label: d[0] + d.slice(1).toLowerCase(), total, done };
  }));

  const achievements = await prisma.achievement.findMany();
  const earned = await prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true, unlockedAt: true } });
  const earnedMap = new Map(earned.map((e) => [e.achievementId, e.unlockedAt]));

  const kpis = [
    { label: "Overall completion", value: Math.round(p.overallPct) + "%" },
    { label: "Hours studied", value: fmtHours(p.hours) },
    { label: "Current streak", value: p.streak + " days" },
    { label: "Nodes completed", value: `${p.completedCount}/${p.totalNodes}` },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-5 md:p-8">
      <div><div className="text-xs font-bold uppercase tracking-widest text-analytics">Measure what matters</div><h1 className="mt-1 font-display text-3xl font-extrabold">Progress Analytics</h1></div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => <div key={k.label} className="card"><div className="text-xs text-muted">{k.label}</div><div className="mt-1 font-display text-2xl font-extrabold">{k.value}</div></div>)}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card"><div className="text-sm font-semibold text-muted">Learning velocity — nodes/week (12 weeks)</div><div className="mt-3"><VelocityArea data={velocity} /></div></div>
        <div className="card"><div className="text-sm font-semibold text-muted">Skill radar</div><SkillRadar data={skillAxes(p.phases)} /></div>
      </div>

      <h2 className="font-display text-lg font-bold">Mastery by difficulty</h2>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {byDiff.map((d) => { const pct = d.total ? (d.done / d.total) * 100 : 0; return (
          <div key={d.label} className="card"><div className="flex items-center justify-between text-sm"><strong>{d.label}</strong><span className="text-muted">{d.done}/{d.total}</span></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full" style={{ width: pct + "%", background: pct === 100 ? "hsl(var(--completed))" : "hsl(var(--learning))" }} /></div></div>
        ); })}
      </div>

      <h2 className="font-display text-lg font-bold">Phase completion</h2>
      <div className="card space-y-3">
        {p.phases.map((ph) => { const pct = ph.total ? (ph.done / ph.total) * 100 : 0; return (
          <div key={ph.code}><div className="flex items-center justify-between text-sm"><span>P{ph.code} · {ph.title}</span><span className="text-muted">{Math.round(pct)}%</span></div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full" style={{ width: pct + "%", background: pct === 100 ? "hsl(var(--completed))" : "hsl(var(--learning))" }} /></div></div>
        ); })}
      </div>

      <div className="card"><div className="text-sm font-semibold text-muted">Study heatmap (52 weeks)</div><div className="mt-4"><Heatmap activity={p.activity} weeks={52} /></div></div>

      <h2 className="font-display text-lg font-bold">🏆 Achievements</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {achievements.map((a) => { const got = earnedMap.has(a.id); return (
          <div key={a.id} className={`card text-center ${got ? "" : "opacity-40 grayscale"}`}>
            <div className="text-3xl">{a.emoji}</div><div className="mt-2 text-sm font-bold">{a.name}</div><div className="mt-0.5 text-xs text-muted">{a.desc}</div>
          </div>
        ); })}
      </div>
    </div>
  );
}
