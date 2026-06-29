"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/fx/magnetic";
import { HeroUniverse } from "./hero-universe";
import { useReducedMotion } from "@/lib/hooks";

const HEADLINE = ["Master", "Money.", "Master", "Capital.", "Master", "Your", "Future."];

export function Hero() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.set("[data-hero-word]", { yPercent: 120, opacity: 0 });
      gsap.set("[data-hero-fade]", { opacity: 0, y: 24 });
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.to("[data-hero-word]", {
        yPercent: 0,
        opacity: 1,
        duration: 1.1,
        stagger: 0.08,
      })
        .to("[data-hero-fade]", { opacity: 1, y: 0, duration: 0.9, stagger: 0.15 }, "-=0.6");
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} className="relative flex min-h-dvh items-center justify-center overflow-hidden">
      {/* 3D universe */}
      <HeroUniverse />

      {/* gradient floor + vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(3,7,18,0.85)_85%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-bg to-transparent" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <div
          data-hero-fade
          className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur"
        >
          <Sparkles className="size-3.5 text-primary" />
          The operating system for mastering wealth
        </div>

        <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          <span className="sr-only">Master Money. Master Capital. Master Your Future.</span>
          <span aria-hidden className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {HEADLINE.map((word, i) => (
              <span key={i} className="overflow-hidden py-1">
                <span
                  data-hero-word
                  className={cnWord(word)}
                >
                  {word}
                </span>
              </span>
            ))}
          </span>
        </h1>

        <p data-hero-fade className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
          A cinematic learning universe for money, economics, business, investing, technology, and capital
          allocation — engineered to make mastery addictive.
        </p>

        <div data-hero-fade className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Magnetic>
            <Button variant="gradient" size="lg" asChild className="group">
              <Link href="/dashboard">
                Start Journey
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </Magnetic>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/roadmap">
              <Compass /> Explore Roadmap
            </Link>
          </Button>
        </div>

        <div data-hero-fade className="mt-14 flex items-center justify-center gap-8 text-center">
          {[
            { v: "7", l: "Knowledge Galaxies" },
            { v: "120+", l: "Mastery Modules" },
            { v: "∞", l: "Compounding" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-2xl font-bold gradient-text">{s.v}</p>
              <p className="text-xs text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/20 p-1">
          <span className="h-2 w-1 animate-bounce rounded-full bg-white/60" />
        </div>
      </div>
    </section>
  );
}

function cnWord(word: string) {
  const accent = ["Money.", "Capital.", "Future."].includes(word);
  return `inline-block ${accent ? "gradient-text" : "text-foreground"}`;
}
