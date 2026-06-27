import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminClient } from "@/components/admin-client";

export const metadata = { title: "Admin CMS" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [counts, news, resources, modules, users, audit] = await Promise.all([
    Promise.all([prisma.phase.count(), prisma.module.count(), prisma.node.count(), prisma.dependency.count(), prisma.resource.count(), prisma.career.count(), prisma.newsItem.count(), prisma.user.count()]),
    prisma.newsItem.findMany({ orderBy: { date: "desc" }, take: 50 }),
    prisma.resource.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.module.findMany({ orderBy: [{ phase: { order: "asc" } }, { order: "asc" }], include: { phase: { select: { code: true } } } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  const [phases, mods, nodes, deps, resCount, careers, newsCount, userCount] = counts;

  return (
    <AdminClient
      stats={{ phases, modules: mods, nodes, dependencies: deps, resources: resCount, careers, news: newsCount, users: userCount }}
      news={news.map((n) => ({ ...n, date: n.date.toISOString() })) as any}
      resources={resources as any}
      modules={modules.map((m) => ({ id: m.id, label: `P${m.phase.code} · ${m.name}` }))}
      users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })) as any}
      audit={audit.map((a) => ({ id: a.id, action: a.action, entity: a.entity, createdAt: a.createdAt.toISOString() }))}
    />
  );
}
