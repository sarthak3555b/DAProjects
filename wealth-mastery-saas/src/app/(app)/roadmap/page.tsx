import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeProgress } from "@/lib/progress";
import { RoadmapFlow, type RoadmapNode } from "@/components/roadmap-flow";

export const metadata = { title: "Roadmap" };
export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const phases = await prisma.phase.findMany({
    orderBy: { order: "asc" },
    include: { modules: { orderBy: { order: "asc" }, include: { nodes: { orderBy: { order: "asc" }, include: { prerequisites: true } } } } },
  });

  if (phases.length === 0) {
    return <div className="p-8"><div className="card max-w-lg"><h2 className="font-display text-lg font-bold">No content yet</h2><p className="mt-2 text-sm text-muted">Seed the database by visiting <code className="rounded bg-white/10 px-1.5 py-0.5">/api/seed?secret=YOUR_SEED_SECRET</code> once.</p></div></div>;
  }

  let completed = new Set<string>(), inProgress = new Set<string>(), currentId: string | null = null;
  try {
    const prog = await computeProgress(session.user.id);
    completed = new Set(prog.completedIds);
    inProgress = new Set(Object.entries(prog.statusById).filter(([, s]) => s === "IN_PROGRESS").map(([id]) => id));
    currentId = prog.currentNode?.id ?? null;
  } catch { /* ignore */ }

  const data: RoadmapNode[] = [];
  const edges: { source: string; target: string }[] = [];

  for (const ph of phases) {
    for (const m of ph.modules) {
      for (const n of m.nodes) {
        const prereqIds = n.prerequisites.map((d) => d.prerequisiteId);
        const prereqsMet = prereqIds.every((id) => completed.has(id));
        let status = "AVAILABLE";
        if (completed.has(n.id)) status = "COMPLETED";
        else if (!prereqsMet) status = "LOCKED";
        else if (inProgress.has(n.id)) status = "IN_PROGRESS";
        data.push({
          id: n.id, slug: n.slug, title: n.title, phaseCode: ph.code, phaseTitle: ph.title,
          moduleName: m.name, difficulty: n.difficulty, hours: n.hours, status,
          current: n.id === currentId, color: ph.color,
        });
        for (const pid of prereqIds) edges.push({ source: pid, target: n.id });
      }
    }
  }

  const phaseList = phases.map((p) => ({ code: p.code, title: p.title }));

  return (
    <div className="h-[calc(100vh-4rem)]">
      <RoadmapFlow data={data} edges={edges} phases={phaseList} />
    </div>
  );
}
