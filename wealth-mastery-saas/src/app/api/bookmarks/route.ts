import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/rbac";
import { bookmarkSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = bookmarkSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const { nodeId, favorite } = parsed.data;
    const existing = await prisma.bookmark.findUnique({ where: { userId_nodeId: { userId: user.id, nodeId } } });
    if (existing && favorite === undefined) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ ok: true, bookmarked: false });
    }
    const rec = await prisma.bookmark.upsert({
      where: { userId_nodeId: { userId: user.id, nodeId } },
      update: { favorite: favorite ?? existing?.favorite ?? false },
      create: { userId: user.id, nodeId, favorite: favorite ?? false },
    });
    return NextResponse.json({ ok: true, bookmarked: true, favorite: rec.favorite });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
