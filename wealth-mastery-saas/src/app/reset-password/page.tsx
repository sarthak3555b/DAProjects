"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Loader2 } from "lucide-react";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Could not reset password"); return; }
    toast.success("Password updated. Please log in.");
    router.push("/login");
  }

  if (!token) {
    return <p className="text-sm text-muted">This reset link is missing its token. <Link href="/forgot-password" className="text-learning hover:underline">Request a new one</Link>.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-muted">New password</label>
        <input className="input" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
      </div>
      <button className="btn btn-primary w-full py-3" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Set a new password" footer={<Link href="/login" className="font-semibold text-learning hover:underline">Back to login</Link>}>
      <Suspense fallback={<div className="skeleton h-24" />}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
