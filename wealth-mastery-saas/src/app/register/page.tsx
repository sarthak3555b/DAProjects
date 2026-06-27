"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { OAuthButtons } from "@/components/oauth-buttons";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setLoading(false); toast.error(data.error || "Could not create account"); return; }
    const login = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (login?.error) { toast.error("Account created — please log in."); router.push("/login"); return; }
    toast.success("Account created. Welcome to Wealth Mastery OS!");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start your 10-year journey from beginner to capital allocator."
      footer={<>Already have an account? <Link href="/login" className="font-semibold text-learning hover:underline">Log in</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">Name</label>
          <input className="input" required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">Email</label>
          <input className="input" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">Password</label>
          <input className="input" type="password" required minLength={8} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="At least 8 characters" />
        </div>
        <button className="btn btn-primary w-full py-3" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </button>
      </form>
      <OAuthButtons />
    </AuthShell>
  );
}
