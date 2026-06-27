import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeProgress } from "@/lib/progress";

export const metadata = { title: "Career Explorer" };
export const dynamic = "force-dynamic";

export default async function CareerPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const careers = await prisma.career.findMany({ orderBy: { order: "asc" } });

  let phaseMap = new Map<string, { total: number; done: number }>();
  try { const p = await computeProgress(session.user.id); phaseMap = new Map(p.phases.map((x) => [x.code, { total: x.total, done: x.done }])); } catch {}

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-5 md:p-8">
      <div><div className="text-xs font-bold uppercase tracking-widest text-learning">Where this knowledge leads</div>
        <h1 className="mt-1 font-display text-3xl font-extrabold">Career Explorer</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">Eleven paths from beginner to capital allocator, each mapped to phases in your roadmap.</p></div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {careers.map((c) => {
          let total = 0, done = 0;
          for (const code of c.phases) { const m = phaseMap.get(code); if (m) { total += m.total; done += m.done; } }
          const pct = total ? (done / total) * 100 : 0;
          return (
            <Link key={c.id} href={`/career/${c.slug}`} className="card card-hover">
              <div className="flex items-center gap-3"><span className="text-3xl">{c.emoji}</span><div><div className="font-display font-bold">{c.name}</div><div className="text-xs text-faint">{c.phases.length} linked phases</div></div></div>
              <p className="mt-3 text-sm leading-relaxed text-muted line-clamp-3">{c.description}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full" style={{ width: pct + "%", background: `linear-gradient(90deg, ${c.color}, hsl(var(--project)))` }} /></div>
              <div className="mt-1.5 text-xs text-faint">Roadmap readiness: {Math.round(pct)}%</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
