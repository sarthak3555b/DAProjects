import Link from "next/link";
import { Logo } from "@/components/logo";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ArrowRight, Sparkles, Map, BarChart3, BrainCircuit, BookOpen, Trophy, Newspaper } from "lucide-react";

const FEATURES = [
  { icon: Map, title: "Interactive Roadmap", desc: "A roadmap.sh-grade infinite canvas across 22 phases and 326 nodes with dependencies, zoom, search and focus mode." },
  { icon: BarChart3, title: "Progress Analytics", desc: "Cloud-synced rings, radars, heatmaps, velocity and mastery charts that update as you learn." },
  { icon: BrainCircuit, title: "AI Mentor", desc: "A mentor that reviews your work, detects weaknesses and adapts your path. OpenAI, Anthropic or built-in." },
  { icon: BookOpen, title: "Journal & Resources", desc: "Daily reflective prompts and a curated, versioned resource library — all persisted to your account." },
  { icon: Newspaper, title: "Current Affairs", desc: "Markets, economy, tech and geopolitics framed around how each event affects wealth creation." },
  { icon: Trophy, title: "Streaks & Achievements", desc: "Duolingo-style streaks, goals and achievements to keep you compounding for a decade." },
];

export default async function Landing() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-6">
      <header className="flex items-center justify-between py-6">
        <Logo />
        <nav className="flex items-center gap-3">
          <Link href="/login" className="btn">Log in</Link>
          <Link href="/register" className="btn btn-primary">Get started <ArrowRight className="h-4 w-4" /></Link>
        </nav>
      </header>

      <section className="py-16 text-center md:py-24">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-panel/50 px-4 py-1.5 text-xs font-semibold text-muted">
          <Sparkles className="h-3.5 w-3.5 text-learning" /> Your personal university for mastering money
        </div>
        <h1 className="mx-auto max-w-3xl bg-gradient-to-b from-white to-white/60 bg-clip-text font-display text-4xl font-extrabold leading-tight text-transparent md:text-6xl">
          Master money, business &amp; capital allocation — over 10 years, one node at a time.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          Wealth Mastery OS is a full-stack learning operating system: an interactive roadmap, cloud-synced progress,
          AI mentor, journal and analytics. Learn · Build · Observe · Reflect · Implement · Review · Repeat.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/register" className="btn btn-primary px-6 py-3 text-base">Create free account <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/login" className="btn px-6 py-3 text-base">I have an account</Link>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-faint">
          <span className="chip">22 phases</span><span className="chip">326 nodes</span><span className="chip">Cloud sync</span>
          <span className="chip">Multi-device</span><span className="chip">PWA installable</span>
        </div>
      </section>

      <section className="grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="card card-hover">
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-learning/15 text-learning">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-base font-bold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-faint">
        Wealth Mastery OS — Learn · Build · Observe · Reflect · Implement · Review · Repeat.
      </footer>
    </div>
  );
}
