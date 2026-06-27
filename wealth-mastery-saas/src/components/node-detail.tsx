"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DIFFICULTY_LABEL, DIFFICULTY_LEVEL, fmtHours } from "@/lib/utils";
import { Check, Star, Heart, Lock, ChevronRight, ExternalLink, BrainCircuit } from "lucide-react";

type Prereq = { id: string; slug: string; title: string; completed?: boolean };
type Data = {
  id: string; slug: string; title: string; color: string; phaseCode: string; phaseTitle: string; phaseId: string;
  moduleName: string; description?: string; purpose?: string; whyItMatters?: string; outcomes: string[]; tags: string[];
  hours: number; difficulty: string; exercises: string[]; assignments: { title: string; detail: string }[];
  assessment: { q: string; options: string[]; answer: number }[]; reflection: string[]; realLife: string[];
  careers: string[]; mastery: string[]; resources: Record<string, { title: string; source?: string; type?: string; url: string }[]>;
  version: { v: string; date: string; note: string }[];
  prerequisites: Prereq[]; dependents: Prereq[]; locked: boolean;
  state: { status: string | null; quizPassed: boolean; checklist: Record<string, boolean>; reviewDue: string | null; bookmarked: boolean; favorite: boolean; note: string };
};

export function NodeDetail({ data }: { data: Data }) {
  const router = useRouter();
  const [state, setState] = useState(data.state);
  const completed = state.status === "COMPLETED";

  async function post(url: string, body: any) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return res.json();
  }

  async function toggleComplete() {
    if (data.locked && !completed) { toast.error("Complete the prerequisites first."); return; }
    const next = completed ? "IN_PROGRESS" : "COMPLETED";
    const r = await post("/api/progress", { nodeId: data.id, status: next });
    setState((s) => ({ ...s, status: next }));
    (r.newAchievements || []).forEach(() => toast.success("Achievement unlocked! 🏆"));
    toast.success(next === "COMPLETED" ? `Completed (+${fmtHours(data.hours)})` : "Marked in progress");
    router.refresh();
  }
  async function toggleBookmark() {
    const r = await post("/api/bookmarks", { nodeId: data.id, favorite: state.favorite });
    setState((s) => ({ ...s, bookmarked: r.bookmarked }));
  }
  async function toggleFavorite() {
    const r = await post("/api/bookmarks", { nodeId: data.id, favorite: !state.favorite });
    setState((s) => ({ ...s, favorite: r.favorite, bookmarked: true }));
  }
  async function toggleCheck(key: string) {
    const next = { ...state.checklist, [key]: !state.checklist[key] };
    setState((s) => ({ ...s, checklist: next }));
    await post("/api/progress", { nodeId: data.id, checklist: next });
  }

  const lvl = DIFFICULTY_LEVEL[data.difficulty] || 1;
  const resourceGroups = [["Books", "books"], ["Courses", "courses"], ["Videos", "videos"], ["Articles", "articles"], ["Podcasts", "podcasts"], ["Research", "papers"]] as const;

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-5 md:p-8">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href="/roadmap" className="hover:text-fg">Roadmap</Link><ChevronRight className="h-3.5 w-3.5" />
        <Link href="/roadmap" className="hover:text-fg">Phase {data.phaseCode} · {data.phaseTitle}</Link><ChevronRight className="h-3.5 w-3.5" />
        <span>{data.moduleName}</span>
      </div>

      {/* Hero */}
      <div className="rounded-xl border p-6" style={{ borderColor: `${data.color}55` }}>
        <div className="mb-3 flex flex-wrap gap-2">
          <span className={`chip ${completed ? "border-completed/40 text-completed" : "border-learning/40 text-learning"}`}>{completed ? "✓ Completed" : data.locked ? "🔒 Locked" : "○ Available"}</span>
          <span className="chip">{DIFFICULTY_LABEL[data.difficulty]}</span>
          <span className="chip">⏱️ {fmtHours(data.hours)}</span>
          {state.bookmarked && <span className="chip border-gold/40 text-gold">★ Bookmarked</span>}
        </div>
        <h1 className="font-display text-3xl font-extrabold">{data.title}</h1>
        {data.description && <p className="mt-2 max-w-3xl text-muted">{data.description}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Difficulty:</span>
          <div className="flex gap-1">{Array.from({ length: 5 }).map((_, i) => <span key={i} className="h-3 w-1.5 rounded-sm" style={{ background: i < lvl ? "hsl(var(--learning))" : "hsl(var(--border))" }} />)}</div>
          <div className="ml-auto flex flex-wrap gap-1.5">{data.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button className={`btn ${completed ? "border-completed/50 text-completed" : "btn-primary"}`} onClick={toggleComplete} disabled={data.locked && !completed}>
            {data.locked && !completed ? <><Lock className="h-4 w-4" /> Locked</> : completed ? <><Check className="h-4 w-4" /> Completed — undo</> : "Mark complete"}
          </button>
          <button className="btn" onClick={toggleBookmark}><Star className={`h-4 w-4 ${state.bookmarked ? "fill-gold text-gold" : ""}`} /> {state.bookmarked ? "Bookmarked" : "Bookmark"}</button>
          <button className="btn" onClick={toggleFavorite}><Heart className={`h-4 w-4 ${state.favorite ? "fill-project text-project" : ""}`} /> Favorite</button>
        </div>
        {data.locked && (
          <div className="mt-4 rounded-lg border border-prereq/40 p-4">
            <div className="text-sm font-semibold text-prereq">🔒 Complete prerequisites first</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.prerequisites.map((p) => <Link key={p.id} href={`/node/${p.slug}`} className="btn !py-1.5 text-xs">{p.completed ? "✓ " : "○ "}{p.title}</Link>)}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {data.purpose && <Section title="Purpose"><p className="leading-relaxed text-muted">{data.purpose}</p></Section>}
          {data.whyItMatters && <Section title="Why it matters"><p className="leading-relaxed text-muted">{data.whyItMatters}</p></Section>}
          <Section title="Learning outcomes">
            <ul className="space-y-2">{data.outcomes.map((o, i) => <li key={i} className="flex gap-2.5 text-sm"><span className="font-bold text-learning">→</span>{o}</li>)}</ul>
          </Section>
          <Section title="Exercises & practice">
            <ul className="space-y-2">{data.exercises.map((ex, i) => {
              const key = "exercise-" + i; const done = !!state.checklist[key];
              return <li key={i} onClick={() => toggleCheck(key)} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${done ? "border-completed/50 bg-completed/10" : "border-border hover:border-white/20"}`}>
                <span className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded border ${done ? "border-completed bg-completed text-white" : "border-border"}`}>{done && <Check className="h-3 w-3" />}</span>{ex}</li>;
            })}</ul>
          </Section>
          {data.assignments.length > 0 && (
            <Section title="Assignments">
              <div className="space-y-2">{data.assignments.map((a, i) => {
                const key = "assign-" + i; const done = !!state.checklist[key];
                return <div key={i} onClick={() => toggleCheck(key)} className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition ${done ? "border-completed/50 bg-completed/10" : "border-border hover:border-white/20"}`}>
                  <span className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded border ${done ? "border-completed bg-completed text-white" : "border-border"}`}>{done && <Check className="h-3 w-3" />}</span>
                  <div><div className="text-sm font-semibold">{a.title}</div><div className="mt-0.5 text-xs text-faint">{a.detail}</div></div></div>;
              })}</div>
            </Section>
          )}
          {data.assessment.length > 0 && <Section title="Knowledge test"><Quiz nodeId={data.id} assessment={data.assessment} passed={state.quizPassed} onPass={() => setState((s) => ({ ...s, quizPassed: true }))} /></Section>}
          <Section title="Reflection questions"><ul className="space-y-2 text-sm text-muted">{data.reflection.map((r, i) => <li key={i} className="list-inside list-disc">{r}</li>)}</ul></Section>
          <Section title="Real-life applications"><ul className="space-y-2 text-sm text-muted">{data.realLife.map((r, i) => <li key={i} className="list-inside list-disc">{r}</li>)}</ul></Section>
          <Section title="My notes"><Notes nodeId={data.id} initial={state.note} /></Section>
        </div>

        <div className="space-y-5">
          <Section title="Mastery levels"><ol className="space-y-2 text-sm text-muted">{data.mastery.map((m, i) => <li key={i}>{m}</li>)}</ol></Section>
          <Section title="Resources">
            <div className="space-y-2">
              {resourceGroups.map(([label, key]) => (data.resources?.[key] || []).map((r, i) => (
                <a key={key + i} href={r.url} target="_blank" rel="noopener" className="flex items-start gap-2.5 rounded-lg border border-border p-2.5 text-sm hover:border-white/20">
                  <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] uppercase text-faint">{r.type || label}</span>
                  <span className="flex-1"><span className="font-medium">{r.title}</span><span className="block text-xs text-faint">{r.source}</span></span>
                  <ExternalLink className="h-3.5 w-3.5 text-faint" />
                </a>
              )))}
            </div>
          </Section>
          {data.dependents.length > 0 && <Section title="Unlocks next"><div className="space-y-1.5">{data.dependents.map((d) => <Link key={d.id} href={`/node/${d.slug}`} className="block rounded-lg border border-border px-3 py-2 text-sm hover:border-white/20">→ {d.title}</Link>)}</div></Section>}
          <Section title="Career relevance"><div className="flex flex-wrap gap-1.5">{data.careers.map((c) => <span key={c} className="chip border-project/40 text-project">{c}</span>)}</div></Section>
          {state.reviewDue && completed && <div className="card"><div className="text-sm font-semibold text-muted">Review</div><div className="chip mt-2 border-completed/40 text-completed">Next review: {new Date(state.reviewDue).toLocaleDateString("en-IN")}</div></div>}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="card"><div className="text-sm font-semibold text-muted">{title}</div><div className="mt-3">{children}</div></div>;
}

function Notes({ nodeId, initial }: { nodeId: string; initial: string }) {
  const [val, setVal] = useState(initial);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  let timer: any;
  function onChange(v: string) {
    setVal(v); setSaved("saving");
    clearTimeout(timer);
    timer = setTimeout(async () => { await fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nodeId, body: v }) }); setSaved("saved"); }, 600);
  }
  return (
    <div>
      <textarea className="input min-h-[120px] resize-y" value={val} onChange={(e) => onChange(e.target.value)} placeholder="Your notes, observations and Zettelkasten links…" />
      <div className="mt-1 text-right text-xs text-faint">{saved === "saving" ? "Saving…" : saved === "saved" ? "Saved ✓" : ""}</div>
    </div>
  );
}

function Quiz({ nodeId, assessment, passed, onPass }: { nodeId: string; assessment: { q: string; options: string[]; answer: number }[]; passed: boolean; onPass: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  if (passed && !submitted) {
    return <div><span className="chip border-completed/40 text-completed">✓ Passed</span> <button className="btn !py-1.5 ml-2 text-xs" onClick={() => { setSubmitted(false); setAnswers({}); }}>Retake</button></div>;
  }
  const correct = assessment.filter((q, i) => answers[i] === q.answer).length;
  async function submit() {
    setSubmitted(true);
    const pass = correct === assessment.length;
    await fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nodeId, quizPassed: pass }) });
    if (pass) { onPass(); toast.success("Perfect! Quiz passed 🎉"); } else toast(`${correct}/${assessment.length} correct — review & retry`);
  }
  return (
    <div className="space-y-4">
      {assessment.map((q, qi) => (
        <div key={qi}>
          <div className="text-sm font-semibold">{qi + 1}. {q.q}</div>
          <div className="mt-2 space-y-1.5">
            {q.options.map((opt, oi) => {
              let cls = "border-border hover:border-white/20";
              if (submitted) { if (oi === q.answer) cls = "border-completed bg-completed/10"; else if (answers[qi] === oi) cls = "border-prereq bg-prereq/10"; }
              else if (answers[qi] === oi) cls = "border-learning bg-learning/10";
              return <button key={oi} disabled={submitted} onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))} className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition ${cls}`}>{String.fromCharCode(65 + oi)}. {opt}</button>;
            })}
          </div>
        </div>
      ))}
      {!submitted ? <button className="btn btn-primary" disabled={Object.keys(answers).length < assessment.length} onClick={submit}>Submit answers</button>
        : <div className="flex items-center gap-2"><span className={`chip ${correct === assessment.length ? "border-completed/40 text-completed" : "border-current/40 text-current"}`}>Score: {correct}/{assessment.length}</span><button className="btn !py-1.5 text-xs" onClick={() => { setSubmitted(false); setAnswers({}); }}>Try again</button></div>}
    </div>
  );
}
