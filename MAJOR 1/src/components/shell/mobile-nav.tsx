"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navGroups } from "@/lib/nav";
import { useUIStore } from "@/lib/stores/ui-store";
import { cn } from "@/lib/utils";
import { NavIcon } from "./nav-icon";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function MobileNav() {
  const open = useUIStore((s) => s.mobileNavOpen);
  const setOpen = useUIStore((s) => s.setMobileNav);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="pb-2">
          <SheetTitle className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple font-display text-sm font-extrabold text-white">
              W
            </span>
            Wealth Mastery OS
          </SheetTitle>
        </SheetHeader>
        <nav className="hide-scrollbar space-y-5 overflow-y-auto px-3 pb-8" aria-label="Mobile">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "border border-primary/30 bg-gradient-to-r from-primary/20 to-purple/10 text-foreground"
                          : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                      )}
                    >
                      <NavIcon name={item.icon} className="size-[18px]" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
