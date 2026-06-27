import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/rbac";
import { journalSchema } from "@/lib/validations";
import { todayKey } from "@/lib/utils";

export async function GET() {
  try {
    const user = await requireUser();
    const entries = await prisma.journalEntry.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ entries });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = journalSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const d = parsed.data;
    const minutes = d.minutes ?? 0;
    const entry = await prisma.journalEntry.create({
      data: {
        userId: user.id, date: d.date || todayKey(), learned: d.learned, confused: d.confused, built: d.built,
        observed: d.observed, apply: d.apply, questions: d.questions, body: d.learned, tags: d.tags || [], minutes,
      },
    });
    if (minutes > 0) await prisma.studySession.create({ data: { userId: user.id, minutes, day: d.date || todayKey(), note: "Journal session" } });
    return NextResponse.json({ ok: true, entry });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = journalSchema.safeParse(body);
    if (!parsed.success || !body?.id) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const d = parsed.data;
    const existing = await prisma.journalEntry.findFirst({ where: { id: body.id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const entry = await prisma.journalEntry.update({
      where: { id: body.id },
      data: { date: d.date, learned: d.learned, confused: d.confused, built: d.built, observed: d.observed, apply: d.apply, questions: d.questions, body: d.learned, tags: d.tags || [], minutes: d.minutes ?? existing.minutes },
    });
    return NextResponse.json({ ok: true, entry });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireUser();
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await prisma.journalEntry.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
