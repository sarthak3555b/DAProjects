import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/rbac";

export const revalidate = 300;

export async function GET() {
  try {
    await requireUser();
    const [nodes, resources, careers, news] = await Promise.all([
      prisma.node.findMany({ where: { published: true }, select: { slug: true, title: true, tags: true, module: { select: { name: true, phase: { select: { code: true, title: true } } } } } }),
      prisma.resource.findMany({ select: { id: true, title: true, type: true, source: true, url: true } }),
      prisma.career.findMany({ select: { slug: true, name: true } }),
      prisma.newsItem.findMany({ select: { id: true, title: true, category: true } }),
    ]);
    const index = [
      ...nodes.map((n) => ({ type: "node", title: n.title, sub: `${n.module.name} · Phase ${n.module.phase.code}`, href: `/node/${n.slug}`, keywords: n.tags.join(" ") })),
      ...careers.map((c) => ({ type: "career", title: c.name, sub: "Career path", href: `/career/${c.slug}`, keywords: "" })),
      ...resources.map((r) => ({ type: "resource", title: r.title, sub: `${r.type} · ${r.source ?? ""}`, href: r.url, external: true, keywords: r.type })),
      ...news.map((nw) => ({ type: "news", title: nw.title, sub: `${nw.category} · current affairs`, href: `/affairs`, keywords: nw.category })),
    ];
    return NextResponse.json({ index });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
