/* ============================================================
   Wealth Mastery OS — Current Affairs Engine (seed items)
   Each item answers: What / Why it happened / Why it matters /
   How it affects wealth creation. Editable via Admin (Settings).
   ============================================================ */
(function () {
  "use strict";

  const NEWS = [
    {
      id: "news1", category: "Markets", date: "2026-06-20", tags: ["interest rates", "equities"],
      title: "Central banks signal a slower path on rate cuts",
      what: "Major central banks indicated they will cut policy rates more gradually than markets expected, citing sticky services inflation.",
      why: "Inflation in services and wages has proven stubborn even as goods inflation cooled, so policymakers are wary of easing too fast.",
      matters: "Rate expectations are the gravity of asset prices. A 'higher-for-longer' stance compresses valuations for long-duration assets like growth stocks and bonds.",
      wealth: "Favours cash-flow-rich, lower-duration assets; rewards patience and dry powder. Revisit discount-rate assumptions in any DCF you build."
    },
    {
      id: "news2", category: "Technology", date: "2026-06-18", tags: ["AI", "productivity"],
      title: "AI agents move from demos to deployed enterprise workflows",
      what: "Large firms began putting autonomous AI agents into production for finance, support and research tasks at scale.",
      why: "Model reliability, tooling and cost-per-task crossed the threshold where ROI is clear for narrow, well-defined workflows.",
      matters: "This compresses the cost of knowledge work and reprices the value of routine analysis versus judgement and taste.",
      wealth: "Skill-stack toward judgement, distribution and capital allocation — the parts AI augments rather than replaces. Build with AI early."
    },
    {
      id: "news3", category: "Economy", date: "2026-06-15", tags: ["India", "GDP"],
      title: "India remains among the fastest-growing major economies",
      what: "India's growth continued to outpace most large economies, driven by domestic demand, capex and digital infrastructure.",
      why: "Favourable demographics, public investment and a maturing digital-payments stack supported broad-based activity.",
      matters: "Sustained nominal growth expands corporate earnings pools and the runway for domestic compounding.",
      wealth: "A long structural tailwind for patient equity investors with a domestic tilt; mind valuations, not just the narrative."
    },
    {
      id: "news4", category: "Geopolitics", date: "2026-06-10", tags: ["trade", "supply chains"],
      title: "Supply chains keep diversifying away from single-country dependence",
      what: "Manufacturers continued 'China+1' strategies, spreading production across India, Southeast Asia and Mexico.",
      why: "Tariff risk, pandemic-era lessons and geopolitical tension pushed firms to prioritise resilience over pure cost.",
      matters: "Capital is reallocating across borders, creating winners in newly favoured manufacturing hubs.",
      wealth: "Watch beneficiaries in logistics, industrials and infrastructure of 'connector' economies; trade resilience is a multi-decade theme."
    },
    {
      id: "news5", category: "Business", date: "2026-06-05", tags: ["profitability", "startups"],
      title: "Startups pivot from growth-at-all-costs to durable unit economics",
      what: "Venture-backed companies emphasised path-to-profitability and capital efficiency over headline growth.",
      why: "Higher capital costs and a tougher funding market made cash discipline a survival requirement.",
      matters: "It marks a regime change in how growth is valued — quality of growth now beats quantity.",
      wealth: "Reinforces a first-principles lesson: cash flow and unit economics are what ultimately create value."
    },
    {
      id: "news6", category: "Markets", date: "2026-05-28", tags: ["gold", "diversification"],
      title: "Gold holds near record highs as a portfolio hedge",
      what: "Gold stayed elevated as investors and central banks added to reserves.",
      why: "Currency-debasement concerns, geopolitical risk and diversification demand supported the metal.",
      matters: "It highlights gold's enduring role as a non-correlated store of value in turbulent regimes.",
      wealth: "A reminder to think in terms of asset-class diversification and convexity, not single-asset bets."
    }
  ];

  const CATEGORIES = ["Economy", "Business", "Markets", "Technology", "Geopolitics"];

  window.WM = window.WM || {};
  window.WM.NEWS = NEWS;
  window.WM.NEWS_CATEGORIES = CATEGORIES;
})();
