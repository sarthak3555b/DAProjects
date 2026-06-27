import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ResourcesClient } from "@/components/resources-client";

export const metadata = { title: "Resources" };
export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const [resources, states] = await Promise.all([
    prisma.resource.findMany({ where: { published: true }, orderBy: { createdAt: "asc" } }),
    prisma.userResourceState.findMany({ where: { userId: session.user.id } }),
  ]);
  const stateMap = Object.fromEntries(states.map((s) => [s.resourceId, { completed: s.completed, bookmarked: s.bookmarked }]));
  return <ResourcesClient resources={resources as any} initialState={stateMap} />;
}
