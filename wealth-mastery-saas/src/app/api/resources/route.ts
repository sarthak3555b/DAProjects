import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const resourceId: string = body?.resourceId;
    if (!resourceId) return NextResponse.json({ error: "resourceId required" }, { status: 400 });
    const existing = await prisma.userResourceState.findUnique({ where: { userId_resourceId: { userId: user.id, resourceId } } });
    const data: any = {};
    if (body.field === "completed") data.completed = !(existing?.completed);
    if (body.field === "bookmarked") data.bookmarked = !(existing?.bookmarked);
    const rec = await prisma.userResourceState.upsert({
      where: { userId_resourceId: { userId: user.id, resourceId } },
      update: data,
      create: { userId: user.id, resourceId, ...data },
    });
    return NextResponse.json({ ok: true, state: rec });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
