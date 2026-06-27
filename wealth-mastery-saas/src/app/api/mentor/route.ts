import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/rbac";
import { mentorSchema } from "@/lib/validations";
import { mentorReply } from "@/lib/mentor";
import { computeProgress } from "@/lib/progress";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function GET() {
  try {
    const user = await requireUser();
    const messages = await prisma.mentorMessage.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" }, take: 100 });
    return NextResponse.json({ messages });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!rateLimit(clientKey(req, "mentor:" + user.id), 30, 60_000).ok) return NextResponse.json({ error: "Slow down a moment." }, { status: 429 });
    const body = await req.json().catch(() => null);
    const parsed = mentorSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const history = await prisma.mentorMessage.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 8 });
    const ordered = history.reverse().map((m) => ({ role: m.role as "user" | "assistant", text: m.text }));
    const prog = await computeProgress(user.id);
    const ctx = { currentNode: prog.currentNode?.title ?? null, streak: prog.streak, pct: prog.overallPct };

    await prisma.mentorMessage.create({ data: { userId: user.id, role: "user", text: parsed.data.text } });
    const reply = await mentorReply(parsed.data.text, ordered, ctx);
    const saved = await prisma.mentorMessage.create({ data: { userId: user.id, role: "assistant", text: reply } });
    return NextResponse.json({ ok: true, reply: saved.text });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
