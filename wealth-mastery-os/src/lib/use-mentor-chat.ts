"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { sfx } from "@/lib/sound";

const RESPONSES: { match: RegExp; text: string }[] = [
  {
    match: /inflation|price|purchasing/i,
    text: "Inflation is the silent tax on idle capital. When prices rise, each unit of currency commands fewer goods — so real returns matter more than nominal ones. To protect wealth, you tilt toward assets whose cash flows grow with prices: productive equity, real assets, and pricing-power businesses. The discipline is simple to state, hard to live: own things that compound faster than money decays.",
  },
  {
    match: /valuation|dcf|intrinsic|worth/i,
    text: "Valuation is just disciplined humility about the future. A business is worth the cash it will return to owners, discounted for time and risk. A DCF forces you to state your assumptions out loud — growth, margins, reinvestment, and the discount rate. The number isn't the point; the thinking is. Most mistakes come from a discount rate that ignores risk or a terminal value doing all the heavy lifting.",
  },
  {
    match: /interest|rate|fed|monetary/i,
    text: "Interest rates are the gravity of finance. They set the cost of money and the discount rate on every future cash flow — so when they move, every asset reprices. Higher rates pull valuations down and reward patient capital; lower rates inflate long-duration assets. Watch the yield curve: it encodes the market's collective forecast of growth and policy.",
  },
  {
    match: /capital|allocat|roic|reinvest/i,
    text: "Capital allocation is the CEO's highest-leverage job — and yours as an investor. Every dollar has five doors: reinvest in the business, acquire, pay down debt, buy back shares, or pay dividends. The right door is whichever earns the highest risk-adjusted return on incremental capital. Great allocators are ruthless comparison shoppers for returns.",
  },
];

const DEFAULT =
  "Great question. Let's reason from first principles. Break the problem into the cash flows involved, the risks attached to them, and the time horizon. Then ask what would have to be true for your thesis to work — and what would prove you wrong. Mastery compounds when you connect each new idea to the ones you already hold.";

function pickResponse(input: string) {
  return RESPONSES.find((r) => r.match.test(input))?.text ?? DEFAULT;
}

let idCounter = 0;
const newId = () => `m_${Date.now()}_${idCounter++}`;

export function useMentorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const send = useCallback((content: string) => {
    if (!content.trim() || streaming) return;
    const userMsg: ChatMessage = { id: newId(), role: "user", content, createdAt: Date.now() };
    const assistantId = newId();
    setMessages((m) => [...m, userMsg, { id: assistantId, role: "assistant", content: "", createdAt: Date.now() }]);
    setStreaming(true);

    const full = pickResponse(content);
    const words = full.split(" ");
    let i = 0;
    // brief "thinking" delay, then stream word-by-word
    const start = setTimeout(() => {
      timer.current = setInterval(() => {
        i += 1;
        setMessages((m) =>
          m.map((msg) => (msg.id === assistantId ? { ...msg, content: words.slice(0, i).join(" ") } : msg)),
        );
        if (i >= words.length) {
          if (timer.current) clearInterval(timer.current);
          setStreaming(false);
          sfx.notify();
        }
      }, 32);
    }, 520);

    return () => {
      clearTimeout(start);
      if (timer.current) clearInterval(timer.current);
    };
  }, [streaming]);

  const reset = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    setMessages([]);
    setStreaming(false);
  }, []);

  return { messages, streaming, send, reset };
}
