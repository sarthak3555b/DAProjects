"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { toast } from "sonner";
import {
  Search,
  CornerDownLeft,
  Moon,
  Volume2,
  Sparkles,
  BookOpen,
  Map as MapIcon,
} from "lucide-react";
import { navItems } from "@/lib/nav";
import { resources, roadmapNodes } from "@/lib/mock-data";
import { useUIStore } from "@/lib/stores/ui-store";
import { NavIcon } from "./nav-icon";

export function CommandPalette() {
  const router = useRouter();
  const open = useUIStore((s) => s.commandOpen);
  const setOpen = useUIStore((s) => s.setCommandOpen);
  const toggleSound = useUIStore((s) => s.toggleSound);
  const setTheme = useUIStore((s) => s.setTheme);
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        useUIStore.getState().toggleCommand();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const run = (fn: () => void) => {
    setOpen(false);
    requestAnimationFrame(fn);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 pt-[12vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md overlay-anim" onClick={() => setOpen(false)} />
      <Command
        label="Command Menu"
        loop
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-card/90 shadow-glow-lg backdrop-blur-2xl pop-anim"
      >
        <div className="flex items-center gap-3 border-b border-border/60 px-4">
          <Search className="size-4 text-muted-foreground" />
          <Command.Input
            autoFocus
            placeholder="Search pages, roadmap, resources, commands…"
            className="h-14 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">ESC</kbd>
        </div>

        <Command.List className="hide-scrollbar max-h-[52vh] overflow-y-auto p-2">
          <Command.Empty className="py-10 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>

          <Command.Group heading="Pages" className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
            {navItems.map((item) => (
              <Item key={item.href} onSelect={() => run(() => router.push(item.href))} keywords={[item.label]}>
                <NavIcon name={item.icon} className="size-4 text-muted-foreground" />
                {item.label}
              </Item>
            ))}
          </Command.Group>

          <Command.Group heading="Roadmap" className="px-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em] [&_[cmdk-group-heading]]:text-muted-foreground/60">
            {roadmapNodes.slice(0, 6).map((n) => (
              <Item key={n.id} onSelect={() => run(() => router.push(`/roadmap?node=${n.id}`))} keywords={[n.title, n.phase]}>
                <MapIcon className="size-4 text-muted-foreground" />
                <span className="flex-1">{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.phase}</span>
              </Item>
            ))}
          </Command.Group>

          <Command.Group heading="Resources" className="px-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em] [&_[cmdk-group-heading]]:text-muted-foreground/60">
            {resources.slice(0, 5).map((r) => (
              <Item key={r.id} onSelect={() => run(() => router.push("/resources"))} keywords={[r.title, r.author]}>
                <BookOpen className="size-4 text-muted-foreground" />
                <span className="flex-1">{r.title}</span>
                <span className="text-xs text-muted-foreground">{r.type}</span>
              </Item>
            ))}
          </Command.Group>

          <Command.Group heading="Commands" className="px-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em] [&_[cmdk-group-heading]]:text-muted-foreground/60">
            <Item onSelect={() => run(() => setTheme(theme === "dark" ? "light" : "dark"))} keywords={["theme", "dark", "light"]}>
              <Moon className="size-4 text-muted-foreground" /> Toggle theme
            </Item>
            <Item onSelect={() => run(() => toggleSound())} keywords={["sound", "audio", "mute"]}>
              <Volume2 className="size-4 text-muted-foreground" /> Toggle sound
            </Item>
            <Item onSelect={() => run(() => { router.push("/ai-mentor"); toast.success("Opening AI Mentor"); })} keywords={["ai", "mentor", "ask"]}>
              <Sparkles className="size-4 text-muted-foreground" /> Ask the AI Mentor
            </Item>
          </Command.Group>
        </Command.List>

        <div className="flex items-center justify-between border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CornerDownLeft className="size-3" /> to select
          </span>
          <span>Wealth Mastery OS</span>
        </div>
      </Command>
    </div>
  );
}

function Item({
  children,
  onSelect,
  keywords,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  keywords?: string[];
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      keywords={keywords}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm text-foreground outline-none transition-colors data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-foreground"
    >
      {children}
    </Command.Item>
  );
}
