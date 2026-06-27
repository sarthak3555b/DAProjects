import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    if (typeof body?.name === "string" && body.name.trim()) {
      await prisma.user.update({ where: { id: user.id }, data: { name: body.name.trim().slice(0, 80) } });
    }
    const fields = ["reducedMotion", "notifications", "aiEnabled", "aiProvider", "aiModel"] as const;
    const data: any = {};
    for (const f of fields) if (body?.[f] !== undefined) data[f] = body[f];
    if (Object.keys(data).length) {
      await prisma.settings.upsert({ where: { userId: user.id }, update: data, create: { userId: user.id, ...data } });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
