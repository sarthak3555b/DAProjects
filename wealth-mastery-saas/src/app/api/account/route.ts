import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/rbac";

// GET = export all of the current user's data as JSON
export async function GET() {
  try {
    const user = await requireUser();
    const [progress, sessions, journal, projects, news, resources, bookmarks, notes, achievements, settings] = await Promise.all([
      prisma.userProgress.findMany({ where: { userId: user.id } }),
      prisma.studySession.findMany({ where: { userId: user.id } }),
      prisma.journalEntry.findMany({ where: { userId: user.id } }),
      prisma.userProjectState.findMany({ where: { userId: user.id } }),
      prisma.userNewsState.findMany({ where: { userId: user.id } }),
      prisma.userResourceState.findMany({ where: { userId: user.id } }),
      prisma.bookmark.findMany({ where: { userId: user.id } }),
      prisma.note.findMany({ where: { userId: user.id } }),
      prisma.userAchievement.findMany({ where: { userId: user.id } }),
      prisma.settings.findUnique({ where: { userId: user.id } }),
    ]);
    return new NextResponse(JSON.stringify({ user: { email: user.email, name: user.name }, progress, sessions, journal, projects, news, resources, bookmarks, notes, achievements, settings }, null, 2), {
      headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="wealth-mastery-os-backup.json"` },
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE = reset all of the current user's progress (keeps account & journal)
export async function DELETE() {
  try {
    const user = await requireUser();
    await prisma.$transaction([
      prisma.userProgress.deleteMany({ where: { userId: user.id } }),
      prisma.studySession.deleteMany({ where: { userId: user.id } }),
      prisma.userProjectState.deleteMany({ where: { userId: user.id } }),
      prisma.userAchievement.deleteMany({ where: { userId: user.id } }),
      prisma.bookmark.deleteMany({ where: { userId: user.id } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
