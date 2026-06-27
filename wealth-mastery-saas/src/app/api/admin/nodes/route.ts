import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AuthError, audit } from "@/lib/rbac";
import { nodeAdminSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = nodeAdminSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
    const d = parsed.data;
    const data = {
      slug: d.slug, title: d.title, moduleId: d.moduleId, description: d.description, purpose: d.purpose,
      whyItMatters: d.whyItMatters, hours: d.hours, difficulty: d.difficulty, outcomes: d.outcomes ?? [],
      tags: d.tags ?? [], published: d.published ?? true,
    };
    const node = d.id
      ? await prisma.node.update({ where: { id: d.id }, data })
      : await prisma.node.create({ data });
    await audit(admin.id, d.id ? "node.update" : "node.create", "Node", node.id);
    return NextResponse.json({ ok: true, node });
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    if (e?.code === "P2002") return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await requireAdmin();
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await prisma.node.delete({ where: { id } });
    await audit(admin.id, "node.delete", "Node", id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
