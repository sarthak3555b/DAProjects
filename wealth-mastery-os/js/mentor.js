/* ============================================================
   Wealth Mastery OS — AI Mentor
   Local heuristic mentor (always works, offline) + optional
   external provider abstraction (OpenAI / Anthropic / local),
   feature-flagged in Settings. No key => local mentor.
   ============================================================ */
(function () {
  "use strict";
  const WM = (window.WM = window.WM || {});

  const DAILY_PROMPTS = [
    "What did you learn today?",
    "What confused you?",
    "What did you build or apply?",
    "How will you use this in real life?",
    "What questions remain?"
  ];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function progress() { return WM.store ? WM.store.progress() : { overallPct: 0, streak: 0, currentNode: null, completedCount: 0 }; }

  function greeting() {
    const p = progress();
    const name = WM.store ? WM.store.state.profile.name : "Learner";
    const lines = [];
    lines.push(`Hi ${name}. I'm your mentor — here to help you Learn, Build, Observe, Reflect, Implement, Review and Repeat.`);
    if (p.streak >= 3) lines.push(`🔥 ${p.streak}-day streak — momentum is compounding. Keep it alive today.`);
    if (p.currentNode) lines.push(`Right now you're on **${p.currentNode.title}** (Phase ${p.currentNode.phaseCode}). Want a 60-minute plan for it?`);
    else if (p.completedCount === 0) lines.push("Let's begin at Phase 0 — learning how to learn. Open the Roadmap when ready.");
    else lines.push("You've completed the roadmap's current frontier — superb. Time to review and apply.");
    return lines.join("\n\n");
  }

  function sessionPlan(node) {
    if (!node) return "Pick a node on the roadmap and I'll build a session plan.";
    return [
      `**60-minute session — ${node.title}**`,
      `- 0–10m · Recall: what do you already know about ${node.title}?`,
      `- 10–35m · Learn: read/watch one resource and take Cornell-style notes.`,
      `- 35–50m · Build: ${node.exercises[0]}`,
      `- 50–58m · Reflect: ${node.reflection[0]}`,
      `- 58–60m · Review: schedule a spaced-repetition check in 7 days.`
    ].join("\n");
  }

  function recommendations() {
    const p = progress();
    const recs = [];
    if (p.currentNode) recs.push({ kind: "learn", title: "Continue: " + p.currentNode.title, ref: p.currentNode.slug });
    // review due
    const due = reviewDue();
    if (due.length) recs.push({ kind: "review", title: "Review " + due.length + " node(s) due for spaced repetition", ref: due[0].slug });
    // weakness: phase with lowest non-zero progress
    let weakest = null;
    WM.PHASES.forEach((ph) => {
      const pp = WM.store.phaseProgress(ph);
      if (pp.done > 0 && pp.done < pp.total) {
        if (!weakest || pp.pct < weakest.pct) weakest = { phase: ph, pct: pp.pct };
      }
    });
    if (weakest) recs.push({ kind: "focus", title: "Strengthen Phase " + weakest.phase.code + " · " + weakest.phase.title, ref: weakest.phase.id, route: "roadmap" });
    if (p.streak === 0) recs.push({ kind: "habit", title: "Log a short session today to start a streak", route: "journal" });
    return recs;
  }

  function reviewDue() {
    if (!WM.store) return [];
    const today = new Date().toISOString().slice(0, 10);
    const out = [];
    for (const id in WM.store.state.nodes) {
      const rec = WM.store.state.nodes[id];
      if (rec.status === "completed" && rec.reviewDue && rec.reviewDue <= today) {
        const n = WM.NODE_BY_ID[id]; if (n) out.push(n);
      }
    }
    return out;
  }

  // ---- Local heuristic reply ----
  function localReply(text) {
    const t = (text || "").toLowerCase();
    const p = progress();
    if (/plan|session|how.*start|60|minute/.test(t)) return sessionPlan(p.currentNode);
    if (/confus|stuck|hard|difficult|don't understand|dont understand/.test(t)) {
      return "That's the most valuable signal in learning. Try this: (1) write the exact sentence that confuses you, (2) restate it in plain words, (3) find one example and one counter-example. Confusion marks the edge of your understanding — note it in your Journal so we can revisit it.";
    }
    if (/learn|learned|today|studied/.test(t)) {
      return "Excellent. To make it stick: summarise it in one sentence, connect it to something you already know, and plan where you'll *apply* it. Knowledge without implementation is incomplete — what will you build with this?";
    }
    if (/build|built|project|made/.test(t)) {
      return "Building is where understanding crystallises. Capture what worked, what broke, and one improvement. Log it under Projects so your progress compounds visibly.";
    }
    if (/apply|use|real life|practical/.test(t)) {
      return "Great instinct. Pick one concrete decision this week where you'll use it — a budget, a valuation, a negotiation — then journal the outcome. Application turns notes into judgement.";
    }
    if (/question|ask|why|how/.test(t)) {
      return "Good questions drive learning. Park it in your Journal as an open loop, and let's pursue it with First Principles: what must be true for the answer to make sense?";
    }
    if (/recommend|next|what should|suggest/.test(t)) {
      const r = recommendations();
      return "Here's what I'd focus on next:\n\n" + r.map((x) => "- " + x.title).join("\n");
    }
    if (/streak|motivat|tired|lazy/.test(t)) {
      return `You're at a ${p.streak}-day streak and ${Math.round(p.overallPct)}% overall. Consistency beats intensity — even 15 focused minutes today keeps the flywheel turning.`;
    }
    if (/hi|hello|hey/.test(t)) return greeting();
    // default reflective response
    return "I hear you. Let's turn that into a learning loop: what's the core idea, where will you apply it, and what will you review in a week? Tell me what you learned today and I'll help you lock it in.";
  }

  // ---- External provider abstraction (feature-flagged) ----
  async function externalReply(text) {
    const st = WM.store.state.settings;
    const provider = st.aiProvider;
    const key = (st.aiKey || "").trim();
    if (!key) throw new Error("no-key");
    const history = WM.store.state.mentor.slice(-8).map((m) => ({ role: m.role === "me" ? "user" : "assistant", content: m.text }));
    const system = "You are a rigorous, encouraging mentor inside Wealth Mastery OS, teaching money, business, investing, economics, technology and capital allocation. Be concise, practical, and always push the learner to apply and reflect.";
    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
        body: JSON.stringify({ model: st.aiModel || "gpt-4o-mini", messages: [{ role: "system", content: system }, ...history, { role: "user", content: text }], temperature: 0.6 })
      });
      const j = await res.json();
      return j.choices && j.choices[0] && j.choices[0].message.content;
    }
    if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: st.aiModel || "claude-3-5-sonnet-latest", max_tokens: 600, system, messages: [...history, { role: "user", content: text }] })
      });
      const j = await res.json();
      return j.content && j.content[0] && j.content[0].text;
    }
    throw new Error("unknown-provider");
  }

  async function send(text) {
    const st = WM.store.state.settings;
    if (st.aiEnabled && st.aiProvider && st.aiProvider !== "local") {
      try {
        const reply = await externalReply(text);
        if (reply) return reply;
      } catch (e) {
        return "(Falling back to the built-in mentor — external AI is unavailable or no key is set.)\n\n" + localReply(text);
      }
    }
    return localReply(text);
  }

  WM.mentor = { DAILY_PROMPTS, greeting, sessionPlan, recommendations, reviewDue, localReply, send, pick };
})();
