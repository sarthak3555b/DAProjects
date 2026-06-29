"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Flame, PanelLeftClose, PanelLeft, Command } from "lucide-react";
import { navGroups } from "@/lib/nav";
import { currentUser } from "@/lib/mock-data";
import { useUIStore } from "@/lib/stores/ui-store";
import { cn, initials } from "@/lib/utils";
import { NavIcon } from "./nav-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

function NavLink({ item, collapsed }: { item: { label: string; href: string; icon: string }; collapsed: boolean }) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(item.href + "/");

  const link = (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors duration-200",
        "focus-visible:ring-2 focus-visible:ring-ring",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute inset-0 -z-10 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/20 to-purple/10 shadow-[0_0_24px_-6px_rgba(59,130,246,0.6)]"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <span className={cn("relative flex size-5 items-center justify-center", active && "text-primary")}>
        <NavIcon name={item.icon} className="size-[18px]" />
        {active && <span className="absolute -left-3 h-5 w-1 rounded-full bg-primary md:block" aria-hidden />}
      </span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }
  return link;
}

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggle = useUIStore((s) => s.toggleSidebar);
  const setCommand = useUIStore((s) => s.setCommandOpen);

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 264 }}
      transition={{ type: "spring", stiffness: 300, damping: 34 }}
      className="sticky top-0 z-30 hidden h-dvh shrink-0 flex-col border-r border-border/60 bg-surface/40 backdrop-blur-2xl md:flex"
    >
      {/* Brand */}
      <div className={cn("flex h-16 items-center gap-2.5 px-4", collapsed && "justify-center px-0")}>
        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple shadow-glow">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-purple blur-md opacity-60" />
          <span className="relative font-display text-sm font-extrabold text-white">W</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold tracking-tight">Wealth Mastery</p>
            <p className="truncate text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Operating System</p>
          </div>
        )}
      </div>

      {/* Command hint */}
      <div className="px-3 pb-2">
        <button
          onClick={() => setCommand(true)}
          className={cn(
            "flex w-full items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          <Command className="size-3.5" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Search…</span>
              <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
            </>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="hide-scrollbar flex-1 space-y-5 overflow-y-auto px-3 py-2" aria-label="Primary">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer: level + streak */}
      <div className="border-t border-border/60 p-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.04]",
            collapsed && "justify-center p-0",
          )}
        >
          <Avatar className="size-9 ring-2 ring-primary/30">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback>{initials(currentUser.name)}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-medium">{currentUser.name}</p>
                <span className="flex items-center gap-0.5 text-xs font-semibold text-orange">
                  <Flame className="size-3.5" />
                  {currentUser.streak}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] font-semibold text-primary">Lv {currentUser.level}</span>
                <Progress value={(currentUser.xp / currentUser.xpToNext) * 100} className="h-1" />
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-20 hidden size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-colors hover:text-foreground md:flex"
      >
        {collapsed ? <PanelLeft className="size-3.5" /> : <PanelLeftClose className="size-3.5" />}
      </button>
    </motion.aside>
  );
}
