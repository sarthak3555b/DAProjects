"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

export function LogSessionButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState(60);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ minutes, note: note || undefined }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Could not log session"); return; }
    (data.newAchievements || []).forEach((a: string) => toast.success("Achievement unlocked! 🏆"));
    toast.success(`Logged ${minutes} minutes. Streak alive!`);
    setOpen(false); setNote("");
    router.refresh();
  }

  return (
    <>
      <button className="btn" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Log session</button>
      {open && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-xl border border-border bg-panel p-6 shadow-soft animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold">Log a learning session</h3>
            <label className="mt-4 block text-xs font-semibold text-muted">Minutes studied</label>
            <input type="number" className="input mt-1.5" value={minutes} min={1} onChange={(e) => setMinutes(parseInt(e.target.value) || 0)} />
            <label className="mt-3 block text-xs font-semibold text-muted">What did you focus on? (optional)</label>
            <input className="input mt-1.5" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Compound interest" />
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit} disabled={loading || minutes <= 0}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
