import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/rbac";
import { progressSchema } from "@/lib/validations";
import { computeProgress, refreshAchievements } from "@/lib/progress";
import { todayKey } from "@/lib/utils";

export async function GET() {
  try {
    const user = await requireUser();
    const data = await computeProgress(user.id);
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = progressSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const { nodeId, status, quizPassed, checklist } = parsed.data;

    const node = await prisma.node.findUnique({ where: { id: nodeId } });
    if (!node) return NextResponse.json({ error: "Node not found" }, { status: 404 });

    const existing = await prisma.userProgress.findUnique({ where: { userId_nodeId: { userId: user.id, nodeId } } });
    const nowCompleting = status === "COMPLETED" && existing?.status !== "COMPLETED";

    const data: any = {};
    if (status) data.status = status;
    if (typeof quizPassed === "boolean") data.quizPassed = quizPassed;
    if (checklist) data.checklist = checklist;
    if (status === "COMPLETED") { data.completedAt = new Date(); data.reviewDue = new Date(Date.now() + 7 * 86400000); }
    if (status && status !== "COMPLETED") { data.completedAt = null; }

    await prisma.userProgress.upsert({
      where: { userId_nodeId: { userId: user.id, nodeId } },
      update: data,
      create: { userId: user.id, nodeId, status: status ?? "IN_PROGRESS", quizPassed: quizPassed ?? false, checklist: checklist ?? {}, completedAt: status === "COMPLETED" ? new Date() : null, reviewDue: status === "COMPLETED" ? new Date(Date.now() + 7 * 86400000) : null },
    });

    // completing a node logs its estimated hours as a study session (counts toward progress)
    if (nowCompleting) {
      await prisma.studySession.create({ data: { userId: user.id, minutes: Math.round(node.hours * 60), day: todayKey(), nodeId, note: `Completed: ${node.title}` } });
    }

    const snapshot = await computeProgress(user.id);
    const newAch = await refreshAchievements(user.id, snapshot);
    return NextResponse.json({ ok: true, progress: snapshot, newAchievements: newAch });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
