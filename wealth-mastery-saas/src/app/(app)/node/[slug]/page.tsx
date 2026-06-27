import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NodeDetail } from "@/components/node-detail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const node = await prisma.node.findUnique({ where: { slug }, select: { title: true } });
  return { title: node?.title ?? "Node" };
}

export default async function NodePage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { slug } = await params;
  const userId = session.user.id;

  const node = await prisma.node.findUnique({
    where: { slug },
    include: {
      module: { include: { phase: true } },
      prerequisites: { include: { prerequisite: { select: { id: true, slug: true, title: true } } } },
      dependents: { include: { dependent: { select: { id: true, slug: true, title: true } } } },
    },
  });
  if (!node) notFound();

  const [progress, bookmark, note, prereqProgress] = await Promise.all([
    prisma.userProgress.findUnique({ where: { userId_nodeId: { userId, nodeId: node.id } } }),
    prisma.bookmark.findUnique({ where: { userId_nodeId: { userId, nodeId: node.id } } }),
    prisma.note.findUnique({ where: { userId_nodeId: { userId, nodeId: node.id } } }),
    prisma.userProgress.findMany({ where: { userId, nodeId: { in: node.prerequisites.map((p) => p.prerequisiteId) }, status: "COMPLETED" }, select: { nodeId: true } }),
  ]);

  const completedPrereqs = new Set(prereqProgress.map((p) => p.nodeId));
  const locked = node.prerequisites.some((p) => !completedPrereqs.has(p.prerequisiteId));

  const data = {
    id: node.id, slug: node.slug, title: node.title, color: node.module.phase.color,
    phaseCode: node.module.phase.code, phaseTitle: node.module.phase.title, phaseId: node.module.phaseId,
    moduleName: node.module.name, description: node.description, purpose: node.purpose, whyItMatters: node.whyItMatters,
    outcomes: node.outcomes, tags: node.tags, hours: node.hours, difficulty: node.difficulty,
    exercises: node.exercises, assignments: (node.assignments as any) || [], assessment: (node.assessment as any) || [],
    reflection: node.reflection, realLife: node.realLife, careers: node.careers, mastery: node.mastery,
    resources: (node.resources as any) || {}, version: (node.version as any) || [],
    prerequisites: node.prerequisites.map((p) => ({ ...p.prerequisite, completed: completedPrereqs.has(p.prerequisiteId) })),
    dependents: node.dependents.map((d) => d.dependent),
    locked,
    state: {
      status: progress?.status ?? null,
      quizPassed: progress?.quizPassed ?? false,
      checklist: (progress?.checklist as Record<string, boolean>) ?? {},
      reviewDue: progress?.reviewDue ?? null,
      bookmarked: !!bookmark,
      favorite: bookmark?.favorite ?? false,
      note: note?.body ?? "",
    },
  };

  return <NodeDetail data={data as any} />;
}
