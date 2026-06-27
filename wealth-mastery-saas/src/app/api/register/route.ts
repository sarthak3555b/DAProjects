import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { audit } from "@/lib/rbac";

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "register"), 10, 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const { name, email, password } = parsed.data;
  const lower = email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: lower } });
  if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const isAdmin = process.env.ADMIN_EMAIL && lower === process.env.ADMIN_EMAIL.toLowerCase();

  const user = await prisma.user.create({
    data: {
      name, email: lower, passwordHash, role: isAdmin ? "ADMIN" : "USER",
      profile: { create: {} },
      settings: { create: {} },
      goals: { create: [
        { period: "WEEKLY", targetMin: 240 },
        { period: "MONTHLY", targetMin: 960 },
        { period: "YEARLY", targetMin: 11520 },
      ] },
    },
  });
  await audit(user.id, "user.register");
  return NextResponse.json({ ok: true, id: user.id });
}
