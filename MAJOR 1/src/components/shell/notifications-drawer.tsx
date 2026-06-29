"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Bell, Trophy, Info, TriangleAlert, CheckCircle2, CheckCheck } from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import { useUIStore } from "@/lib/stores/ui-store";
import { timeAgo, cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/states";
import type { AppNotification } from "@/lib/types";

const iconFor = {
  achievement: { icon: Trophy, color: "text-orange bg-orange/10 border-orange/20" },
  info: { icon: Info, color: "text-primary bg-primary/10 border-primary/20" },
  warning: { icon: TriangleAlert, color: "text-orange bg-orange/10 border-orange/20" },
  success: { icon: CheckCircle2, color: "text-green bg-green/10 border-green/20" },
} as const;

function Row({ n, i }: { n: AppNotification; i: number }) {
  const { icon: Icon, color } = iconFor[n.type];
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.05 }}
      className={cn(
        "flex gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-white/10 hover:bg-white/[0.03]",
        !n.read && "bg-white/[0.02]",
      )}
    >
      <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl border", color)}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{n.title}</p>
          {!n.read && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
        <p className="mt-1 text-[11px] text-muted-foreground/70">{timeAgo(n.timestamp)}</p>
      </div>
    </motion.div>
  );
}

export function NotificationsDrawer() {
  const open = useUIStore((s) => s.notificationsOpen);
  const setOpen = useUIStore((s) => s.setNotificationsOpen);
  const { data, status, refetch } = useQuery({ queryKey: queryKeys.notifications, queryFn: api.notifications });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="size-4 text-primary" /> Notifications
            </SheetTitle>
            <Button variant="ghost" size="sm" className="text-xs">
              <CheckCheck className="size-3.5" /> Mark all read
            </Button>
          </div>
          <SheetDescription>Your latest activity and reminders.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 pb-6">
          {status === "pending" && (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-3">
                  <Skeleton className="size-9 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {status === "error" && <ErrorState onRetry={() => refetch()} />}
          {status === "success" &&
            (data.length === 0 ? (
              <EmptyState icon={Bell} title="All caught up" description="You have no notifications right now." />
            ) : (
              <div className="space-y-1">
                {data.map((n, i) => (
                  <Row key={n.id} n={n} i={i} />
                ))}
              </div>
            ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
