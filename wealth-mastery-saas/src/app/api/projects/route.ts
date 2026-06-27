import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/rbac";
import { computeProgress, refreshAchievements } from "@/lib/progress";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const projectId: string = body?.projectId;
    const notes: string | undefined = body?.notes;
    if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

    const existing = await prisma.userProjectState.findUnique({ where: { userId_projectId: { userId: user.id, projectId } } });
    if (body?.toggle) {
      const done = !(existing?.done);
      await prisma.userProjectState.upsert({
        where: { userId_projectId: { userId: user.id, projectId } },
        update: { done, completedAt: done ? new Date() : null },
        create: { userId: user.id, projectId, done, completedAt: done ? new Date() : null },
      });
    } else if (notes !== undefined) {
      await prisma.userProjectState.upsert({
        where: { userId_projectId: { userId: user.id, projectId } },
        update: { notes },
        create: { userId: user.id, projectId, notes },
      });
    }
    const snapshot = await computeProgress(user.id);
    const newAch = await refreshAchievements(user.id, snapshot);
    return NextResponse.json({ ok: true, newAchievements: newAch });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
