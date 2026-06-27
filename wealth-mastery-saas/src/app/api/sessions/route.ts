import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/rbac";
import { sessionLogSchema } from "@/lib/validations";
import { computeProgress, refreshAchievements } from "@/lib/progress";
import { todayKey } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = sessionLogSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const { minutes, note, nodeId } = parsed.data;
    await prisma.studySession.create({ data: { userId: user.id, minutes, day: todayKey(), note, nodeId } });
    const snapshot = await computeProgress(user.id);
    const newAch = await refreshAchievements(user.id, snapshot);
    return NextResponse.json({ ok: true, progress: snapshot, newAchievements: newAch });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
