"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebar: (v: boolean) => void;

  // Mobile sidebar (drawer)
  mobileNavOpen: boolean;
  setMobileNav: (v: boolean) => void;

  // Command palette
  commandOpen: boolean;
  setCommandOpen: (v: boolean) => void;
  toggleCommand: () => void;

  // Notifications drawer
  notificationsOpen: boolean;
  setNotificationsOpen: (v: boolean) => void;

  // Ambient / experience preferences
  soundEnabled: boolean;
  toggleSound: () => void;
  ambientEnabled: boolean;
  toggleAmbient: () => void;

  // Theme (dark default; light + system supported by tokens)
  theme: "dark" | "light" | "system";
  setTheme: (t: "dark" | "light" | "system") => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebar: (v) => set({ sidebarCollapsed: v }),

      mobileNavOpen: false,
      setMobileNav: (v) => set({ mobileNavOpen: v }),

      commandOpen: false,
      setCommandOpen: (v) => set({ commandOpen: v }),
      toggleCommand: () => set((s) => ({ commandOpen: !s.commandOpen })),

      notificationsOpen: false,
      setNotificationsOpen: (v) => set({ notificationsOpen: v }),

      soundEnabled: false,
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      ambientEnabled: true,
      toggleAmbient: () => set((s) => ({ ambientEnabled: !s.ambientEnabled })),

      theme: "dark",
      setTheme: (t) => set({ theme: t }),
    }),
    {
      name: "wm-ui",
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        soundEnabled: s.soundEnabled,
        ambientEnabled: s.ambientEnabled,
        theme: s.theme,
      }),
    },
  ),
);
