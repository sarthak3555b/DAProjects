/* Lightweight in-memory sliding-window rate limiter.
   Suitable for single-instance / serverless burst protection.
   For multi-region scale, swap the store for Upstash Redis. */

type Bucket = { count: number; reset: number };
const store = new Map<string, Bucket>();

export function rateLimit(key: string, limit = 30, windowMs = 60_000): { ok: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const b = store.get(key);
  if (!b || b.reset < now) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1, reset: now + windowMs };
  }
  b.count += 1;
  const ok = b.count <= limit;
  return { ok, remaining: Math.max(0, limit - b.count), reset: b.reset };
}

export function clientKey(req: Request, suffix = ""): string {
  const h = req.headers;
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "anon";
  return `${ip}:${suffix}`;
}

// periodic cleanup to avoid unbounded growth
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) if (v.reset < now) store.delete(k);
  }, 120_000).unref?.();
}
