import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AuthError, audit } from "@/lib/rbac";

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { progress: true, studySessions: true } } },
    });
    return NextResponse.json({ users });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => null);
    const { userId, role } = body || {};
    if (!userId || !["USER", "ADMIN"].includes(role)) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    await prisma.user.update({ where: { id: userId }, data: { role } });
    await audit(admin.id, "user.role", "User", userId, { role });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
