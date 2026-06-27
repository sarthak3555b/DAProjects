import { NextResponse } from "next/server";
import { seed } from "../../../../prisma/seed";

/** One-time content loader for non-technical deploys.
 *  Visit /api/seed?secret=YOUR_SEED_SECRET once after first deploy. */
export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized. Pass ?secret=YOUR_SEED_SECRET" }, { status: 401 });
  }
  try {
    const counts = await seed();
    return NextResponse.json({ ok: true, seeded: counts });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Seed failed" }, { status: 500 });
  }
}
