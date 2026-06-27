"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Plus, Download, Shield } from "lucide-react";

type News = { id: string; category: string; title: string; date: string; what?: string; why?: string; matters?: string; wealth?: string; tags: string[] };
type Res = { id: string; title: string; source?: string; type: string; phaseCode?: string; url: string; note?: string };
type Mod = { id: string; label: string };
type Usr = { id: string; name?: string; email: string; role: string; createdAt: string };

const TABS = ["Overview", "Nodes", "Resources", "Current Affairs", "Users", "Audit"] as const;
const CATS = ["Economy", "Business", "Markets", "Technology", "Geopolitics"];
const RES_TYPES = ["Book", "Course", "Video", "Article", "Newsletter", "Podcast", "Paper"];
const DIFFS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT", "MASTER"];

export function AdminClient({ stats, news, resources, modules, users, audit }: {
  stats: Record<string, number>; news: News[]; resources: Res[]; modules: Mod[]; users: Usr[];
  audit: { id: string; action: string; entity?: string | null; createdAt: string }[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  async function del(url: string) { if (!confirm("Delete this item?")) return; await fetch(url, { method: "DELETE" }); toast.success("Deleted"); router.refresh(); }

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-5 md:p-8">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-prereq/15 text-prereq"><Shield className="h-5 w-5" /></span>
        <div><h1 className="font-display text-3xl font-extrabold">Admin CMS</h1><p className="text-sm text-muted">Manage all content and users through the UI — no database editing.</p></div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-semibold ${tab === t ? "border-b-2 border-prereq text-fg" : "text-muted"}`}>{t}</button>)}
      </div>

      {tab === "Overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Object.entries(stats).map(([k, v]) => <div key={k} className="card"><div className="font-display text-2xl font-extrabold">{v}</div><div className="text-xs capitalize text-muted">{k}</div></div>)}
          </div>
          <div className="card flex flex-wrap items-center gap-3">
            <a href="/api/admin/export" className="btn btn-primary"><Download className="h-4 w-4" /> Export all content (JSON)</a>
            <span className="text-sm text-muted">Bulk backup of phases, modules, nodes, dependencies, resources, careers and news.</span>
          </div>
        </div>
      )}

      {tab === "Nodes" && <NodeForm modules={modules} />}

      {tab === "Resources" && (
        <div className="space-y-4">
          <ResourceForm />
          <div className="card overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase text-faint"><th className="p-2">Title</th><th className="p-2">Type</th><th className="p-2">Phase</th><th className="p-2"></th></tr></thead>
              <tbody>{resources.map((r) => <tr key={r.id} className="border-t border-border"><td className="p-2">{r.title}</td><td className="p-2">{r.type}</td><td className="p-2">{r.phaseCode}</td><td className="p-2 text-right"><button className="btn !p-2" onClick={() => del(`/api/admin/resources?id=${r.id}`)}><Trash2 className="h-3.5 w-3.5" /></button></td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Current Affairs" && (
        <div className="space-y-4">
          <NewsForm />
          <div className="card divide-y divide-border">
            {news.map((n) => <div key={n.id} className="flex items-center justify-between py-2.5"><div><span className="chip mr-2">{n.category}</span>{n.title}</div><button className="btn !p-2" onClick={() => del(`/api/admin/news?id=${n.id}`)}><Trash2 className="h-3.5 w-3.5" /></button></div>)}
          </div>
        </div>
      )}

      {tab === "Users" && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase text-faint"><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">Joined</th></tr></thead>
            <tbody>{users.map((u) => <tr key={u.id} className="border-t border-border"><td className="p-2">{u.name}</td><td className="p-2">{u.email}</td>
              <td className="p-2"><select defaultValue={u.role} className="input !py-1 !text-xs" onChange={async (e) => { await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: u.id, role: e.target.value }) }); toast.success("Role updated"); }}><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select></td>
              <td className="p-2 text-faint">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {tab === "Audit" && (
        <div className="card divide-y divide-border text-sm">
          {audit.length === 0 ? <div className="py-6 text-center text-faint">No audit entries yet.</div> :
            audit.map((a) => <div key={a.id} className="flex items-center justify-between py-2.5"><span><span className="chip mr-2">{a.entity || "system"}</span>{a.action}</span><span className="text-faint">{new Date(a.createdAt).toLocaleString("en-IN")}</span></div>)}
        </div>
      )}
    </div>
  );
}

function NodeForm({ modules }: { modules: Mod[] }) {
  const router = useRouter();
  const [f, setF] = useState<any>({ slug: "", title: "", moduleId: modules[0]?.id || "", hours: 3, difficulty: "BEGINNER", description: "", purpose: "", whyItMatters: "" });
  async function save() {
    const res = await fetch("/api/admin/nodes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, hours: Number(f.hours) }) });
    const d = await res.json();
    if (!res.ok) { toast.error(d.error || "Error"); return; }
    toast.success("Node saved"); router.refresh();
  }
  return (
    <div className="card space-y-3">
      <h3 className="font-semibold">Create / update a node</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="Slug (unique)" v={f.slug} set={(v) => setF({ ...f, slug: v })} />
        <Input label="Title" v={f.title} set={(v) => setF({ ...f, title: v })} />
        <label><span className="mb-1 block text-xs font-semibold text-muted">Module</span><select className="input" value={f.moduleId} onChange={(e) => setF({ ...f, moduleId: e.target.value })}>{modules.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</select></label>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Hours" type="number" v={f.hours} set={(v) => setF({ ...f, hours: v })} />
          <label><span className="mb-1 block text-xs font-semibold text-muted">Difficulty</span><select className="input" value={f.difficulty} onChange={(e) => setF({ ...f, difficulty: e.target.value })}>{DIFFS.map((d) => <option key={d}>{d}</option>)}</select></label>
        </div>
      </div>
      <Textarea label="Description" v={f.description} set={(v) => setF({ ...f, description: v })} />
      <Textarea label="Why it matters" v={f.whyItMatters} set={(v) => setF({ ...f, whyItMatters: v })} />
      <button className="btn btn-primary" onClick={save}><Plus className="h-4 w-4" /> Save node</button>
    </div>
  );
}

function ResourceForm() {
  const router = useRouter();
  const [f, setF] = useState<any>({ title: "", source: "", type: "Book", phaseCode: "", url: "", note: "" });
  async function save() {
    const res = await fetch("/api/admin/resources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await res.json(); if (!res.ok) { toast.error(d.error || "Error"); return; }
    toast.success("Resource saved"); setF({ title: "", source: "", type: "Book", phaseCode: "", url: "", note: "" }); router.refresh();
  }
  return (
    <div className="card space-y-3">
      <h3 className="font-semibold">Add a resource</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="Title" v={f.title} set={(v) => setF({ ...f, title: v })} />
        <Input label="Source / author" v={f.source} set={(v) => setF({ ...f, source: v })} />
        <label><span className="mb-1 block text-xs font-semibold text-muted">Type</span><select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{RES_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
        <Input label="Phase code (e.g. 11)" v={f.phaseCode} set={(v) => setF({ ...f, phaseCode: v })} />
        <Input label="URL" v={f.url} set={(v) => setF({ ...f, url: v })} />
        <Input label="Note" v={f.note} set={(v) => setF({ ...f, note: v })} />
      </div>
      <button className="btn btn-primary" onClick={save}><Plus className="h-4 w-4" /> Add resource</button>
    </div>
  );
}

function NewsForm() {
  const router = useRouter();
  const [f, setF] = useState<any>({ category: "Markets", title: "", what: "", why: "", matters: "", wealth: "" });
  async function save() {
    const res = await fetch("/api/admin/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await res.json(); if (!res.ok) { toast.error(d.error || "Error"); return; }
    toast.success("News saved"); setF({ category: "Markets", title: "", what: "", why: "", matters: "", wealth: "" }); router.refresh();
  }
  return (
    <div className="card space-y-3">
      <h3 className="font-semibold">Add a current-affairs item</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <label><span className="mb-1 block text-xs font-semibold text-muted">Category</span><select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
        <Input label="Title" v={f.title} set={(v) => setF({ ...f, title: v })} />
      </div>
      <Textarea label="What happened?" v={f.what} set={(v) => setF({ ...f, what: v })} />
      <Textarea label="Why did it happen?" v={f.why} set={(v) => setF({ ...f, why: v })} />
      <Textarea label="Why does it matter?" v={f.matters} set={(v) => setF({ ...f, matters: v })} />
      <Textarea label="How it affects wealth creation?" v={f.wealth} set={(v) => setF({ ...f, wealth: v })} />
      <button className="btn btn-primary" onClick={save}><Plus className="h-4 w-4" /> Add item</button>
    </div>
  );
}

function Input({ label, v, set, type = "text" }: { label: string; v: any; set: (v: string) => void; type?: string }) {
  return <label><span className="mb-1 block text-xs font-semibold text-muted">{label}</span><input type={type} className="input" value={v} onChange={(e) => set(e.target.value)} /></label>;
}
function Textarea({ label, v, set }: { label: string; v: string; set: (v: string) => void }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold text-muted">{label}</span><textarea className="input min-h-[70px] resize-y" value={v} onChange={(e) => set(e.target.value)} /></label>;
}
