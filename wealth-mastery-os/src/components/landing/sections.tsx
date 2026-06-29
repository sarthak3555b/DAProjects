import Link from "next/link";
import {
  Brain,
  Compass,
  LineChart,
  Network,
  Newspaper,
  Sparkles,
  Target,
  Trophy,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Reveal } from "@/components/fx/reveal";
import { TiltCard } from "@/components/fx/tilt-card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ------------------------------- Mission -------------------------- */
export function Mission() {
  return (
    <section id="mission" className="relative mx-auto max-w-5xl px-6 py-28 text-center">
      <Reveal>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-primary/80">The Mission</p>
      </Reveal>
      <Reveal delay={1}>
        <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-balance sm:text-5xl">
          Wealth isn't luck. It's a{" "}
          <span className="gradient-text">system you can learn</span> — one connected idea at a time.
        </h2>
      </Reveal>
      <Reveal delay={2}>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-muted-foreground">
          Wealth Mastery OS turns scattered knowledge into a navigable universe. Follow a spatial roadmap,
          explore an interactive knowledge graph, track live markets, and compound understanding into
          capital — inside one cinematic operating system.
        </p>
      </Reveal>
    </section>
  );
}

/* ------------------------------ Features -------------------------- */
const FEATURES = [
  { icon: Compass, title: "Spatial Roadmap", body: "Navigate an infinite canvas of interconnected modules with progressive unlocking.", color: "text-primary", glow: "bg-primary/20" },
  { icon: Network, title: "Knowledge Graph", body: "Concepts as stars, dependencies as constellations. Fly between ideas in 3D.", color: "text-purple", glow: "bg-purple/20" },
  { icon: LineChart, title: "Terminal-grade Analytics", body: "Heatmaps, radars, treemaps and live charts that feel like a trading desk.", color: "text-green", glow: "bg-green/20" },
  { icon: Newspaper, title: "Current Affairs Engine", body: "Markets, geopolitics and economics — with AI summaries on wealth impact.", color: "text-orange", glow: "bg-orange/20" },
  { icon: Brain, title: "AI Mentor", body: "A living mentor that streams insight, remembers context, and adapts to you.", color: "text-primary", glow: "bg-primary/20" },
  { icon: Trophy, title: "Mastery & Streaks", body: "XP, medals, streak flames and unlock celebrations make progress addictive.", color: "text-orange", glow: "bg-orange/20" },
];

export function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-7xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary/80">Capabilities</p>
        <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Every surface designed like a product launch
        </h2>
        <p className="mt-4 text-muted-foreground">
          Thirteen deeply-crafted spaces, one coherent operating system.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i % 3}>
            <TiltCard className="h-full">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/50 p-6 backdrop-blur-xl transition-colors hover:border-white/15">
                <div className={`absolute -right-8 -top-8 size-28 rounded-full ${f.glow} blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60`} />
                <div className={`relative mb-4 flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${f.color}`}>
                  <f.icon className="size-5" />
                </div>
                <h3 className="relative font-display text-lg font-semibold">{f.title}</h3>
                <p className="relative mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* --------------------------- Universe CTA ------------------------- */
export function UniverseSection() {
  return (
    <section id="universe" className="relative mx-auto max-w-7xl px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-surface/60 to-card/40 p-10 backdrop-blur-xl sm:p-16">
        <div className="absolute inset-0 mesh-gradient opacity-70" />
        <div className="absolute -left-20 top-1/2 size-64 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-20 top-10 size-64 rounded-full bg-purple/20 blur-3xl" />
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Reveal>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary/80">Knowledge Universe</p>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl">
                Enter a galaxy of interconnected ideas
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-4 max-w-md text-muted-foreground">
                Topics are planets. Subtopics are moons. Dependencies are orbital lines. Search, zoom, and
                fly the camera to any concept — and watch related ideas illuminate.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button variant="gradient" asChild>
                  <Link href="/knowledge-graph">
                    <Sparkles /> Explore the Universe
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/roadmap">
                    View Roadmap <ArrowRight />
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
          <Reveal delay={2}>
            <div className="relative aspect-square w-full">
              {["Money", "Economics", "Business", "Markets", "Technology", "AI", "Capital"].map((t, i, arr) => {
                const angle = (i / arr.length) * Math.PI * 2;
                const r = 38;
                const x = 50 + Math.cos(angle) * r;
                const y = 50 + Math.sin(angle) * r;
                const colors = ["bg-primary", "bg-purple", "bg-green", "bg-orange", "bg-cyan-400", "bg-pink-400", "bg-cyan-300"];
                return (
                  <div
                    key={t}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={`size-3 rounded-full ${colors[i]} shadow-[0_0_16px] animate-pulse-glow`} />
                      <span className="rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur">
                        {t}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary to-purple shadow-glow-lg" />
              <div className="absolute left-1/2 top-1/2 size-44 -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full border border-dashed border-white/10" />
              <div className="absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full border border-dashed border-white/[0.06]" style={{ animationDirection: "reverse" }} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Interactive Demo --------------------- */
export function DemoSection() {
  const steps = [
    { icon: Target, title: "Assess", body: "Place yourself with adaptive assessments." },
    { icon: Compass, title: "Navigate", body: "Unlock your personalized mastery roadmap." },
    { icon: Zap, title: "Compound", body: "Turn daily reps into lifelong capital." },
  ];
  return (
    <section className="relative mx-auto max-w-5xl px-6 py-24">
      <Reveal className="text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Three moves to mastery</h2>
      </Reveal>
      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i}>
            <div className="relative rounded-2xl border border-border/70 bg-card/50 p-6 text-center backdrop-blur-xl">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-purple/30 text-primary">
                <s.icon className="size-5" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground">STEP {i + 1}</p>
              <h3 className="mt-1 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- Testimonials ----------------------- */
const QUOTES = [
  { quote: "It doesn't feel like a website. It feels like an operating system for my brain.", name: "Jordan Lee", role: "Founder" },
  { quote: "The roadmap turned an overwhelming subject into an addictive game.", name: "Priya Nair", role: "Analyst" },
  { quote: "Finally, finance learning that looks like it was built this decade.", name: "Marcus Webb", role: "Engineer" },
];

export function Testimonials() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Loved by ambitious minds</h2>
      </Reveal>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {QUOTES.map((q, i) => (
          <Reveal key={q.name} delay={i}>
            <figure className="h-full rounded-2xl border border-border/70 bg-card/50 p-6 backdrop-blur-xl">
              <blockquote className="text-pretty text-[15px] leading-relaxed text-foreground/90">
                “{q.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-purple/40 text-xs font-semibold">
                  {q.name.split(" ").map((n) => n[0]).join("")}
                </span>
                <span>
                  <span className="block text-sm font-medium">{q.name}</span>
                  <span className="block text-xs text-muted-foreground">{q.role}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- FAQ ----------------------------- */
const FAQS = [
  { q: "Is this a real trading or brokerage platform?", a: "No. Wealth Mastery OS is a learning operating system. It teaches the principles of money, markets, and capital allocation — it does not execute trades or provide financial advice." },
  { q: "What can I master here?", a: "Money, economics, business, investing, technology, capital allocation, and wealth creation — across a connected roadmap of modules and an explorable knowledge graph." },
  { q: "Does it work on mobile and tablet?", a: "Yes. The experience is fully responsive from 320px to ultra-wide, with native-app-quality interactions on every device." },
  { q: "Is the data real?", a: "This build ships with rich demonstration data so every screen feels alive. It's structured to connect to a real backend via typed interfaces." },
];

export function FAQ() {
  return (
    <section id="faq" className="relative mx-auto max-w-3xl px-6 py-24">
      <Reveal className="text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Questions, answered</h2>
      </Reveal>
      <Reveal delay={1}>
        <div className="mt-10 rounded-2xl border border-border/70 bg-card/50 px-6 backdrop-blur-xl">
          <Accordion type="single" collapsible>
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------- Footer --------------------------- */
export function LandingFooter() {
  return (
    <footer className="relative border-t border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-surface/50 to-card/30 p-10 text-center backdrop-blur-xl sm:p-16">
          <div className="absolute inset-0 aurora-bg -z-10" />
          <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            Begin compounding today
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Your future self is built from the reps you start now.
          </p>
          <div className="mt-8 flex justify-center">
            <Button variant="gradient" size="lg" asChild className="group">
              <Link href="/dashboard">
                Start Journey
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple font-display text-xs font-extrabold text-white">
              W
            </span>
            <span>© {new Date().getFullYear()} Wealth Mastery OS</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link href="/roadmap" className="hover:text-foreground">Roadmap</Link>
            <a href="#features" className="hover:text-foreground">Features</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
