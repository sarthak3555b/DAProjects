import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/** Returns the current session user or throws 401. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new AuthError("Not authenticated", 401);
  return session.user;
}

/** Ensures the current user has ADMIN role or throws 403. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new AuthError("Admin access required", 403);
  return user;
}

/** Writes an audit-log entry (best effort). */
export async function audit(userId: string | null, action: string, entity?: string, entityId?: string, meta?: any) {
  try {
    await prisma.auditLog.create({ data: { userId: userId ?? undefined, action, entity, entityId, meta } });
  } catch {
    /* non-fatal */
  }
}
