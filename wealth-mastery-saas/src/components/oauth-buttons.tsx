"use client";

import { signIn } from "next-auth/react";

/** OAuth buttons render only when the provider env vars are present.
 *  We detect availability via a public flag exposed by the server. */
export function OAuthButtons() {
  const google = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "1";
  const github = process.env.NEXT_PUBLIC_GITHUB_ENABLED === "1";
  if (!google && !github) return null;
  return (
    <div className="mt-5">
      <div className="my-4 flex items-center gap-3 text-xs text-faint">
        <span className="h-px flex-1 bg-border" /> or continue with <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid gap-2">
        {google && <button className="btn w-full" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>Continue with Google</button>}
        {github && <button className="btn w-full" onClick={() => signIn("github", { callbackUrl: "/dashboard" })}>Continue with GitHub</button>}
      </div>
    </div>
  );
}
