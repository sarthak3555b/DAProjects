import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AuthError, audit } from "@/lib/rbac";
import { resourceAdminSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = resourceAdminSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
    const d = parsed.data;
    const item = d.id
      ? await prisma.resource.update({ where: { id: d.id }, data: { title: d.title, source: d.source, type: d.type, phaseCode: d.phaseCode, url: d.url, note: d.note } })
      : await prisma.resource.create({ data: { title: d.title, source: d.source, type: d.type, phaseCode: d.phaseCode, url: d.url, note: d.note } });
    await audit(admin.id, d.id ? "resource.update" : "resource.create", "Resource", item.id);
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
    await prisma.resource.delete({ where: { id } });
    await audit(admin.id, "resource.delete", "Resource", id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
