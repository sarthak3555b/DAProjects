import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AuthError } from "@/lib/rbac";

/** Bulk export of all curriculum content as JSON (backup / migration). */
export async function GET() {
  try {
    await requireAdmin();
    const [phases, resources, careers, news] = await Promise.all([
      prisma.phase.findMany({ orderBy: { order: "asc" }, include: { modules: { orderBy: { order: "asc" }, include: { nodes: { orderBy: { order: "asc" }, include: { prerequisites: true } } } }, projects: true } }),
      prisma.resource.findMany(),
      prisma.career.findMany(),
      prisma.newsItem.findMany(),
    ]);
    return new NextResponse(JSON.stringify({ phases, resources, careers, news }, null, 2), {
      headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="wms-content-backup.json"` },
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
