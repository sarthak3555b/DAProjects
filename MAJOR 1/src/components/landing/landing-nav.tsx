"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/fx/magnetic";
import { cn } from "@/lib/utils";

const links = [
  { label: "Mission", href: "#mission" },
  { label: "Features", href: "#features" },
  { label: "Universe", href: "#universe" },
  { label: "FAQ", href: "#faq" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "py-2" : "py-4",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        <div
          className={cn(
            "flex w-full items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300",
            scrolled && "glass-strong shadow-glow",
          )}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple font-display text-sm font-extrabold text-white shadow-glow">
              W
            </span>
            <span className="font-display text-sm font-bold tracking-tight">Wealth Mastery OS</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Sign in</Link>
            </Button>
            <Magnetic>
              <Button variant="gradient" size="sm" asChild>
                <Link href="/dashboard">Start Journey</Link>
              </Button>
            </Magnetic>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="mx-4 mt-2 rounded-2xl glass-strong p-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <Button variant="gradient" className="mt-2" asChild>
              <Link href="/dashboard">Start Journey</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
