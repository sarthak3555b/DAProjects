"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setLoading(false);
    setSent(true);
    toast.success("If that email exists, a reset link is on its way.");
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a secure link to set a new password."
      footer={<Link href="/login" className="font-semibold text-learning hover:underline">Back to login</Link>}
    >
      {sent ? (
        <p className="rounded-md border border-completed/40 bg-completed/10 p-4 text-sm text-muted">
          Check your inbox for a reset link (valid for 1 hour). If you don&apos;t see it, check spam.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <button className="btn btn-primary w-full py-3" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
