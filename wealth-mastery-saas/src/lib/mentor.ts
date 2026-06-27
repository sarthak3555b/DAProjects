/* AI Mentor — provider abstraction (OpenAI / Anthropic / local).
   Always falls back to the built-in heuristic mentor so it works
   with zero configuration. Server-side only. */

type Msg = { role: "user" | "assistant"; text: string };

const SYSTEM =
  "You are a rigorous, encouraging mentor inside Wealth Mastery OS, teaching money, business, investing, economics, technology and capital allocation. Be concise, practical, and always push the learner to apply and reflect (Learn, Build, Observe, Reflect, Implement, Review, Repeat).";

export function localReply(text: string, ctx?: { currentNode?: string | null; streak?: number; pct?: number }): string {
  const t = (text || "").toLowerCase();
  if (/plan|session|how.*start|60|minute/.test(t)) {
    const n = ctx?.currentNode || "your current topic";
    return [
      `**60-minute session — ${n}**`,
      `- 0–10m · Recall what you already know.`,
      `- 10–35m · Learn one resource and take Cornell-style notes.`,
      `- 35–50m · Build: apply it to a concrete example.`,
      `- 50–58m · Reflect: what was the key idea?`,
      `- 58–60m · Review: schedule a 7-day spaced-repetition check.`,
    ].join("\n");
  }
  if (/confus|stuck|hard|difficult/.test(t)) return "Confusion marks the edge of your understanding. Write the exact sentence that confuses you, restate it plainly, then find one example and one counter-example. Log it in your journal so we revisit it.";
  if (/learn|learned|today|studied/.test(t)) return "Excellent. Summarise it in one sentence, connect it to what you already know, and plan where you'll apply it. Knowledge without implementation is incomplete — what will you build with this?";
  if (/build|built|project|made/.test(t)) return "Building crystallises understanding. Capture what worked, what broke, and one improvement. Log it under Projects so progress compounds.";
  if (/recommend|next|what should|suggest/.test(t)) return `Focus next on ${ctx?.currentNode || "your current frontier"}. Then review anything due for spaced repetition, and journal one application.`;
  if (/streak|motivat|tired/.test(t)) return `You're at a ${ctx?.streak ?? 0}-day streak and ${Math.round(ctx?.pct ?? 0)}% overall. Consistency beats intensity — even 15 focused minutes today keeps the flywheel turning.`;
  return "Let's turn that into a learning loop: what's the core idea, where will you apply it, and what will you review in a week? Tell me what you learned today and I'll help you lock it in.";
}

export async function mentorReply(text: string, history: Msg[], ctx?: { currentNode?: string | null; streak?: number; pct?: number }): Promise<string> {
  const provider = (process.env.MENTOR_PROVIDER || "auto").toLowerCase();
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  try {
    if ((provider === "openai" || provider === "auto") && openaiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.6,
          messages: [{ role: "system", content: SYSTEM }, ...history.map((m) => ({ role: m.role, content: m.text })), { role: "user", content: text }],
        }),
      });
      const j = await res.json();
      const out = j?.choices?.[0]?.message?.content;
      if (out) return out;
    }
    if ((provider === "anthropic" || provider === "auto") && anthropicKey) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": anthropicKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
          max_tokens: 700,
          system: SYSTEM,
          messages: [...history.map((m) => ({ role: m.role, content: m.text })), { role: "user", content: text }],
        }),
      });
      const j = await res.json();
      const out = j?.content?.[0]?.text;
      if (out) return out;
    }
  } catch {
    /* fall through to local */
  }
  return localReply(text, ctx);
}

export const DAILY_PROMPTS = [
  "What did you learn today?",
  "What confused you?",
  "What did you build or apply?",
  "How will you use this in real life?",
  "What questions remain?",
];
