"use client";

import { useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import Fuse from "fuse.js";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Map, GraduationCap, BookOpen, Newspaper, LayoutDashboard, FolderKanban, BarChart3, NotebookPen, Settings } from "lucide-react";

type Item = { type: string; title: string; sub: string; href: string; external?: boolean; keywords?: string };

const PAGES: Item[] = [
  { type: "page", title: "Dashboard", sub: "Overview", href: "/dashboard" },
  { type: "page", title: "Roadmap", sub: "Interactive canvas", href: "/roadmap" },
  { type: "page", title: "Projects", sub: "Build to learn", href: "/projects" },
  { type: "page", title: "Resources", sub: "Library", href: "/resources" },
  { type: "page", title: "Current Affairs", sub: "News engine", href: "/affairs" },
  { type: "page", title: "Journal", sub: "Reflections", href: "/journal" },
  { type: "page", title: "Analytics", sub: "Progress", href: "/analytics" },
  { type: "page", title: "Career Explorer", sub: "Paths", href: "/career" },
  { type: "page", title: "Settings", sub: "Account & admin", href: "/settings" },
];

const ICON: Record<string, any> = { page: LayoutDashboard, node: GraduationCap, career: Map, resource: BookOpen, news: Newspaper };

export function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const { data } = useQuery<{ index: Item[] }>({
    queryKey: ["search-index"],
    queryFn: async () => (await fetch("/api/search-index")).json(),
    enabled: open,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(true); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const all = useMemo(() => [...PAGES, ...((data?.index as Item[]) || [])], [data]);
  const fuse = useMemo(() => new Fuse(all, { keys: ["title", "sub", "keywords"], threshold: 0.4 }), [all]);
  const results = q ? fuse.search(q).slice(0, 30).map((r) => r.item) : PAGES;

  function go(item: Item) {
    setOpen(false); setQ("");
    if (item.external) window.open(item.href, "_blank");
    else router.push(item.href);
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm" onClick={() => setOpen(false)}>
      <Command shouldFilter={false} className="w-full max-w-xl overflow-hidden rounded-xl border border-white/10 bg-panel shadow-soft animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 text-faint" />
          <Command.Input autoFocus value={q} onValueChange={setQ} placeholder="Search nodes, resources, careers, pages…" className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-faint" />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-faint">ESC</kbd>
        </div>
        <Command.List className="max-h-[50vh] overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center text-sm text-faint">No results for “{q}”.</Command.Empty>
          {results.map((item, i) => {
            const Icon = ICON[item.type] || Search;
            return (
              <Command.Item key={item.href + i} value={item.title + i} onSelect={() => go(item)} className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm data-[selected=true]:bg-white/5">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-white/5 text-muted"><Icon className="h-4 w-4" /></span>
                <span className="flex-1"><span className="font-medium">{item.title}</span><span className="block text-xs text-faint">{item.sub}</span></span>
                <span className="text-[10px] uppercase tracking-wide text-faint">{item.type}</span>
              </Command.Item>
            );
          })}
        </Command.List>
      </Command>
    </div>
  );
}
