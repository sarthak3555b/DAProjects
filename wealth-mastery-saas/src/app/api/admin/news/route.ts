import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AuthError, audit } from "@/lib/rbac";
import { newsSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = newsSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const d = parsed.data;
    const item = d.id
      ? await prisma.newsItem.update({ where: { id: d.id }, data: { category: d.category, title: d.title, what: d.what, why: d.why, matters: d.matters, wealth: d.wealth, tags: d.tags || [] } })
      : await prisma.newsItem.create({ data: { category: d.category, title: d.title, what: d.what, why: d.why, matters: d.matters, wealth: d.wealth, tags: d.tags || [] } });
    await audit(admin.id, d.id ? "news.update" : "news.create", "NewsItem", item.id);
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await requireAdmin();
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await prisma.newsItem.delete({ where: { id } });
    await audit(admin.id, "news.delete", "NewsItem", id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
