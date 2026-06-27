/* ============================================================
   Wealth Mastery OS — Database seed
   Idempotent: safe to run repeatedly. Loads all curriculum
   content (phases, modules, nodes, dependencies, resources,
   careers, news) and achievement definitions.
   Run: npm run db:seed   (or visit /api/seed?secret=... once)
   ============================================================ */
import { PrismaClient, Difficulty } from "@prisma/client";
import seedData from "./seed-data.json";

const prisma = new PrismaClient();

const DIFF: Difficulty[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT", "MASTER"] as Difficulty[];

type SeedData = {
  phases: any[];
  resources: any[];
  careers: any[];
  news: any[];
};

const ACHIEVEMENTS = [
  { code: "first-step", emoji: "🌱", name: "First Step", desc: "Complete your first node" },
  { code: "ten-nodes", emoji: "📚", name: "Scholar", desc: "Complete 10 nodes" },
  { code: "fifty-nodes", emoji: "🎓", name: "Polymath", desc: "Complete 50 nodes" },
  { code: "phase-done", emoji: "🏆", name: "Phase Conqueror", desc: "Finish an entire phase" },
  { code: "streak-7", emoji: "🔥", name: "Week Warrior", desc: "7-day learning streak" },
  { code: "streak-30", emoji: "⚡", name: "Unstoppable", desc: "30-day learning streak" },
  { code: "ten-hours", emoji: "⏱️", name: "Deep Worker", desc: "Log 10 hours of study" },
  { code: "hundred-hours", emoji: "💪", name: "Centurion", desc: "Log 100 hours of study" },
  { code: "first-project", emoji: "🛠️", name: "Builder", desc: "Complete your first project" },
  { code: "journal-7", emoji: "📓", name: "Reflective Mind", desc: "Write 7 journal entries" },
  { code: "first-book", emoji: "📖", name: "Bookworm", desc: "Log your first finished book" },
  { code: "allocator", emoji: "👑", name: "Capital Allocator", desc: "Reach 50% overall completion" },
];

export async function seed() {
  const data: SeedData = seedData as unknown as SeedData;

  // Achievements
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({ where: { code: a.code }, create: a, update: a });
  }

  // map original node id (e.g. "n12") -> slug, for dependency wiring
  const origIdToSlug = new Map<string, string>();
  for (const p of data.phases) for (const m of p.modules) for (const n of m.nodes) origIdToSlug.set(n.id, n.slug);

  for (const p of data.phases) {
    const phase = await prisma.phase.upsert({
      where: { code: String(p.code) },
      update: { title: p.title, subtitle: p.subtitle, blurb: p.blurb, color: p.color, order: p.index },
      create: { code: String(p.code), title: p.title, subtitle: p.subtitle, blurb: p.blurb, color: p.color, order: p.index },
    });

    // projects for phase
    let pOrder = 0;
    for (const projName of p.projects || []) {
      const existing = await prisma.project.findFirst({ where: { name: projName, phaseId: phase.id } });
      if (!existing) {
        await prisma.project.create({ data: { name: projName, phaseId: phase.id, phaseCode: phase.code, order: pOrder++ } });
      }
    }

    for (const m of p.modules) {
      let mod = await prisma.module.findFirst({ where: { phaseId: phase.id, name: m.name } });
      if (!mod) mod = await prisma.module.create({ data: { phaseId: phase.id, name: m.name, order: m.order } });

      for (const n of m.nodes) {
        const diff = DIFF[(n.difficulty || 1) - 1] || "BEGINNER";
        await prisma.node.upsert({
          where: { slug: n.slug },
          update: {
            title: n.title, moduleId: mod.id, order: n.order, description: n.description, purpose: n.purpose,
            whyItMatters: n.whyItMatters, outcomes: n.outcomes || [], tags: n.tags || [], hours: n.hours || 3,
            difficulty: diff as Difficulty, exercises: n.exercises || [], reflection: n.reflection || [],
            realLife: n.realLife || [], careers: n.careers || [], mastery: n.mastery || [],
            assignments: n.assignments || [], assessment: n.assessment || [], resources: n.resources || {}, version: n.version || [],
          },
          create: {
            slug: n.slug, title: n.title, moduleId: mod.id, order: n.order, description: n.description, purpose: n.purpose,
            whyItMatters: n.whyItMatters, outcomes: n.outcomes || [], tags: n.tags || [], hours: n.hours || 3,
            difficulty: diff as Difficulty, exercises: n.exercises || [], reflection: n.reflection || [],
            realLife: n.realLife || [], careers: n.careers || [], mastery: n.mastery || [],
            assignments: n.assignments || [], assessment: n.assessment || [], resources: n.resources || {}, version: n.version || [],
          },
        });
      }
    }
  }

  // dependencies (after all nodes exist)
  for (const p of data.phases) for (const m of p.modules) for (const n of m.nodes) {
    const dependentSlug = n.slug;
    for (const preId of n.prerequisites || []) {
      const preSlug = origIdToSlug.get(preId);
      if (!preSlug) continue;
      const [pre, dep] = await Promise.all([
        prisma.node.findUnique({ where: { slug: preSlug } }),
        prisma.node.findUnique({ where: { slug: dependentSlug } }),
      ]);
      if (pre && dep) {
        await prisma.dependency.upsert({
          where: { prerequisiteId_dependentId: { prerequisiteId: pre.id, dependentId: dep.id } },
          update: {}, create: { prerequisiteId: pre.id, dependentId: dep.id },
        });
      }
    }
  }

  // resources
  for (const r of data.resources) {
    const existing = await prisma.resource.findFirst({ where: { title: r.title, source: r.source || null } });
    const payload = { title: r.title, source: r.source, type: r.type, phaseCode: r.phase, url: r.url, note: r.note };
    if (existing) await prisma.resource.update({ where: { id: existing.id }, data: payload });
    else await prisma.resource.create({ data: payload });
  }

  // careers
  for (const c of data.careers) {
    await prisma.career.upsert({
      where: { slug: c.id },
      update: { name: c.name, emoji: c.emoji, color: c.color, description: c.description, skills: c.skills || [], phases: c.phases || [], projects: c.projects || [], salary: c.salary, aiImpact: c.aiImpact, future: c.future },
      create: { slug: c.id, name: c.name, emoji: c.emoji, color: c.color, description: c.description, skills: c.skills || [], phases: c.phases || [], projects: c.projects || [], salary: c.salary, aiImpact: c.aiImpact, future: c.future },
    });
  }

  // news
  for (const nw of data.news) {
    const existing = await prisma.newsItem.findFirst({ where: { title: nw.title } });
    const payload = { category: nw.category, title: nw.title, date: new Date(nw.date), what: nw.what, why: nw.why, matters: nw.matters, wealth: nw.wealth, tags: nw.tags || [] };
    if (existing) await prisma.newsItem.update({ where: { id: existing.id }, data: payload });
    else await prisma.newsItem.create({ data: payload });
  }

  const counts = {
    phases: await prisma.phase.count(),
    modules: await prisma.module.count(),
    nodes: await prisma.node.count(),
    dependencies: await prisma.dependency.count(),
    resources: await prisma.resource.count(),
    careers: await prisma.career.count(),
    news: await prisma.newsItem.count(),
    projects: await prisma.project.count(),
    achievements: await prisma.achievement.count(),
  };
  return counts;
}

// Allow `tsx prisma/seed.ts`
const isDirect = process.argv[1] && process.argv[1].includes("seed");
if (isDirect) {
  seed()
    .then((c) => { console.log("Seed complete:", c); return prisma.$disconnect(); })
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
}
