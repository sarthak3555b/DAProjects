"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { CommandPalette } from "@/components/command-palette";
import { MentorDrawer } from "@/components/mentor-drawer";
import {
  LayoutDashboard, Map, FolderKanban, BookOpen, Newspaper, NotebookPen,
  BarChart3, Briefcase, Settings, Shield, Search, Bell, BrainCircuit, Menu, LogOut, Flame,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/resources", label: "Resources", icon: BookOpen },
  { href: "/affairs", label: "Current Affairs", icon: Newspaper },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/career", label: "Career Explorer", icon: Briefcase },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  children, user, streak,
}: {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null; role?: string };
  streak: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mentorOpen, setMentorOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: notif } = useQuery<{ items: { id: string; icon?: string; text: string; route?: string; read: boolean }[] }>({
    queryKey: ["notifications"],
    queryFn: async () => (await fetch("/api/notifications")).json(),
    refetchInterval: 60_000,
  });
  const unread = (notif?.items || []).filter((n) => !n.read).length;

  return (
    <div className="relative z-10 flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-panel/60 backdrop-blur-xl transition-transform md:static md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="px-4 py-5"><Link href="/dashboard"><Logo /></Link></div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  active ? "bg-gradient-to-r from-learning/15 to-transparent text-white" : "text-muted hover:bg-white/5 hover:text-fg")}>
                <item.icon className={cn("h-[18px] w-[18px]", active && "text-learning")} />
                {item.label}
              </Link>
            );
          })}
          {user.role === "ADMIN" && (
            <Link href="/admin" onClick={() => setSidebarOpen(false)}
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                pathname.startsWith("/admin") ? "bg-gradient-to-r from-prereq/15 to-transparent text-white" : "text-muted hover:bg-white/5 hover:text-fg")}>
              <Shield className="h-[18px] w-[18px] text-prereq" /> Admin CMS
            </Link>
          )}
        </nav>
        <div className="border-t border-border p-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-current/15 px-3 py-1.5 text-sm font-bold text-current">
            <Flame className="h-4 w-4" /> {streak} <span className="font-medium text-muted">day streak</span>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-faint">Learn · Build · Observe · Reflect · Implement · Review · Repeat</p>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 flex-shrink-0 items-center gap-3 border-b border-border bg-bg/60 px-4 backdrop-blur-xl md:px-6">
          <button className="btn h-9 w-9 p-0 md:hidden" onClick={() => setSidebarOpen(true)}><Menu className="h-4 w-4" /></button>
          <button onClick={() => setCmdOpen(true)} className="flex flex-1 items-center gap-2.5 rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm text-faint transition hover:border-white/20 md:max-w-md">
            <Search className="h-4 w-4" /> Search everything…
            <kbd className="ml-auto hidden rounded border border-border px-1.5 py-0.5 text-[10px] sm:block">⌘K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button className="btn h-9 w-9 p-0" title="AI Mentor" onClick={() => setMentorOpen(true)}><BrainCircuit className="h-4 w-4" /></button>
            <div className="relative">
              <button className="btn h-9 w-9 p-0" title="Notifications" onClick={() => setNotifOpen((v) => !v)}>
                <Bell className="h-4 w-4" />
                {unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-current ring-2 ring-bg" />}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-border bg-panel shadow-soft">
                  <div className="border-b border-border px-4 py-3 text-sm font-bold">Notifications</div>
                  <div className="max-h-80 overflow-y-auto">
                    {(notif?.items || []).length === 0 && <div className="p-6 text-center text-sm text-faint">You&apos;re all caught up ✨</div>}
                    {(notif?.items || []).map((n) => (
                      <button key={n.id} onClick={() => { setNotifOpen(false); if (n.route) router.push(n.route); }} className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left text-sm hover:bg-white/5">
                        <span className="text-base">{n.icon || "🔔"}</span><span className="text-muted">{n.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-learning to-project text-xs font-bold text-white" title={user.email || ""} onClick={() => signOut({ callbackUrl: "/" })}>
              {(user.name || user.email || "U").slice(0, 1).toUpperCase()}
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />
      <MentorDrawer open={mentorOpen} setOpen={setMentorOpen} />
    </div>
  );
}
