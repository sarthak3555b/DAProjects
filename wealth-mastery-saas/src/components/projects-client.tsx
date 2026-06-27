"use client";

import { useState } from "react";
import { toast } from "sonner";
import { fmtInr } from "@/lib/utils";
import { Wrench, Check, Calculator } from "lucide-react";

type Group = { code: string; title: string; projects: { id: string; name: string }[] };

export function ProjectsClient({ groups, initialState }: { groups: Group[]; initialState: Record<string, { done: boolean; notes: string }> }) {
  const [tab, setTab] = useState<"projects" | "tools">("projects");
  const [state, setState] = useState(initialState);
  const total = groups.reduce((s, g) => s + g.projects.length, 0);
  const done = Object.values(state).filter((s) => s.done).length;

  async function toggle(id: string) {
    const next = { ...state, [id]: { done: !state[id]?.done, notes: state[id]?.notes ?? "" } };
    setState(next);
    const r = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: id, toggle: true }) });
    const d = await r.json();
    (d.newAchievements || []).forEach(() => toast.success("Achievement unlocked! 🏆"));
  }
  async function saveNotes(id: string, notes: string) {
    setState((s) => ({ ...s, [id]: { done: s[id]?.done ?? false, notes } }));
    await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: id, notes }) });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-learning">Build to learn</div>
          <h1 className="mt-1 font-display text-3xl font-extrabold">Projects &amp; Tools</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">Knowledge without implementation is incomplete. Build these and use the live calculators.</p>
        </div>
        <span className="chip border-completed/40 text-completed">{done} / {total} done</span>
      </div>

      <div className="flex gap-1 border-b border-border">
        {(["projects", "tools"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-semibold capitalize ${tab === t ? "border-b-2 border-learning text-fg" : "text-muted"}`}>
            {t === "tools" ? "🧮 Interactive tools" : "All projects"}
          </button>
        ))}
      </div>

      {tab === "projects" ? (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.code}>
              <h2 className="mb-3 font-display text-base font-bold text-muted">Phase {g.code} · {g.title}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {g.projects.map((p) => {
                  const st = state[p.id] || { done: false, notes: "" };
                  return (
                    <div key={p.id} className="card card-hover">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-project" /><span className="font-semibold">{p.name}</span></div>
                        {st.done && <span className="chip border-completed/40 text-completed">✓</span>}
                      </div>
                      <textarea className="input mt-3 min-h-[60px] resize-y text-xs" placeholder="Build log / repo link…" defaultValue={st.notes} onBlur={(e) => saveNotes(p.id, e.target.value)} />
                      <button className={`btn mt-3 w-full !py-2 text-sm ${st.done ? "border-completed/50 text-completed" : "btn-primary"}`} onClick={() => toggle(p.id)}>
                        {st.done ? <><Check className="h-4 w-4" /> Completed</> : "Mark complete"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : <Tools />}
    </div>
  );
}

function Field({ label, value, set, suffix }: { label: string; value: number; set: (n: number) => void; suffix?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <input type="number" className="input" value={value} onChange={(e) => set(parseFloat(e.target.value) || 0)} />
        {suffix && <span className="text-xs text-muted">{suffix}</span>}
      </div>
    </label>
  );
}

function Tools() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Compound /><SIP /><EMI /><Retirement />
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="card"><div className="flex items-center gap-2 text-sm font-semibold text-muted"><Calculator className="h-4 w-4" /> {title}</div><div className="mt-4 space-y-3">{children}</div></div>;
}
function Result({ label, value, color }: { label: string; value: string; color?: string }) {
  return <div className="flex items-center justify-between"><span className="text-sm text-muted">{label}</span><span className="font-display text-lg font-extrabold" style={{ color }}>{value}</span></div>;
}

function Compound() {
  const [p, setP] = useState(100000), [r, setR] = useState(12), [y, setY] = useState(10), [n, setN] = useState(12);
  const a = p * Math.pow(1 + r / 100 / n, n * y);
  return <Card title="Compound Interest Calculator"><Field label="Principal" value={p} set={setP} suffix="₹" /><Field label="Annual rate" value={r} set={setR} suffix="%" /><Field label="Years" value={y} set={setY} suffix="yrs" /><Field label="Compounds/yr" value={n} set={setN} /><div className="border-t border-border pt-3"><Result label="Future value" value={fmtInr(a)} color="hsl(var(--completed))" /><Result label="Interest earned" value={fmtInr(a - p)} /></div></Card>;
}
function SIP() {
  const [m, setM] = useState(10000), [r, setR] = useState(12), [y, setY] = useState(15);
  const i = r / 100 / 12, nn = y * 12, fv = i ? m * ((Math.pow(1 + i, nn) - 1) / i) * (1 + i) : m * nn;
  return <Card title="SIP Calculator"><Field label="Monthly investment" value={m} set={setM} suffix="₹" /><Field label="Expected return" value={r} set={setR} suffix="%" /><Field label="Years" value={y} set={setY} suffix="yrs" /><div className="border-t border-border pt-3"><Result label="Maturity value" value={fmtInr(fv)} color="hsl(var(--completed))" /><Result label="Invested" value={fmtInr(m * nn)} /><Result label="Gains" value={fmtInr(fv - m * nn)} color="hsl(var(--learning))" /></div></Card>;
}
function EMI() {
  const [p, setP] = useState(2000000), [r, setR] = useState(9), [y, setY] = useState(20);
  const i = r / 100 / 12, nn = y * 12, emi = i ? (p * i * Math.pow(1 + i, nn)) / (Math.pow(1 + i, nn) - 1) : p / nn;
  return <Card title="EMI Calculator"><Field label="Loan amount" value={p} set={setP} suffix="₹" /><Field label="Interest rate" value={r} set={setR} suffix="%" /><Field label="Tenure" value={y} set={setY} suffix="yrs" /><div className="border-t border-border pt-3"><Result label="Monthly EMI" value={fmtInr(emi)} color="hsl(var(--current))" /><Result label="Total interest" value={fmtInr(emi * nn - p)} color="hsl(var(--prereq))" /></div></Card>;
}
function Retirement() {
  const [age, setAge] = useState(30), [ra, setRa] = useState(60), [exp, setExp] = useState(50000), [inf, setInf] = useState(6), [ret, setRet] = useState(8), [n, setN] = useState(25);
  const futExp = exp * 12 * Math.pow(1 + inf / 100, ra - age);
  const realR = (1 + ret / 100) / (1 + inf / 100) - 1;
  const corpus = realR ? (futExp * (1 - Math.pow(1 + realR, -n))) / realR : futExp * n;
  return <Card title="Retirement Calculator"><div className="grid grid-cols-2 gap-3"><Field label="Current age" value={age} set={setAge} /><Field label="Retire at" value={ra} set={setRa} /><Field label="Monthly expense" value={exp} set={setExp} suffix="₹" /><Field label="Inflation" value={inf} set={setInf} suffix="%" /><Field label="Post-ret return" value={ret} set={setRet} suffix="%" /><Field label="Years in ret." value={n} set={setN} /></div><div className="border-t border-border pt-3"><Result label="Corpus needed" value={fmtInr(corpus)} color="hsl(var(--project))" /></div></Card>;
}
