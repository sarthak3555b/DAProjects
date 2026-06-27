import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeProgress } from "@/lib/progress";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await prisma.career.findUnique({ where: { slug } });
  return { title: c?.name ?? "Career" };
}

export default async function CareerDetail({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { slug } = await params;
  const c = await prisma.career.findUnique({ where: { slug } });
  if (!c) notFound();

  let phaseMap = new Map<string, { title: string; total: number; done: number }>();
  try { const p = await computeProgress(session.user.id); phaseMap = new Map(p.phases.map((x) => [x.code, x])); } catch {}
  const phases = await prisma.phase.findMany({ where: { code: { in: c.phases } }, orderBy: { order: "asc" }, select: { code: true, title: true, id: true } });

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-5 md:p-8">
      <div className="flex items-center gap-2 text-sm text-muted"><Link href="/career" className="hover:text-fg">Career Explorer</Link><ChevronRight className="h-3.5 w-3.5" /><span>{c.name}</span></div>
      <div className="rounded-xl border p-6" style={{ borderColor: `${c.color}55` }}>
        <div className="flex items-center gap-4"><span className="text-5xl">{c.emoji}</span><div><h1 className="font-display text-3xl font-extrabold">{c.name}</h1><p className="mt-1 text-muted">{c.description}</p></div></div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <div className="card"><div className="text-sm font-semibold text-muted">Core skills</div><div className="mt-3 flex flex-wrap gap-1.5">{c.skills.map((s) => <span key={s} className="chip border-learning/40 text-learning">{s}</span>)}</div></div>
          <div className="card"><div className="text-sm font-semibold text-muted">Roadmap to this career</div>
            <div className="mt-3 space-y-2">{phases.map((ph) => { const m = phaseMap.get(ph.code); const pct = m && m.total ? (m.done / m.total) * 100 : 0; return (
              <Link key={ph.code} href="/roadmap" className="block rounded-lg border border-border p-3 hover:border-white/20">
                <div className="flex items-center justify-between text-sm"><strong>Phase {ph.code} · {ph.title}</strong><span className="text-muted">{Math.round(pct)}%</span></div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-learning" style={{ width: pct + "%" }} /></div>
              </Link>
            ); })}</div>
          </div>
          <div className="card"><div className="text-sm font-semibold text-muted">Signature projects</div><div className="mt-3 space-y-1.5">{c.projects.map((p) => <Link key={p} href="/projects" className="block rounded-lg border border-border px-3 py-2 text-sm hover:border-white/20">🛠️ {p}</Link>)}</div></div>
        </div>
        <div className="space-y-5">
          <div className="card"><div className="text-sm font-semibold text-muted">Salary range</div><p className="mt-2 text-sm leading-relaxed text-muted">{c.salary}</p></div>
          <div className="card"><div className="text-sm font-semibold text-muted">AI impact</div><p className="mt-2 text-sm leading-relaxed text-muted">{c.aiImpact}</p></div>
          <div className="card"><div className="text-sm font-semibold text-muted">Future trends</div><p className="mt-2 text-sm leading-relaxed text-muted">{c.future}</p></div>
        </div>
      </div>
    </div>
  );
}
