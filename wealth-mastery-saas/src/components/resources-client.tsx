"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Star, Check, Search } from "lucide-react";

type Res = { id: string; title: string; source?: string; type: string; phaseCode?: string; url: string; note?: string };

export function ResourcesClient({ resources, initialState }: { resources: Res[]; initialState: Record<string, { completed: boolean; bookmarked: boolean }> }) {
  const [state, setState] = useState(initialState);
  const [type, setType] = useState("All");
  const [q, setQ] = useState("");

  const types = useMemo(() => ["All", ...Array.from(new Set(resources.map((r) => r.type)))], [resources]);
  const filtered = resources.filter((r) => (type === "All" || r.type === type) && (!q || (r.title + (r.source ?? "") + (r.note ?? "")).toLowerCase().includes(q.toLowerCase())));
  const doneCount = Object.values(state).filter((s) => s.completed).length;

  async function toggle(id: string, field: "completed" | "bookmarked") {
    const cur = state[id] || { completed: false, bookmarked: false };
    setState((s) => ({ ...s, [id]: { ...cur, [field]: !cur[field] } }));
    await fetch("/api/resources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resourceId: id, field }) });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><div className="text-xs font-bold uppercase tracking-widest text-learning">Curated &amp; versioned</div>
          <h1 className="mt-1 font-display text-3xl font-extrabold">Resource Library</h1>
          <p className="mt-1 text-sm text-muted">Hand-picked books, courses, videos, articles, podcasts and research.</p></div>
        <span className="chip border-completed/40 text-completed">{doneCount} completed</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {types.map((t) => <button key={t} onClick={() => setType(t)} className={`chip ${type === t ? "border-learning/50 text-learning" : ""}`}>{t}</button>)}
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface/60 px-3 py-2 md:max-w-sm"><Search className="h-4 w-4 text-faint" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search resources…" className="w-full bg-transparent text-sm outline-none" /></div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => {
          const st = state[r.id] || { completed: false, bookmarked: false };
          return (
            <div key={r.id} className="card card-hover flex flex-col">
              <div className="flex items-center justify-between"><span className="rounded bg-white/5 px-2 py-0.5 text-[10px] uppercase text-faint">{r.type}</span>{st.completed && <span className="chip border-completed/40 text-completed">✓</span>}</div>
              <div className="mt-2 font-semibold">{r.title}</div>
              <div className="text-xs text-faint">{r.source}</div>
              {r.note && <p className="mt-2 text-sm leading-relaxed text-muted">{r.note}</p>}
              <div className="mt-auto flex flex-wrap gap-2 pt-3">
                <a href={r.url} target="_blank" rel="noopener" className="btn btn-primary !py-1.5 text-xs">Open <ExternalLink className="h-3.5 w-3.5" /></a>
                <button className="btn !py-1.5 text-xs" onClick={() => toggle(r.id, "completed")}>{st.completed ? "Done ✓" : "Mark done"}</button>
                <button className="btn !py-1.5 text-xs" onClick={() => toggle(r.id, "bookmarked")}><Star className={`h-3.5 w-3.5 ${st.bookmarked ? "fill-gold text-gold" : ""}`} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
