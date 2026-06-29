"use client";

import { AnimatePresence, motion } from "motion/react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/lib/hooks";

export function OfflineBanner() {
  const online = useOnlineStatus();
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          role="status"
          className="fixed left-1/2 top-3 z-[150] flex -translate-x-1/2 items-center gap-2 rounded-full border border-orange/30 bg-orange/15 px-4 py-2 text-sm font-medium text-orange backdrop-blur-xl"
        >
          <WifiOff className="size-4" />
          You're offline — changes will sync when you reconnect.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
