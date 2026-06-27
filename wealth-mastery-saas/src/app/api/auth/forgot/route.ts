import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { forgotSchema } from "@/lib/validations";
import { sendEmail } from "@/lib/email";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "forgot"), 5, 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = forgotSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  // Always respond OK (no account enumeration)
  if (user) {
    const token = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({ data: { email, token, expires: new Date(Date.now() + 3600_000) } });
    const base = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const link = `${base}/reset-password?token=${token}`;
    await sendEmail(email, "Reset your Wealth Mastery OS password",
      `<p>Reset your password using the link below (valid for 1 hour):</p><p><a href="${link}">${link}</a></p>`);
  }
  return NextResponse.json({ ok: true });
}
