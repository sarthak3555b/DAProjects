"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as Switch from "@radix-ui/react-switch";
import { fmtHours, relativeTime } from "@/lib/utils";
import { Shield, Download, RotateCcw } from "lucide-react";

type S = { reducedMotion: boolean; notifications: boolean; aiEnabled: boolean; aiProvider: string; weeklyGoalMin: number; monthlyGoalMin: number; yearlyGoalMin: number; booksCompleted: number };

export function SettingsClient({ user, settings, startedAt }: { user: { name: string; email: string; role?: string }; settings: S; startedAt: string | null }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [s, setS] = useState(settings);

  async function saveSettings(patch: Partial<S> & { name?: string }) {
    await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
  }
  async function saveGoals(patch: Partial<S>) {
    await fetch("/api/goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
  }
  function setToggle(k: keyof S, v: boolean) { setS((p) => ({ ...p, [k]: v })); saveSettings({ [k]: v } as any); if (k === "reducedMotion") document.body.classList.toggle("reduce-motion", v); }
  function setNum(k: keyof S, v: number) { setS((p) => ({ ...p, [k]: v })); }

  async function resetProgress() {
    if (!confirm("Reset all progress, projects and achievements? Your account and journal are kept.")) return;
    await fetch("/api/account", { method: "DELETE" });
    toast.success("Progress reset"); router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-5 md:p-8">
      <div><div className="text-xs font-bold uppercase tracking-widest text-learning">Configure your OS</div><h1 className="mt-1 font-display text-3xl font-extrabold">Settings</h1></div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="card">
          <h2 className="text-sm font-semibold text-muted">👤 Profile</h2>
          <label className="mt-4 block"><span className="mb-1 block text-xs font-semibold text-muted">Display name</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => saveSettings({ name })} /></label>
          <label className="mt-3 block"><span className="mb-1 block text-xs font-semibold text-muted">Email</span><input className="input opacity-60" value={user.email} disabled /></label>
          <p className="mt-3 text-xs text-faint">Started learning {startedAt ? relativeTime(startedAt) : "recently"}.</p>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-muted">🎯 Goals (hours)</h2>
          {([["Weekly", "weeklyGoalMin"], ["Monthly", "monthlyGoalMin"], ["Yearly", "yearlyGoalMin"]] as const).map(([label, key]) => (
            <label key={key} className="mt-3 block"><span className="mb-1 block text-xs font-semibold text-muted">{label} study goal (hours)</span>
              <input type="number" className="input" value={(s[key] as number) / 60} onChange={(e) => setNum(key, (parseFloat(e.target.value) || 0) * 60)} onBlur={() => saveGoals({ [key]: s[key] } as any)} /></label>
          ))}
          <label className="mt-3 block"><span className="mb-1 block text-xs font-semibold text-muted">Books completed</span>
            <input type="number" className="input" value={s.booksCompleted} onChange={(e) => setNum("booksCompleted", parseInt(e.target.value) || 0)} onBlur={() => saveGoals({ booksCompleted: s.booksCompleted })} /></label>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-muted">✨ Appearance &amp; behaviour</h2>
          <ToggleRow label="Reduce motion" checked={s.reducedMotion} onChange={(v) => setToggle("reducedMotion", v)} />
          <ToggleRow label="Notifications" checked={s.notifications} onChange={(v) => setToggle("notifications", v)} />
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-muted">🧠 AI Mentor</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted">The built-in mentor always works. To use OpenAI or Anthropic, set <code className="rounded bg-white/10 px-1 py-0.5">OPENAI_API_KEY</code> or <code className="rounded bg-white/10 px-1 py-0.5">ANTHROPIC_API_KEY</code> in your deployment env. The mentor auto-detects them.</p>
          <ToggleRow label="Prefer external AI when available" checked={s.aiEnabled} onChange={(v) => setToggle("aiEnabled", v)} />
        </div>
      </div>

      {user.role === "ADMIN" && (
        <Link href="/admin" className="card card-hover flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-prereq/15 text-prereq"><Shield className="h-5 w-5" /></span>
          <div><div className="font-semibold">Admin CMS</div><div className="text-sm text-muted">Manage phases, nodes, resources, news, careers and users.</div></div>
        </Link>
      )}

      <div className="card">
        <h2 className="text-sm font-semibold text-muted">💾 Data management</h2>
        <p className="mt-2 text-sm text-muted">Your data is stored securely in PostgreSQL and synced across devices. Export a backup anytime.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href="/api/account" className="btn btn-primary"><Download className="h-4 w-4" /> Export my data</a>
          <button className="btn" onClick={resetProgress}><RotateCcw className="h-4 w-4" /> Reset progress</button>
        </div>
      </div>

      <div className="card text-center">
        <div className="font-display font-extrabold">Wealth Mastery OS</div>
        <div className="mt-1 text-xs text-faint">Learn · Build · Observe · Reflect · Implement · Review · Repeat · v1.0</div>
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="mt-3 flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch.Root checked={checked} onCheckedChange={onChange} className="relative h-6 w-11 rounded-full bg-white/10 transition data-[state=checked]:bg-learning">
        <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[22px]" />
      </Switch.Root>
    </div>
  );
}
