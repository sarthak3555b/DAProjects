"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Sparkles } from "lucide-react";

const PROMPTS = ["What did you learn today?", "What confused you?", "Give me a 60-minute plan", "What should I learn next?"];

export function MentorDrawer({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery<{ messages: { role: string; text: string }[] }>({
    queryKey: ["mentor"],
    queryFn: async () => (await fetch("/api/mentor")).json(),
    enabled: open,
  });
  const messages = data?.messages || [];

  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [messages, sending]);

  async function send(text: string) {
    if (!text.trim() || sending) return;
    setSending(true);
    setInput("");
    qc.setQueryData<{ messages: any[] }>(["mentor"], (old) => ({ messages: [...(old?.messages || []), { role: "user", text }] }));
    await fetch("/api/mentor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
    await qc.invalidateQueries({ queryKey: ["mentor"] });
    setSending(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.aside initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 z-[91] flex h-full w-full max-w-md flex-col border-l border-border bg-panel shadow-soft">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5 font-display font-bold">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-project to-learning text-xs font-extrabold text-white">AI</span>
                Mentor
              </div>
              <button className="btn h-8 w-8 p-0" onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>
            </div>
            <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto p-5">
              {messages.length === 0 && (
                <div className="rounded-xl border border-border bg-white/5 p-4 text-sm text-muted">
                  <Sparkles className="mb-2 h-4 w-4 text-learning" />
                  Hi! I&apos;m your mentor. Tell me what you learned, what confused you, or ask for a study plan — I adapt to your progress.
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "ml-auto rounded-br-sm bg-learning/15 text-fg" : "rounded-bl-sm border border-border bg-white/5"}`}>
                  {m.text}
                </div>
              ))}
              {sending && <div className="max-w-[88%] rounded-2xl rounded-bl-sm border border-border bg-white/5 px-4 py-2.5 text-sm text-faint">Thinking…</div>}
              <div className="flex flex-wrap gap-2 pt-2">
                {PROMPTS.map((p) => <button key={p} className="chip hover:border-white/20" onClick={() => send(p)}>{p}</button>)}
              </div>
            </div>
            <form className="flex gap-2 border-t border-border p-4" onSubmit={(e) => { e.preventDefault(); send(input); }}>
              <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tell your mentor what you learned…" />
              <button className="btn btn-primary px-3" disabled={sending}><Send className="h-4 w-4" /></button>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
