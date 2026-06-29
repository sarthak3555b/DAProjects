"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Check, X, ArrowRight, RotateCcw, Trophy, Target, TriangleAlert } from "lucide-react";
import type { Assessment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sound";

function fireConfetti() {
  import("canvas-confetti").then(({ default: confetti }) => {
    confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 }, colors: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"] });
  }).catch(() => {});
}

export function QuizEngine({ assessment, onExit }: { assessment: Assessment; onExit: () => void }) {
  const [phase, setPhase] = useState<"quiz" | "results">("quiz");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(assessment.timeLimitMinutes * 60);

  const q = assessment.questions[index];
  const total = assessment.questions.length;

  useEffect(() => {
    if (phase !== "quiz") return;
    if (timeLeft <= 0) { setPhase("results"); return; }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft]);

  const score = useMemo(() => {
    const correct = assessment.questions.filter((qq) => answers[qq.id] === qq.correctOptionId).length;
    return total ? Math.round((correct / total) * 100) : 0;
  }, [answers, assessment.questions, total]);

  const next = () => {
    if (!picked) return;
    const updated = { ...answers, [q.id]: picked };
    setAnswers(updated);
    setPicked(null);
    if (index + 1 < total) {
      setIndex((i) => i + 1);
    } else {
      const correct = assessment.questions.filter((qq) => updated[qq.id] === qq.correctOptionId).length;
      const finalScore = Math.round((correct / total) * 100);
      setPhase("results");
      if (finalScore >= 70) { fireConfetti(); sfx.achievement(); } else sfx.notify();
    }
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const lowTime = timeLeft <= 30;

  if (phase === "results") {
    const passed = score >= 70;
    const strengths = assessment.questions.filter((qq) => answers[qq.id] === qq.correctOptionId);
    const weaknesses = assessment.questions.filter((qq) => answers[qq.id] !== qq.correctOptionId);
    const r = 54;
    const c = 2 * Math.PI * r;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-border/70 bg-card/50 p-8 text-center backdrop-blur-xl">
          <div className="relative mx-auto size-40">
            <svg className="size-full -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
              <motion.circle
                cx="64" cy="64" r={r} fill="none" stroke={passed ? "#10b981" : "#f59e0b"} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - (score / 100) * c }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-4xl font-bold">{score}%</span>
              <span className={cn("text-xs font-medium", passed ? "text-green" : "text-orange")}>{passed ? "Passed" : "Keep going"}</span>
            </div>
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold">
            {passed ? "Mastery demonstrated" : "Almost there"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You answered {strengths.length} of {total} correctly on {assessment.title}.
          </p>

          <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
            <div className="rounded-xl border border-green/20 bg-green/[0.05] p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-green"><Target className="size-4" /> Strengths</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {strengths.length ? strengths.map((s) => <li key={s.id} className="flex gap-1.5"><Check className="size-3.5 shrink-0 text-green" />{s.prompt}</li>) : <li>—</li>}
              </ul>
            </div>
            <div className="rounded-xl border border-orange/20 bg-orange/[0.05] p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-orange"><TriangleAlert className="size-4" /> To review</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {weaknesses.length ? weaknesses.map((s) => <li key={s.id} className="flex gap-1.5"><X className="size-3.5 shrink-0 text-orange" />{s.prompt}</li>) : <li>Nothing — flawless!</li>}
              </ul>
            </div>
          </div>

          <div className="mt-7 flex justify-center gap-2">
            <Button variant="secondary" onClick={onExit}>Back to assessments</Button>
            <Button variant="gradient" onClick={() => { setPhase("quiz"); setIndex(0); setAnswers({}); setPicked(null); setTimeLeft(assessment.timeLimitMinutes * 60); }}>
              <RotateCcw className="size-4" /> Retake
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center gap-4">
        <div className="flex-1">
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>Question {index + 1} of {total}</span>
            <span>{Math.round(((index) / total) * 100)}% complete</span>
          </div>
          <Progress value={(index / total) * 100} />
        </div>
        <div className={cn("flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-sm font-semibold", lowTime ? "border-red/30 bg-red/10 text-red animate-pulse-glow" : "border-white/10 bg-card/50 text-foreground")}>
          <Clock className="size-4" /> {mm}:{ss}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="font-display text-xl font-semibold leading-snug sm:text-2xl">{q.prompt}</h2>
          <div className="mt-6 space-y-3">
            {q.options.map((o, i) => {
              const active = picked === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => { setPicked(o.id); sfx.click(); }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200",
                    active ? "border-primary bg-primary/10 shadow-glow" : "border-border/70 bg-card/40 hover:border-white/20 hover:bg-white/[0.04]",
                  )}
                >
                  <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold", active ? "border-primary bg-primary text-white" : "border-white/15 text-muted-foreground")}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm font-medium">{o.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-7 flex items-center justify-between">
        <Button variant="ghost" onClick={onExit}>Exit</Button>
        <Button variant="gradient" disabled={!picked} onClick={next}>
          {index + 1 < total ? <>Next question <ArrowRight className="size-4" /></> : <>Submit <Trophy className="size-4" /></>}
        </Button>
      </div>
    </div>
  );
}
