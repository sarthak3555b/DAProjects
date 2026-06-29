import { AmbientBackground } from "@/components/fx/ambient-background";
import { Sidebar } from "@/components/shell/sidebar";
import { MobileNav } from "@/components/shell/mobile-nav";
import { TopHeader } from "@/components/shell/top-header";
import { CommandPalette } from "@/components/shell/command-palette";
import { NotificationsDrawer } from "@/components/shell/notifications-drawer";
import { OfflineBanner } from "@/components/shell/offline-banner";
import { PageTransition } from "@/components/shell/page-transition";
import { LenisProvider } from "@/components/shell/lenis-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <AmbientBackground />
      <OfflineBanner />
      <div className="flex min-h-dvh">
        <Sidebar />
        <MobileNav />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopHeader />
          <main id="main-content" className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-[1600px]">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>
        </div>
      </div>
      <CommandPalette />
      <NotificationsDrawer />
    </LenisProvider>
  );
}
