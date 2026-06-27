import { prisma } from "@/lib/prisma";
import { todayKey } from "@/lib/utils";

export type OrderedNode = {
  id: string;
  slug: string;
  title: string;
  hours: number;
  phaseCode: string;
  phaseTitle: string;
  moduleName: string;
  prerequisites: string[];
};

/** Ordered list of nodes across the whole curriculum (phase→module→node). */
export async function getOrderedNodes(): Promise<OrderedNode[]> {
  const phases = await prisma.phase.findMany({
    orderBy: { order: "asc" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          nodes: {
            orderBy: { order: "asc" },
            include: { prerequisites: { select: { prerequisiteId: true } } },
          },
        },
      },
    },
  });
  const out: OrderedNode[] = [];
  for (const p of phases)
    for (const m of p.modules)
      for (const n of m.nodes)
        out.push({
          id: n.id, slug: n.slug, title: n.title, hours: n.hours,
          phaseCode: p.code, phaseTitle: p.title, moduleName: m.name,
          prerequisites: n.prerequisites.map((d) => d.prerequisiteId),
        });
  return out;
}

export async function computeProgress(userId: string) {
  const [nodes, progressRows, sessions, projects, profile, settings, journalCount] = await Promise.all([
    getOrderedNodes(),
    prisma.userProgress.findMany({ where: { userId } }),
    prisma.studySession.findMany({ where: { userId }, select: { minutes: true, day: true, createdAt: true } }),
    prisma.userProjectState.findMany({ where: { userId, done: true } }),
    prisma.profile.findUnique({ where: { userId } }),
    prisma.settings.findUnique({ where: { userId } }),
    prisma.journalEntry.count({ where: { userId } }),
  ]);

  const completed = new Set(progressRows.filter((r) => r.status === "COMPLETED").map((r) => r.nodeId));
  const statusById = new Map(progressRows.map((r) => [r.nodeId, r.status]));

  const total = nodes.length;
  const done = nodes.filter((n) => completed.has(n.id)).length;

  // current node = first non-completed whose prerequisites are all completed
  let current: OrderedNode | null = null;
  for (const n of nodes) {
    if (!completed.has(n.id) && n.prerequisites.every((p) => completed.has(p))) { current = n; break; }
  }

  // hours
  const totalMinutes = sessions.reduce((s, x) => s + x.minutes, 0);

  // activity map for heatmap + streak
  const activity: Record<string, number> = {};
  for (const s of sessions) activity[s.day] = (activity[s.day] || 0) + s.minutes;

  // streak
  let streak = 0;
  const d = new Date();
  if (!activity[todayKey(d)]) d.setDate(d.getDate() - 1);
  while (activity[todayKey(d)] && activity[todayKey(d)] > 0) { streak++; d.setDate(d.getDate() - 1); }

  // phase completion + phases finished
  const phaseMap: Record<string, { code: string; title: string; total: number; done: number }> = {};
  for (const n of nodes) {
    const k = n.phaseCode;
    phaseMap[k] = phaseMap[k] || { code: n.phaseCode, title: n.phaseTitle, total: 0, done: 0 };
    phaseMap[k].total++;
    if (completed.has(n.id)) phaseMap[k].done++;
  }
  const phasesArr = Object.values(phaseMap);
  const phasesCompleted = phasesArr.filter((p) => p.total > 0 && p.done === p.total).length;

  return {
    totalNodes: total,
    completedCount: done,
    overallPct: total ? (done / total) * 100 : 0,
    hours: Math.round((totalMinutes / 60) * 10) / 10,
    totalMinutes,
    streak,
    phasesCompleted,
    projectsCompleted: projects.length,
    books: settings?.booksCompleted ?? 0,
    journalCount,
    currentNode: current,
    currentPhase: current ? phaseMap[current.phaseCode] : null,
    activity,
    phases: phasesArr,
    statusById: Object.fromEntries(statusById),
    completedIds: Array.from(completed),
    startedAt: profile?.startedAt ?? null,
  };
}

/** Periods helper for goals (minutes within current week/month/year). */
export function periodMinutes(activity: Record<string, number>, period: "weekly" | "monthly" | "yearly") {
  const now = new Date();
  let total = 0;
  for (const k in activity) {
    const dt = new Date(k);
    if (period === "weekly") { const diff = (now.getTime() - dt.getTime()) / 86400000; if (diff < 7 && diff >= -1) total += activity[k]; }
    else if (period === "monthly") { if (dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear()) total += activity[k]; }
    else if (period === "yearly") { if (dt.getFullYear() === now.getFullYear()) total += activity[k]; }
  }
  return total;
}

const ACH_RULES: { code: string; test: (s: any) => boolean }[] = [
  { code: "first-step", test: (s) => s.completedCount >= 1 },
  { code: "ten-nodes", test: (s) => s.completedCount >= 10 },
  { code: "fifty-nodes", test: (s) => s.completedCount >= 50 },
  { code: "phase-done", test: (s) => s.phasesCompleted >= 1 },
  { code: "streak-7", test: (s) => s.streak >= 7 },
  { code: "streak-30", test: (s) => s.streak >= 30 },
  { code: "ten-hours", test: (s) => s.hours >= 10 },
  { code: "hundred-hours", test: (s) => s.hours >= 100 },
  { code: "first-project", test: (s) => s.projectsCompleted >= 1 },
  { code: "journal-7", test: (s) => s.journalCount >= 7 },
  { code: "first-book", test: (s) => s.books >= 1 },
  { code: "allocator", test: (s) => s.overallPct >= 50 },
];

/** Evaluates achievement rules and unlocks any newly-earned ones. Returns newly unlocked codes. */
export async function refreshAchievements(userId: string, snapshot: any): Promise<string[]> {
  const earned = ACH_RULES.filter((r) => r.test(snapshot)).map((r) => r.code);
  if (!earned.length) return [];
  const achievements = await prisma.achievement.findMany({ where: { code: { in: earned } } });
  const existing = await prisma.userAchievement.findMany({ where: { userId, achievementId: { in: achievements.map((a) => a.id) } } });
  const have = new Set(existing.map((e) => e.achievementId));
  const toCreate = achievements.filter((a) => !have.has(a.id));
  if (toCreate.length) {
    await prisma.userAchievement.createMany({ data: toCreate.map((a) => ({ userId, achievementId: a.id })), skipDuplicates: true });
    for (const a of toCreate) {
      await prisma.notification.create({ data: { userId, icon: a.emoji, text: `Achievement unlocked: ${a.name}`, route: "/analytics" } });
    }
  }
  return toCreate.map((a) => a.code);
}
