import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/rbac";
import { goalSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = goalSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const d = parsed.data;
    await prisma.settings.upsert({
      where: { userId: user.id },
      update: { ...(d.weeklyGoalMin != null && { weeklyGoalMin: d.weeklyGoalMin }), ...(d.monthlyGoalMin != null && { monthlyGoalMin: d.monthlyGoalMin }), ...(d.yearlyGoalMin != null && { yearlyGoalMin: d.yearlyGoalMin }), ...(d.booksCompleted != null && { booksCompleted: d.booksCompleted }) },
      create: { userId: user.id, weeklyGoalMin: d.weeklyGoalMin ?? 240, monthlyGoalMin: d.monthlyGoalMin ?? 960, yearlyGoalMin: d.yearlyGoalMin ?? 11520, booksCompleted: d.booksCompleted ?? 0 },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
