"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  ChevronRight,
  Menu,
  Search,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Sparkles,
  User,
  LogOut,
  CreditCard,
  Settings as SettingsIcon,
} from "lucide-react";
import { breadcrumbLabels } from "@/lib/nav";
import { currentUser } from "@/lib/mock-data";
import { api, queryKeys } from "@/lib/api";
import { useUIStore } from "@/lib/stores/ui-store";
import { cn, initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  return (
    <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-sm md:flex">
      <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
        Home
      </Link>
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const label = breadcrumbLabels[seg] ?? seg.replace(/-/g, " ");
        const last = i === segments.length - 1;
        return (
          <span key={href} className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5 text-muted-foreground/50" />
            {last ? (
              <span className="font-medium capitalize text-foreground">{label}</span>
            ) : (
              <Link href={href} className="capitalize text-muted-foreground transition-colors hover:text-foreground">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function TopHeader() {
  const router = useRouter();
  const setCommand = useUIStore((s) => s.setCommandOpen);
  const setNotifications = useUIStore((s) => s.setNotificationsOpen);
  const setMobileNav = useUIStore((s) => s.setMobileNav);
  const soundEnabled = useUIStore((s) => s.soundEnabled);
  const toggleSound = useUIStore((s) => s.toggleSound);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);

  const { data: notifications } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: api.notifications,
  });
  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/60 bg-bg/70 px-4 backdrop-blur-2xl md:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        aria-label="Open navigation"
        onClick={() => setMobileNav(true)}
      >
        <Menu className="size-5" />
      </Button>

      <Breadcrumbs />

      <div className="ml-auto flex items-center gap-1.5">
        {/* Search */}
        <button
          onClick={() => setCommand(true)}
          className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
        >
          <Search className="size-4" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] sm:inline">⌘K</kbd>
        </button>

        {/* Sound */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"} onClick={toggleSound}>
              {soundEnabled ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{soundEnabled ? "Sound on" : "Sound off"}</TooltipContent>
        </Tooltip>

        {/* Theme */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Moon className="size-5" /> : <Sun className="size-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Theme: {theme}</TooltipContent>
        </Tooltip>

        {/* Notifications */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Notifications" className="relative" onClick={() => setNotifications(true)}>
              <Bell className="size-5" />
              {unread > 0 && (
                <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-red text-[9px] font-bold text-white ring-2 ring-bg">
                  {unread}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 rounded-full outline-none ring-offset-bg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Avatar className="size-9 ring-2 ring-white/10 transition-shadow hover:ring-primary/40">
                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                <AvatarFallback>{initials(currentUser.name)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{currentUser.name}</span>
                <span className="text-xs text-muted-foreground">{currentUser.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push("/settings")}>
              <User /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/settings")}>
              <SettingsIcon /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/settings")}>
              <CreditCard /> Billing
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/ai-mentor")}>
              <Sparkles /> Ask AI Mentor
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={() => router.push("/")}>
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
