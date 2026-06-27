"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { todayKey } from "@/lib/utils";
import { Plus, Trash2, Pencil, X, Loader2 } from "lucide-react";

type Entry = { id: string; date: string; learned?: string; confused?: string; built?: string; observed?: string; apply?: string; questions?: string; tags: string[]; minutes: number; createdAt: string };
const PROMPTS = [
  { key: "learned", label: "What did you learn?" }, { key: "confused", label: "What confused you?" },
  { key: "built", label: "What did you build?" }, { key: "observed", label: "What did you observe?" },
  { key: "apply", label: "How will you apply it?" }, { key: "questions", label: "What questions remain?" },
] as const;

export default function JournalPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Entry | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery<{ entries: Entry[] }>({ queryKey: ["journal"], queryFn: async () => (await fetch("/api/journal")).json() });
  const entries = (data?.entries || []).filter((e) => !q || JSON.stringify(e).toLowerCase().includes(q.toLowerCase()));

  async function del(id: string) {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/journal?id=${id}`, { method: "DELETE" });
    qc.invalidateQueries({ queryKey: ["journal"] });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><div className="text-xs font-bold uppercase tracking-widest text-learning">Reflect · Implement · Review</div>
          <h1 className="mt-1 font-display text-3xl font-extrabold">Learning Journal</h1>
          <p className="mt-1 text-sm text-muted">Daily reflection turns information into judgement. Entries with minutes feed your streak.</p></div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" /> New entry</button>
      </div>

      <input className="input md:max-w-sm" placeholder="Search journal…" value={q} onChange={(e) => setQ(e.target.value)} />

      {isLoading ? <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-28" />)}</div>
        : entries.length === 0 ? <div className="card py-16 text-center text-faint"><div className="mb-2 text-4xl">📓</div>No entries yet. Capture today&apos;s learning to start your streak.</div>
        : <div className="space-y-4">{entries.map((e) => (
            <div key={e.id} className="card">
              <div className="flex items-center justify-between">
                <strong>{new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong>
                <div className="flex items-center gap-2">
                  {e.minutes > 0 && <span className="chip border-current/40 text-current">{e.minutes}m</span>}
                  <button className="btn !p-2" onClick={() => { setEditing(e); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></button>
                  <button className="btn !p-2" onClick={() => del(e.id)}><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              {PROMPTS.map((p) => (e as any)[p.key] && (
                <div key={p.key} className="mt-3"><div className="text-[11px] font-bold text-learning">{p.label}</div><p className="mt-0.5 whitespace-pre-wrap text-sm text-muted">{(e as any)[p.key]}</p></div>
              ))}
              {e.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{e.tags.map((t) => <span key={t} className="chip">#{t}</span>)}</div>}
            </div>
          ))}</div>}

      {open && <EntryModal entry={editing} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["journal"] }); }} />}
    </div>
  );
}

function EntryModal({ entry, onClose, onSaved }: { entry: Entry | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<any>(entry || { date: todayKey(), minutes: 0, tags: [] });
  const [tags, setTags] = useState((entry?.tags || []).join(", "));
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    const body = { ...form, tags: tags.split(",").map((t) => t.trim()).filter(Boolean), minutes: Number(form.minutes) || 0 };
    const res = await fetch("/api/journal", { method: entry ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry ? { ...body, id: entry.id } : body) });
    setLoading(false);
    if (!res.ok) { toast.error("Could not save"); return; }
    toast.success("Saved"); onSaved();
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-panel p-6 shadow-soft animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h3 className="font-display text-lg font-bold">{entry ? "Edit entry" : "New journal entry"}</h3><button className="btn !p-2" onClick={onClose}><X className="h-4 w-4" /></button></div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label><span className="mb-1 block text-xs font-semibold text-muted">Date</span><input className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
          <label><span className="mb-1 block text-xs font-semibold text-muted">Minutes</span><input type="number" className="input" value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} /></label>
        </div>
        {PROMPTS.map((p) => (
          <label key={p.key} className="mt-3 block"><span className="mb-1 block text-xs font-semibold text-muted">{p.label}</span>
            <textarea className="input min-h-[60px] resize-y" value={form[p.key] || ""} onChange={(e) => setForm({ ...form, [p.key]: e.target.value })} /></label>
        ))}
        <label className="mt-3 block"><span className="mb-1 block text-xs font-semibold text-muted">Tags</span><input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="comma,separated" /></label>
        <div className="mt-5 flex justify-end gap-2"><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</button></div>
      </div>
    </div>
  );
}
