import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const newsId: string = body?.newsId;
    if (!newsId) return NextResponse.json({ error: "newsId required" }, { status: 400 });
    const existing = await prisma.userNewsState.findUnique({ where: { userId_newsId: { userId: user.id, newsId } } });
    const data: any = {};
    if (body.field === "read") data.read = !(existing?.read);
    if (body.field === "bookmarked") data.bookmarked = !(existing?.bookmarked);
    if (body.field === "note") data.note = String(body.note ?? "");
    const rec = await prisma.userNewsState.upsert({
      where: { userId_newsId: { userId: user.id, newsId } },
      update: data,
      create: { userId: user.id, newsId, ...data },
    });
    return NextResponse.json({ ok: true, state: rec });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
