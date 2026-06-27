import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProjectsClient } from "@/components/projects-client";

export const metadata = { title: "Projects" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [phases, states] = await Promise.all([
    prisma.phase.findMany({ orderBy: { order: "asc" }, include: { projects: { orderBy: { order: "asc" } } } }),
    prisma.userProjectState.findMany({ where: { userId: session.user.id } }),
  ]);
  const stateMap = Object.fromEntries(states.map((s) => [s.projectId, { done: s.done, notes: s.notes ?? "" }]));
  const groups = phases.filter((p) => p.projects.length).map((p) => ({ code: p.code, title: p.title, projects: p.projects.map((pr) => ({ id: pr.id, name: pr.name })) }));

  return <ProjectsClient groups={groups} initialState={stateMap} />;
}
