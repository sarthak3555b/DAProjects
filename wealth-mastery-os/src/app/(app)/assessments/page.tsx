"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Clock, GraduationCap, Play, RotateCcw, CheckCircle2, XCircle, Circle, Lock } from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import type { Assessment, AssessmentStatus, Difficulty } from "@/lib/types";
import { PageHeader } from "@/components/shell/page-header";
import { QuizEngine } from "@/components/assessments/quiz-engine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState, OfflineState, EmptyState } from "@/components/states";
import { useOnlineStatus } from "@/lib/hooks";
import { TiltCard } from "@/components/fx/tilt-card";
import { cn } from "@/lib/utils";

const diffColor: Record<Difficulty, "green" | "primary" | "orange" | "red"> = {
  BEGINNER: "green", INTERMEDIATE: "primary", ADVANCED: "orange", EXPERT: "red",
};

const statusMeta: Record<AssessmentStatus, { icon: typeof Circle; color: string; label: string }> = {
  NOT_STARTED: { icon: Circle, color: "text-muted-foreground", label: "Not started" },
  IN_PROGRESS: { icon: Play, color: "text-primary", label: "In progress" },
  PASSED: { icon: CheckCircle2, color: "text-green", label: "Passed" },
  FAILED: { icon: XCircle, color: "text-red", label: "Needs retake" },
};

function AssessmentCard({ a, index, onStart }: { a: Assessment; index: number; onStart: (a: Assessment) => void }) {
  const meta = statusMeta[a.status];
  const Icon = meta.icon;
  const playable = a.questions.length > 0;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
      <TiltCard className="h-full" intensity={6}>
        <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card/50 p-5 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <Badge variant={diffColor[a.difficulty]}>{a.difficulty.charAt(0) + a.difficulty.slice(1).toLowerCase()}</Badge>
            <span className={cn("flex items-center gap-1 text-xs", meta.color)}><Icon className="size-3.5" /> {meta.label}</span>
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold">{a.title}</h3>
          <p className="mt-1 flex-1 text-sm text-muted-foreground">{a.description}</p>

          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="size-3.5" /> {a.timeLimitMinutes}m</span>
            <span className="flex items-center gap-1"><GraduationCap className="size-3.5" /> {a.totalQuestions || a.questions.length} questions</span>
            {a.score !== undefined && <span className={cn("ml-auto font-semibold", a.score >= 70 ? "text-green" : "text-orange")}>{a.score}%</span>}
          </div>

          <Button
            variant={a.status === "PASSED" || a.status === "FAILED" ? "secondary" : "gradient"}
            className="mt-4 w-full"
            disabled={!playable}
            onClick={() => onStart(a)}
          >
            {!playable ? <><Lock className="size-4" /> Coming soon</> : a.status === "PASSED" || a.status === "FAILED" ? <><RotateCcw className="size-4" /> Retake</> : <><Play className="size-4" /> Start assessment</>}
          </Button>
        </div>
      </TiltCard>
    </motion.div>
  );
}

export default function AssessmentsPage() {
  const online = useOnlineStatus();
  const { data, status, refetch } = useQuery({ queryKey: queryKeys.assessments, queryFn: api.assessments });
  const [active, setActive] = useState<Assessment | null>(null);

  if (active) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Assessment" title={active.title} description="Answer carefully — your mastery map updates from the results." />
        <QuizEngine assessment={active} onExit={() => setActive(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Assessments"
        title="Prove your mastery"
        description="Adaptive checks that pinpoint strengths, expose gaps, and earn you XP."
      />

      {!online && status !== "success" ? (
        <OfflineState />
      ) : status === "pending" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
        </div>
      ) : status === "error" ? (
        <ErrorState onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No assessments yet" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((a, i) => <AssessmentCard key={a.id} a={a} index={i} onStart={setActive} />)}
        </div>
      )}
    </div>
  );
}
