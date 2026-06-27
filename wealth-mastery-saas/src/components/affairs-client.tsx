"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bookmark, Check } from "lucide-react";

type News = { id: string; category: string; title: string; date: string; what?: string; why?: string; matters?: string; wealth?: string; tags: string[] };
const CATS = ["All", "Economy", "Business", "Markets", "Technology", "Geopolitics"];
const CAT_CLASS: Record<string, string> = {
  Economy: "border-learning/40 text-learning",
  Business: "border-current/40 text-current",
  Markets: "border-completed/40 text-completed",
  Technology: "border-project/40 text-project",
  Geopolitics: "border-prereq/40 text-prereq",
};

export function AffairsClient({ items, initialState, isAdmin }: { items: News[]; initialState: Record<string, { read: boolean; bookmarked: boolean; note: string }>; isAdmin: boolean }) {
  const router = useRouter();
  const [cat, setCat] = useState("All");
  const [state, setState] = useState(initialState);
  const filtered = items.filter((n) => cat === "All" || n.category === cat);

  async function toggle(id: string, field: "read" | "bookmarked") {
    const cur = state[id] || { read: false, bookmarked: false, note: "" };
    setState((s) => ({ ...s, [id]: { ...cur, [field]: !cur[field] } }));
    await fetch("/api/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newsId: id, field }) });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><div className="text-xs font-bold uppercase tracking-widest text-learning">Connect theory to the real world</div>
          <h1 className="mt-1 font-display text-3xl font-extrabold">Current Affairs Engine</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">Every item answers: What happened? Why? Why it matters? How it affects wealth creation.</p></div>
        {isAdmin && <a href="/admin?tab=news" className="btn btn-primary">＋ Add item</a>}
      </div>

      <div className="flex flex-wrap gap-2">{CATS.map((c) => <button key={c} onClick={() => setCat(c)} className={`chip ${cat === c ? "border-learning/50 text-learning" : ""}`}>{c}</button>)}</div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((n) => {
          const st = state[n.id] || { read: false, bookmarked: false, note: "" };
          return (
            <div key={n.id} className="card card-hover">
              <div className="flex items-center justify-between">
                <span className={`chip ${CAT_CLASS[n.category] || "border-learning/40 text-learning"}`}>{n.category}</span>
                <span className="text-xs text-faint">{new Date(n.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              <h3 className="mt-2.5 font-display text-base font-bold">{n.title}</h3>
              <QA label="What happened?" text={n.what} />
              <QA label="Why did it happen?" text={n.why} />
              <QA label="Why does it matter?" text={n.matters} />
              <QA label="How it affects wealth" text={n.wealth} highlight />
              <div className="mt-3 flex flex-wrap gap-2">
                <button className={`btn !py-1.5 text-xs ${st.read ? "border-completed/50 text-completed" : ""}`} onClick={() => toggle(n.id, "read")}>{st.read ? <><Check className="h-3.5 w-3.5" /> Read</> : "Mark read"}</button>
                <button className="btn !py-1.5 text-xs" onClick={() => toggle(n.id, "bookmarked")}><Bookmark className={`h-3.5 w-3.5 ${st.bookmarked ? "fill-gold text-gold" : ""}`} /></button>
                {n.tags.map((t) => <span key={t} className="chip">#{t}</span>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QA({ label, text, highlight }: { label: string; text?: string; highlight?: boolean }) {
  if (!text) return null;
  return (
    <div className="mt-3">
      <div className={`text-[11px] font-bold uppercase tracking-wide ${highlight ? "text-completed" : "text-learning"}`}>{label}</div>
      <p className="mt-1 text-[13px] leading-relaxed text-muted">{text}</p>
    </div>
  );
}
