import { LandingNav } from "@/components/landing/landing-nav";
import { Hero } from "@/components/landing/hero";
import {
  Mission,
  Features,
  UniverseSection,
  DemoSection,
  Testimonials,
  FAQ,
  LandingFooter,
} from "@/components/landing/sections";
import { LenisProvider } from "@/components/shell/lenis-provider";

export default function LandingPage() {
  return (
    <LenisProvider>
      <div className="relative min-h-dvh overflow-hidden bg-bg">
        {/* ambient base */}
        <div className="pointer-events-none fixed inset-0 -z-10 mesh-gradient opacity-60" aria-hidden />
        <LandingNav />
        <main id="main-content">
          <Hero />
          <Mission />
          <Features />
          <UniverseSection />
          <DemoSection />
          <Testimonials />
          <FAQ />
        </main>
        <LandingFooter />
      </div>
    </LenisProvider>
  );
}
