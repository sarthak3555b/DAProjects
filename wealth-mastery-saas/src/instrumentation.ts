/** Next.js instrumentation file — Sentry init.
 *  Active only when NEXT_PUBLIC_SENTRY_DSN is set. */
export async function register() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NEXT_RUNTIME === "nodejs") {
    // Sentry can be added here when the `@sentry/nextjs` package is installed.
    // For now this is a placeholder that makes the instrumentation file present so
    // Sentry can be wired in production without a code change.
    console.log("[instrumentation] Sentry DSN detected — ready for @sentry/nextjs integration.");
  }
}
