/* ============================================================
   Wealth Mastery OS — Curriculum Engine
   All 21 phases -> modules -> fully-modelled nodes.
   Static content acts as the seed/CMS source of truth.
   ============================================================ */
(function () {
  "use strict";

  const DIFFICULTY = ["Beginner", "Intermediate", "Advanced", "Expert", "Master"];

  // ---- Raw phase definitions (modules + topic lists from the master plan) ----
  const RAW = [
    {
      code: "0", title: "Foundational Thinking & Learning Systems", color: "#3b82f6",
      theme: "how to learn, think, and reason",
      blurb: "Before money, master the machine that acquires all knowledge: how you learn, read, take notes, think, and communicate.",
      modules: [
        { name: "Learning Science", topics: ["Meta Learning", "Deliberate Practice", "Retrieval Practice", "Spaced Repetition", "Interleaving", "Skill Acquisition", "Self-Directed Learning"] },
        { name: "Reading Systems", topics: ["Active Reading", "SQ3R", "Analytical Reading", "Comparative Reading", "Research Reading"] },
        { name: "Note Taking Systems", topics: ["Cornell Method", "Zettelkasten", "Second Brain", "Progressive Summarization", "Knowledge Maps"] },
        { name: "Thinking Systems", topics: ["Critical Thinking", "Systems Thinking", "First Principles Thinking", "Second Order Thinking", "Decision Making", "Problem Solving", "Scientific Method", "Research Methodology"] },
        { name: "Communication", topics: ["Writing", "Teaching", "Storytelling", "Negotiation", "Persuasion"] }
      ],
      projects: ["Personal Knowledge Management System", "Build a Second Brain", "Decision Journal"]
    },
    {
      code: "0.5", title: "Mathematics & Decision Science", color: "#3b82f6",
      theme: "the quantitative language of money",
      blurb: "The numeracy that underpins every financial decision — from compound interest to probability and simulation.",
      modules: [
        { name: "Foundations", topics: ["Arithmetic", "Percentages", "Ratios", "Algebra", "Functions", "Exponents", "Logarithms", "Sequences"] },
        { name: "Financial Mathematics", topics: ["Time Value of Money", "Compound Interest", "Discounting", "Present Value", "Future Value", "Annuities", "Amortization"] },
        { name: "Probability", topics: ["Conditional Probability", "Bayes Theorem", "Expected Value", "Probability Distributions", "Law of Large Numbers"] },
        { name: "Statistics", topics: ["Descriptive Statistics", "Inferential Statistics", "Hypothesis Testing", "Regression", "Correlation", "Covariance", "Time Series"] },
        { name: "Decision Science", topics: ["Utility Theory", "Bayesian Updating", "Sensitivity Analysis", "Scenario Planning", "Monte Carlo Simulation", "Optimization", "Kelly Criterion", "Game Theory"] }
      ],
      projects: ["Compound Interest Calculator", "SIP Calculator", "EMI Calculator", "Retirement Calculator", "Probability Journal", "Monte Carlo Simulator"]
    },
    {
      code: "1", title: "Wealth Operating System", color: "#3b82f6",
      theme: "what money and wealth fundamentally are",
      blurb: "The first principles of money, economic logic, and the durable laws of wealth.",
      modules: [
        { name: "Nature of Money", topics: ["History of Money", "Barter", "Commodity Money", "Gold Standard", "Fiat Currency", "Digital Money", "CBDCs", "Cryptocurrencies"] },
        { name: "Economic Principles", topics: ["Scarcity", "Opportunity Cost", "Productivity", "Incentives", "Purchasing Power", "Inflation", "Deflation"] },
        { name: "Wealth Principles", topics: ["Assets vs Liabilities", "Income vs Wealth", "Compounding", "Leverage", "Optionality", "Network Effects", "Risk", "Uncertainty", "Convexity", "Antifragility"] }
      ],
      projects: ["Expense Tracker", "Net Worth Dashboard", "Cash Flow Dashboard", "Inflation Tracker", "Personal Balance Sheet"]
    },
    {
      code: "2", title: "Psychology of Money", color: "#a855f7",
      theme: "the human mind's relationship with money",
      blurb: "Behaviour, not spreadsheets, decides most financial outcomes. Master your own wiring.",
      modules: [
        { name: "Money Mindset", topics: ["Scarcity Mindset", "Abundance Mindset", "Delayed Gratification", "Lifestyle Inflation", "Financial Identity", "Consumer Psychology"] },
        { name: "Behavioral Finance", topics: ["Behavioral Finance", "Loss Aversion", "Mental Accounting", "Anchoring", "Confirmation Bias", "Overconfidence", "Hindsight Bias", "Sunk Cost Fallacy"] }
      ],
      projects: ["Bias Journal", "Decision Journal", "Habit Tracker"]
    },
    {
      code: "3", title: "Personal Finance", color: "#22c55e",
      theme: "running your own financial life like a business",
      blurb: "Cash flow, protection, taxes and income systems that build the base of independence.",
      modules: [
        { name: "Cash Flow & Planning", topics: ["Cash Flow Management", "Budgeting", "Emergency Funds", "Debt Management", "Insurance", "Taxes", "Retirement Planning", "Estate Planning"] },
        { name: "Income Systems", topics: ["Employment", "Freelancing", "Consulting", "Business Ownership", "Digital Products", "Licensing", "Equity Compensation", "FIRE"] }
      ],
      projects: ["Personal Finance Dashboard", "Emergency Fund Tracker", "Retirement Calculator", "Financial Independence Plan"]
    },
    {
      code: "4", title: "Accounting", color: "#3b82f6",
      theme: "the language of business",
      blurb: "Read, build and interrogate financial statements — the foundation of analysis and investing.",
      modules: [
        { name: "Financial Accounting", topics: ["Double Entry System", "Journal Entries", "Ledgers", "Trial Balance", "Financial Statements"] },
        { name: "Cost & Management Accounting", topics: ["Cost Accounting", "Managerial Accounting", "Corporate Accounting"] },
        { name: "Taxation & Assurance", topics: ["Taxation", "Auditing", "Internal Controls"] },
        { name: "Financial Analysis", topics: ["Ratio Analysis", "Working Capital", "Capital Budgeting"] }
      ],
      projects: ["Build Financial Statements", "Ratio Dashboard", "Company Analysis Report"]
    },
    {
      code: "5", title: "Economics", color: "#3b82f6",
      theme: "how economies and markets behave",
      blurb: "Micro to macro, money and policy, and the indicators that move every market.",
      modules: [
        { name: "Core Economics", topics: ["Microeconomics", "Macroeconomics", "Monetary Economics", "Fiscal Economics", "International Economics", "Behavioral Economics", "Development Economics", "Energy Economics", "Commodity Economics", "Geopolitics"] },
        { name: "Economic Indicators", topics: ["GDP", "Inflation Indicators", "Repo Rate", "PMI", "Yield Curve", "Unemployment", "Consumer Confidence", "Money Supply"] }
      ],
      projects: ["Macroeconomic Dashboard", "India Economic Tracker", "Economic Analysis Report"]
    },
    {
      code: "6", title: "History of Money & Civilizations", color: "#a855f7",
      theme: "patterns of booms, busts and reinvention",
      blurb: "History rhymes. Study crises and revolutions to recognise them in your lifetime.",
      modules: [
        { name: "Revolutions", topics: ["Ancient Economies", "Industrial Revolution", "Internet Revolution", "AI Revolution"] },
        { name: "Crises & Turning Points", topics: ["Great Depression", "Bretton Woods", "Nixon Shock", "Asian Financial Crisis", "Global Financial Crisis", "COVID Crisis", "India 1991 Reforms"] }
      ],
      projects: ["Interactive Timeline", "Economic Crisis Database"]
    },
    {
      code: "7", title: "Business & Entrepreneurship", color: "#f97316",
      theme: "building cash-generating engines",
      blurb: "From idea to durable moat — how value is created, priced, sold and scaled.",
      modules: [
        { name: "Build", topics: ["Idea Generation", "Customer Research", "Product Management", "Pricing"] },
        { name: "Grow", topics: ["Sales", "Marketing", "Operations", "Supply Chains"] },
        { name: "Lead & Scale", topics: ["Leadership", "Strategy", "Moats", "Scaling", "Turnarounds", "Acquisitions"] }
      ],
      projects: ["Business Plan", "MVP Development", "Unit Economics Dashboard", "Launch a Small Online Business"]
    },
    {
      code: "8", title: "Corporate Finance & Investment Banking", color: "#3b82f6",
      theme: "valuing and financing companies",
      blurb: "How firms raise capital, invest it, and how dealmakers value and restructure them.",
      modules: [
        { name: "Capital Decisions", topics: ["Time Value of Money (Corporate)", "Capital Budgeting", "Capital Structure", "Cost of Capital"] },
        { name: "Valuation", topics: ["DCF", "Comparable Companies", "Financial Modeling", "Project Finance", "Treasury Management"] },
        { name: "Deals", topics: ["Mergers & Acquisitions", "LBOs", "Corporate Restructuring"] }
      ],
      projects: ["DCF Model", "Company Valuation Model", "M&A Case Study"]
    },
    {
      code: "9", title: "Banking & Financial Systems", color: "#3b82f6",
      theme: "the plumbing of money",
      blurb: "Central banks, credit creation, payments and the regulation that keeps it standing.",
      modules: [
        { name: "Institutions", topics: ["Central Banking", "Commercial Banking", "Credit Systems", "Payment Systems", "Treasury Operations"] },
        { name: "Risk & Regulation", topics: ["Credit Analysis", "Risk Management", "Basel Regulations", "Shadow Banking", "FinTech Systems"] }
      ],
      projects: ["Banking System Map", "Credit Risk Model"]
    },
    {
      code: "10", title: "Financial Markets", color: "#3b82f6",
      theme: "where capital is priced and traded",
      blurb: "Asset classes, market structure, liquidity and the rules of the exchange.",
      modules: [
        { name: "Asset Classes", topics: ["Equities", "Bonds", "Money Markets", "Commodities", "Derivatives", "Forex", "Cryptocurrencies"] },
        { name: "Market Structure", topics: ["Market Structure", "Liquidity", "Exchanges", "Regulation", "Market Microstructure"] }
      ],
      projects: ["Market Dashboard", "Asset Tracker"]
    },
    {
      code: "11", title: "Investing & Portfolio Management", color: "#22c55e",
      theme: "compounding capital intelligently",
      blurb: "Styles, analysis, portfolio construction and risk — the core craft of the investor.",
      modules: [
        { name: "Investing Styles", topics: ["Value Investing", "Growth Investing", "Quality Investing", "Factor Investing"] },
        { name: "Portfolio Management", topics: ["Portfolio Construction", "Asset Allocation", "Diversification", "Risk Management", "Rebalancing"] },
        { name: "Analysis & Beyond", topics: ["Security Analysis", "Business Analysis", "Valuation", "Alternative Investments", "Family Office Principles"] }
      ],
      projects: ["Paper Portfolio", "Investment Memo", "Portfolio Dashboard"]
    },
    {
      code: "12", title: "Real Estate & Physical Assets", color: "#22c55e",
      theme: "owning tangible, cash-yielding assets",
      blurb: "Property analysis, cycles and the role of gold and collectibles in a portfolio.",
      modules: [
        { name: "Real Estate", topics: ["Residential", "Commercial", "Industrial", "REITs", "Mortgages", "Rental Analysis", "Cap Rates", "Real Estate Cycles"] },
        { name: "Physical Assets", topics: ["Gold", "Silver", "Art", "Collectibles"] }
      ],
      projects: ["Property Analysis Model", "Rental Yield Calculator"]
    },
    {
      code: "13", title: "Private Markets", color: "#a855f7",
      theme: "investing before the public can",
      blurb: "Venture, private equity and acquisition entrepreneurship — illiquid, high-conviction capital.",
      modules: [
        { name: "Venture & Angel", topics: ["Venture Capital", "Startup Investing", "Angel Investing"] },
        { name: "Buyouts & Search", topics: ["Private Equity", "Due Diligence", "LBO", "Search Funds", "Acquisition Entrepreneurship"] }
      ],
      projects: ["Startup Analysis", "PE Investment Memo"]
    },
    {
      code: "14", title: "Trading & Quantitative Finance", color: "#f97316",
      theme: "systematic, probabilistic edge",
      blurb: "Trading psychology, technicals, and the quant pipeline from data to backtest to risk.",
      modules: [
        { name: "Discretionary Trading", topics: ["Trading Psychology", "Market Structure (Trading)", "Technical Analysis"] },
        { name: "Quantitative Finance", topics: ["Statistical Arbitrage", "Algorithmic Trading", "Factor Models", "Portfolio Optimization", "Risk Modeling", "Backtesting", "Machine Learning (Markets)", "Alternative Data"] }
      ],
      projects: ["Trading Journal", "Backtesting Engine", "Portfolio Optimizer"]
    },
    {
      code: "15", title: "International Trade & Global Finance", color: "#3b82f6",
      theme: "the global flow of goods and capital",
      blurb: "Trade finance, reserve currencies, balance of payments and geopolitics.",
      modules: [
        { name: "Global Trade", topics: ["Globalization", "Trade Finance", "Shipping", "Supply Chains", "Foreign Investments"] },
        { name: "Global Monetary System", topics: ["Reserve Currencies", "Balance of Payments", "Trade Agreements", "Geopolitics (Finance)"] }
      ],
      projects: ["Global Trade Dashboard"]
    },
    {
      code: "16", title: "Technology & AI in Finance", color: "#a855f7",
      theme: "automating analysis and decision support",
      blurb: "The technical toolkit — Python, data, ML and LLMs — to build your own financial systems.",
      modules: [
        { name: "Data & Tooling", topics: ["Python", "SQL", "Pandas", "NumPy", "Databases", "APIs", "Web Scraping", "Visualization"] },
        { name: "AI & Automation", topics: ["Machine Learning", "NLP", "LLMs", "AI Agents", "RAG", "Financial Automation"] }
      ],
      projects: ["Portfolio Dashboard (Code)", "Financial Research Assistant", "Valuation Assistant", "Economic Dashboard (Code)"]
    },
    {
      code: "17", title: "Capital Allocation & Wealth Creation", color: "#fbbf24",
      theme: "allocating every form of capital you control",
      blurb: "The summit: deploying human, financial, social and time capital for asymmetric, durable wealth.",
      modules: [
        { name: "Forms of Capital", topics: ["Human Capital", "Financial Capital", "Social Capital", "Knowledge Capital", "Attention Capital", "Time Capital"] },
        { name: "Allocation Strategy", topics: ["Optionality (Allocation)", "Asymmetric Opportunities", "Capital Recycling", "Intergenerational Wealth"] },
        { name: "Wealth Structures", topics: ["Family Offices", "Trusts", "Estate Planning (Advanced)"] }
      ],
      projects: ["₹1 Crore Allocation Simulation", "Family Office Investment Policy Statement", "Multi-Generational Wealth Plan"]
    },
    {
      code: "18", title: "Law, Governance & Regulation", color: "#ef4444",
      theme: "the rules that protect and constrain capital",
      blurb: "Contracts, company and securities law, governance and ethics.",
      modules: [
        { name: "Business Law", topics: ["Business Law", "Contracts", "Company Law", "Securities Law", "IP Law"] },
        { name: "Governance & Ethics", topics: ["Governance", "Compliance", "Ethics", "Trust Structures"] }
      ],
      projects: ["Legal Structure Comparison Dashboard"]
    },
    {
      code: "19", title: "Complexity & Mental Models", color: "#a855f7",
      theme: "the multidisciplinary lattice of models",
      blurb: "The big ideas from many disciplines that explain how complex systems and markets behave.",
      modules: [
        { name: "Systems & Dynamics", topics: ["Feedback Loops", "Emergence", "Power Laws", "Network Effects (Models)", "Compounding (Models)", "Leverage (Models)", "Reflexivity", "Flywheels"] },
        { name: "Decision Models", topics: ["Circle of Competence", "Black Swan Theory", "Barbell Strategy", "Pareto Principle", "Principal-Agent Problem", "Lindy Effect"] }
      ],
      projects: ["Mental Model Library", "Decision Framework Database"]
    },
    {
      code: "20", title: "Execution Systems & Personal Operating System", color: "#f97316",
      theme: "turning knowledge into compounding action",
      blurb: "The personal OS — goals, habits, deep work and reviews — that makes the other 20 phases pay off.",
      modules: [
        { name: "Personal Systems", topics: ["Goals", "Habits", "Deep Work", "Energy Management", "Project Management"] },
        { name: "Review & Capital", topics: ["Annual Reviews", "Feedback Systems", "Accountability Systems", "Career Capital", "Network Capital", "Skill Stacking"] }
      ],
      projects: ["Life Dashboard", "Annual Review System", "Personal Operating System"]
    }
  ];

  // ---- Curated deep content for selected high-value nodes (by slug) ----
  const CURATED = {
    "compound-interest": {
      description: "Compound interest is the process by which the returns on an investment themselves earn returns, producing exponential rather than linear growth over time.",
      whyItMatters: "Einstein allegedly called it the eighth wonder of the world. Understanding compounding reframes every saving, spending and investing decision around time and rate.",
      outcomes: ["Derive the future-value formula FV = PV(1+r)^n", "Quantify the cost of starting late vs. early", "Explain the Rule of 72", "Model monthly vs. annual compounding"]
    },
    "time-value-of-money": {
      description: "The principle that a rupee today is worth more than a rupee tomorrow because of its earning potential.",
      whyItMatters: "Time value of money is the spine of all of finance — valuation, lending, retirement and capital budgeting all rest on it.",
      outcomes: ["Move cash flows across time with PV/FV", "Choose between lump sums and streams", "Build a discounting intuition you carry into DCF later"]
    },
    "assets-vs-liabilities": {
      description: "An asset puts money in your pocket; a liability takes money out. Wealth is built by accumulating income-producing assets.",
      whyItMatters: "This single distinction, popularised by Robert Kiyosaki, is the mental model behind every balance sheet you will ever read or build.",
      outcomes: ["Classify your own possessions as assets or liabilities", "Build a personal balance sheet", "Reframe purchases through a cash-flow lens"]
    },
    "dcf": {
      description: "Discounted Cash Flow values an asset as the present value of the cash it will generate over its life.",
      whyItMatters: "DCF is the purest expression of intrinsic value and the backbone of professional valuation and investment banking.",
      outcomes: ["Project free cash flows", "Estimate a discount rate (WACC)", "Compute terminal value", "Run sensitivity tables on key drivers"]
    },
    "value-investing": {
      description: "Buying assets for materially less than their intrinsic worth and holding until the gap closes — Graham and Buffett's discipline.",
      whyItMatters: "Value investing operationalises temperament and margin of safety, the traits most correlated with long-run investing success.",
      outcomes: ["Estimate intrinsic value", "Demand a margin of safety", "Separate price from value", "Build a watchlist and patience"]
    },
    "first-principles-thinking": {
      description: "Reasoning from fundamental truths rather than analogy or convention, rebuilding understanding from the ground up.",
      whyItMatters: "It is the engine of innovation and contrarian, correct bets — used by scientists, founders and the best allocators.",
      outcomes: ["Decompose a problem to its base facts", "Reconstruct solutions from scratch", "Spot inherited assumptions"]
    }
  };

  // ---- Helpers ----
  function slugify(s) {
    return s.toLowerCase().replace(/&/g, "and").replace(/[()]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function searchUrl(q) { return "https://www.google.com/search?q=" + encodeURIComponent(q); }
  function ytUrl(q) { return "https://www.youtube.com/results?search_query=" + encodeURIComponent(q); }

  function difficultyForPhase(phaseIndex, moduleIndex) {
    // phaseIndex 0..20 -> base climbs gradually; modules within phase nudge it up.
    let base = Math.min(4, Math.floor(phaseIndex / 4.5));
    base += moduleIndex >= 2 ? 1 : 0;
    return Math.max(1, Math.min(5, base + 1));
  }

  function genOutcomes(title, theme) {
    return [
      `Explain ${title} clearly to a beginner.`,
      `Apply ${title} to a concrete, real-world money decision.`,
      `Connect ${title} to the broader theme of ${theme}.`,
      `Identify common mistakes and misconceptions around ${title}.`
    ];
  }
  function genReflection(title) {
    return [
      `Where have you already encountered ${title} in your own life or work?`,
      `What is the single most important idea within ${title}, and why?`,
      `How would you explain ${title} to a 12-year-old?`,
      `What decision will you make differently now that you understand ${title}?`
    ];
  }
  function genRealLife(title, theme) {
    return [
      `Use ${title} the next time you face a decision involving ${theme}.`,
      `Audit a past decision through the lens of ${title}.`,
      `Teach ${title} to one other person this week to cement it.`
    ];
  }
  function genExercises(title) {
    return [
      `Write a one-page summary of ${title} in your own words.`,
      `Find two real examples of ${title} in the news or markets.`,
      `Create a flashcard set capturing the core ideas of ${title}.`
    ];
  }
  function genAssignments(title) {
    return [
      { title: `${title}: Applied Worksheet`, detail: `Complete a structured worksheet applying ${title} to your personal finances.` },
      { title: `${title}: Teach-Back`, detail: `Record a 3-minute explanation of ${title} as if teaching a class.` }
    ];
  }
  function genAssessment(title) {
    return [
      {
        q: `Which statement best captures the core idea of ${title}?`,
        options: [`It is mainly about ${title.toLowerCase()} and its practical use in decisions.`, "It is an obscure rule with no real application.", "It only applies to large institutions.", "It was disproven and is no longer used."],
        answer: 0
      },
      {
        q: `What is the best way to truly master ${title}?`,
        options: ["Memorise the definition only.", "Read about it once and move on.", "Learn it, apply it to a real situation, then teach it.", "Avoid using it until you are an expert."],
        answer: 2
      }
    ];
  }
  function genMastery(title) {
    return [
      `Beginner — Can define ${title} and recognise it.`,
      `Intermediate — Can apply ${title} to guided problems.`,
      `Advanced — Can apply ${title} to novel, messy situations independently.`,
      `Expert — Can critique, adapt and combine ${title} with other models.`,
      `Master — Can teach ${title} and use it fluently inside a capital-allocation framework.`
    ];
  }
  function genResources(title, theme) {
    return {
      books: [{ title: `Recommended reading on ${title}`, source: "Curated booklist", type: "Book", url: searchUrl("best books " + title) }],
      courses: [{ title: `Online course: ${title}`, source: "MOOC search", type: "Course", url: searchUrl(title + " online course free") }],
      videos: [{ title: `${title} explained (video)`, source: "YouTube", type: "Video", url: ytUrl(title + " explained") }],
      articles: [{ title: `Deep-dive article on ${title}`, source: "Web", type: "Article", url: searchUrl(title + " guide article") }],
      podcasts: [{ title: `Podcast episodes on ${theme}`, source: "Podcasts", type: "Podcast", url: searchUrl(title + " podcast") }],
      papers: [{ title: `Research on ${title}`, source: "Scholar", type: "Paper", url: "https://scholar.google.com/scholar?q=" + encodeURIComponent(title) }]
    };
  }

  // ---- Build full phases ----
  const PHASES = [];
  let nodeCounter = 0;

  RAW.forEach((rp, pIdx) => {
    const phase = {
      id: "p" + rp.code.replace(".", "_"),
      code: rp.code,
      title: rp.title,
      subtitle: rp.theme,
      blurb: rp.blurb,
      color: rp.color,
      index: pIdx,
      modules: [],
      projects: rp.projects.slice()
    };

    rp.modules.forEach((rm, mIdx) => {
      const module = {
        id: phase.id + "-m" + mIdx,
        name: rm.name,
        phaseId: phase.id,
        nodes: []
      };
      const diff = difficultyForPhase(pIdx, mIdx);

      rm.topics.forEach((topic, tIdx) => {
        nodeCounter++;
        const baseSlug = slugify(topic);
        const slug = baseSlug;
        const hours = 2 + ((nodeCounter + tIdx) % 5); // 2-6 hrs
        const curated = CURATED[baseSlug] || {};
        const cleanTitle = topic.replace(/\s*\(.*?\)\s*/g, "").trim();

        const node = {
          id: "n" + nodeCounter,
          slug: slug,
          title: cleanTitle,
          phaseId: phase.id,
          phaseCode: phase.code,
          phaseTitle: phase.title,
          moduleId: module.id,
          moduleName: module.name,
          color: phase.color,
          description: curated.description || `${cleanTitle} is a core concept within ${module.name}. ${rp.blurb}`,
          purpose: `Develop working fluency in ${cleanTitle} so you can use it in real decisions about ${rp.theme}.`,
          whyItMatters: curated.whyItMatters || `Mastering ${cleanTitle} strengthens your grasp of ${rp.theme}, a building block on the path from beginner to capital allocator.`,
          outcomes: curated.outcomes || genOutcomes(cleanTitle, rp.theme),
          tags: Array.from(new Set([phase.title, module.name, ...cleanTitle.split(" ").filter(w => w.length > 3)])).slice(0, 6),
          hours: hours,
          difficulty: diff,
          difficultyLabel: DIFFICULTY[diff - 1],
          prerequisites: [],
          dependents: [],
          exercises: genExercises(cleanTitle),
          projects: tIdx === rm.topics.length - 1 ? phase.projects.slice(0, 2) : [],
          assignments: genAssignments(cleanTitle),
          assessment: genAssessment(cleanTitle),
          reflection: genReflection(cleanTitle),
          realLife: genRealLife(cleanTitle, rp.theme),
          careers: [],
          resources: genResources(cleanTitle, rp.theme),
          mastery: genMastery(cleanTitle),
          version: [{ v: "1.0", date: "2026-01-01", note: "Initial curriculum entry." }]
        };
        module.nodes.push(node);
      });

      phase.modules.push(module);
    });

    PHASES.push(phase);
  });

  // ---- Flat node index + dependency wiring ----
  const NODES = [];
  PHASES.forEach(p => p.modules.forEach(m => m.nodes.forEach(n => NODES.push(n))));
  const NODE_BY_ID = {};
  const NODE_BY_SLUG = {};
  NODES.forEach(n => { NODE_BY_ID[n.id] = n; NODE_BY_SLUG[n.slug] = n; });

  // Linear prerequisites: within module n->n-1; across modules first->prev module last; across phases first->prev phase last node.
  let prevNodeGlobal = null;
  PHASES.forEach(p => {
    p.modules.forEach(m => {
      m.nodes.forEach((n, i) => {
        if (i > 0) n.prerequisites = [m.nodes[i - 1].id];
        else if (prevNodeGlobal) n.prerequisites = [prevNodeGlobal.id];
        prevNodeGlobal = n;
      });
    });
  });
  // Dependents (reverse edges)
  NODES.forEach(n => n.prerequisites.forEach(pid => {
    if (NODE_BY_ID[pid]) NODE_BY_ID[pid].dependents.push(n.id);
  }));

  // Career relevance tagging by phase
  const PHASE_CAREERS = {
    "0": ["All paths"], "0.5": ["Quant", "Investor", "CFA"], "1": ["All paths"],
    "2": ["Investor", "Trader"], "3": ["All paths"], "4": ["CA", "Investment Banker", "CFA"],
    "5": ["Economist", "Portfolio Manager"], "6": ["Investor", "Economist"], "7": ["Entrepreneur", "FinTech Founder"],
    "8": ["Investment Banker", "PE", "CFA"], "9": ["Investment Banker", "FinTech Founder"], "10": ["Trader", "Portfolio Manager"],
    "11": ["Investor", "Portfolio Manager", "CFA"], "12": ["Investor"], "13": ["VC", "PE", "Entrepreneur"],
    "14": ["Quant", "Trader"], "15": ["Economist", "Investment Banker"], "16": ["Quant", "FinTech Founder"],
    "17": ["Investor", "PE", "Entrepreneur"], "18": ["CA", "Investment Banker"], "19": ["All paths"], "20": ["All paths"]
  };
  NODES.forEach(n => { n.careers = PHASE_CAREERS[n.phaseCode] || ["All paths"]; });

  // ---- Public API ----
  const totalHours = NODES.reduce((s, n) => s + n.hours, 0);

  window.WM = window.WM || {};
  window.WM.DIFFICULTY = DIFFICULTY;
  window.WM.PHASES = PHASES;
  window.WM.NODES = NODES;
  window.WM.NODE_BY_ID = NODE_BY_ID;
  window.WM.NODE_BY_SLUG = NODE_BY_SLUG;
  window.WM.curriculum = {
    phaseCount: PHASES.length,
    moduleCount: PHASES.reduce((s, p) => s + p.modules.length, 0),
    nodeCount: NODES.length,
    totalHours: totalHours,
    getPhase: function (id) { return PHASES.find(p => p.id === id); },
    getModule: function (id) {
      for (const p of PHASES) { const m = p.modules.find(m => m.id === id); if (m) return m; }
      return null;
    },
    firstNode: NODES[0]
  };
})();
