"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Sparkles,
  Brain,
  Lightbulb,
  RotateCcw,
  BookMarked,
  ArrowUpRight,
  MessageSquareQuote,
} from "lucide-react";
import { mentorPrompts } from "@/lib/mock-data";
import { useMentorChat } from "@/lib/use-mentor-chat";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const memory = [
  { title: "Your focus", body: "Capital Markets & Valuation — Phase 4 of 6.", icon: Brain },
  { title: "Recent insight", body: "“DCF intuition finally clicked.” — journal, 3 days ago.", icon: Lightbulb },
  { title: "Strength", body: "Strong grasp of monetary fundamentals (90% mastery).", icon: Sparkles },
];

const reflections = [
  "What did you learn today?",
  "What confused you the most?",
  "What did you build or apply?",
  "How will you use this to allocate capital?",
];

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-primary"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

export default function AIMentorPage() {
  const { messages, streaming, send, reset } = useMentorChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const submit = (text: string) => {
    send(text);
    setInput("");
  };

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] flex-col">
      <PageHeader
        eyebrow="AI Mentor"
        title="Your living mentor"
        description="Streaming guidance that remembers your journey and adapts to how you learn."
        actions={
          messages.length > 0 ? (
            <Button variant="secondary" size="sm" onClick={reset}>
              <RotateCcw className="size-4" /> New conversation
            </Button>
          ) : null
        }
      />

      <div className="grid flex-1 gap-4 overflow-hidden lg:grid-cols-[1fr_320px]">
        {/* Chat */}
        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/40 backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 mesh-gradient opacity-40" aria-hidden />

          <ScrollArea className="flex-1">
            <div ref={scrollRef} className="flex h-full flex-col gap-5 p-5 sm:p-6">
              {messages.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative mb-5 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-purple shadow-glow-lg"
                  >
                    <div className="absolute inset-0 animate-pulse-glow rounded-3xl" />
                    <Sparkles className="size-9 text-white" />
                  </motion.div>
                  <h3 className="font-display text-xl font-bold">How can I help you compound today?</h3>
                  <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                    Ask anything about money, markets, valuation, or capital allocation.
                  </p>
                  <div className="mt-6 grid w-full max-w-lg gap-2 sm:grid-cols-2">
                    {mentorPrompts.map((p) => (
                      <button
                        key={p}
                        onClick={() => submit(p)}
                        className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left text-sm transition-colors hover:border-primary/30 hover:bg-white/[0.06]"
                      >
                        <MessageSquareQuote className="size-4 shrink-0 text-primary" />
                        <span className="flex-1">{p}</span>
                        <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}
                  >
                    {m.role === "assistant" ? (
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple text-white">
                        <Sparkles className="size-4" />
                      </span>
                    ) : (
                      <Avatar className="size-8 shrink-0"><AvatarFallback>AM</AvatarFallback></Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "border border-white/10 bg-surface/60 text-foreground/90",
                      )}
                    >
                      {m.content || (streaming && <TypingDots />)}
                      {m.role === "assistant" && m.content && streaming && (
                        <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-primary align-middle" />
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Composer */}
          <div className="border-t border-border/50 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className="flex items-end gap-2 rounded-xl border border-white/10 bg-surface/60 p-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(input);
                  }
                }}
                rows={1}
                placeholder="Ask your mentor anything…"
                aria-label="Message"
                className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button type="submit" size="icon" disabled={!input.trim() || streaming} aria-label="Send message">
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Memory + reflections */}
        <div className="hidden flex-col gap-4 overflow-y-auto lg:flex">
          <section className="rounded-2xl border border-border/70 bg-card/40 p-4 backdrop-blur-xl">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Brain className="size-4 text-primary" /> Memory</h3>
            <div className="space-y-2">
              {memory.map((m) => (
                <div key={m.title} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-foreground"><m.icon className="size-3.5 text-purple" /> {m.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{m.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card/40 p-4 backdrop-blur-xl">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Lightbulb className="size-4 text-orange" /> Reflection prompts</h3>
            <div className="space-y-1.5">
              {reflections.map((r) => (
                <button key={r} onClick={() => submit(r)} disabled={streaming} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground disabled:opacity-50">
                  <span className="size-1.5 rounded-full bg-orange" /> {r}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-4">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold"><BookMarked className="size-4 text-primary" /> Recommended next</h3>
            <p className="text-xs text-muted-foreground">Based on your questions, revisit “Equity Valuation” and try the DCF project.</p>
            <Button variant="secondary" size="sm" className="mt-3 w-full" asChild>
              <a href="/roadmap?node=n7">Open module <ArrowUpRight className="size-3.5" /></a>
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
