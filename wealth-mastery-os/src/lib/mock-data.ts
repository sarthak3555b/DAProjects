import type {
  Achievement,
  ActivityItem,
  AppNotification,
  Assessment,
  ConceptNode,
  Goal,
  JournalEntry,
  NewsArticle,
  Project,
  Resource,
  RoadmapEdge,
  RoadmapNode,
  UserProfile,
} from "./types";

export const currentUser: UserProfile = {
  id: "u_1",
  name: "Alex Morgan",
  email: "alex@wealthmastery.os",
  avatarUrl: undefined,
  bio: "Compounding knowledge into capital. On a mission to master the machinery of wealth.",
  currentPhase: "Capital Markets & Valuation",
  completionPercentage: 42,
  level: 12,
  xp: 8420,
  xpToNext: 10000,
  streak: 27,
};

/* ------------------------------------------------------------------ */
/* Roadmap                                                             */
/* ------------------------------------------------------------------ */

export const roadmapPhases = [
  "Foundations of Money",
  "Personal Finance Mastery",
  "Economics & Markets",
  "Capital Markets & Valuation",
  "Business & Entrepreneurship",
  "Advanced Capital Allocation",
] as const;

export const roadmapNodes: RoadmapNode[] = [
  {
    id: "n1", title: "What Money Really Is", phase: "Foundations of Money",
    description: "The history, function, and psychology of money — from barter to fiat to digital currency.",
    status: "COMPLETED", type: "CORE", difficulty: "BEGINNER", estimatedHours: 6, completion: 100,
    dependencies: [], outcomes: ["Explain the three functions of money", "Trace monetary evolution", "Understand fiat vs commodity money"],
    resources: ["r1", "r2"], projects: ["p1"], realWorld: ["Evaluate currency debasement", "Read a central bank statement"],
    col: 0, row: 0,
  },
  {
    id: "n2", title: "Inflation & Purchasing Power", phase: "Foundations of Money",
    description: "How inflation erodes value and why it is the silent tax on savers.",
    status: "COMPLETED", type: "CORE", difficulty: "BEGINNER", estimatedHours: 5, completion: 100,
    dependencies: ["n1"], outcomes: ["Compute real vs nominal returns", "Interpret CPI", "Hedge against inflation"],
    resources: ["r2"], projects: [], realWorld: ["Build an inflation-adjusted budget"], col: 0, row: 1,
  },
  {
    id: "n3", title: "Budgeting & Cash Flow", phase: "Personal Finance Mastery",
    description: "Engineer a personal cash-flow statement and a surplus that compounds.",
    status: "COMPLETED", type: "CORE", difficulty: "BEGINNER", estimatedHours: 7, completion: 100,
    dependencies: ["n2"], outcomes: ["Build a zero-based budget", "Track net cash flow", "Automate savings"],
    resources: ["r3"], projects: ["p2"], realWorld: ["Create a 12-month cash-flow model"], col: 1, row: 0,
  },
  {
    id: "n4", title: "Debt & Leverage", phase: "Personal Finance Mastery",
    description: "When debt destroys and when it multiplies — the two faces of leverage.",
    status: "IN_PROGRESS", type: "CORE", difficulty: "INTERMEDIATE", estimatedHours: 8, completion: 55,
    dependencies: ["n3"], outcomes: ["Distinguish good vs bad debt", "Model amortization", "Use leverage responsibly"],
    resources: ["r3", "r4"], projects: [], realWorld: ["Analyze a mortgage amortization schedule"], col: 1, row: 1,
  },
  {
    id: "n5", title: "Supply, Demand & Price", phase: "Economics & Markets",
    description: "The fundamental forces that set every price in every market.",
    status: "IN_PROGRESS", type: "CORE", difficulty: "INTERMEDIATE", estimatedHours: 9, completion: 30,
    dependencies: ["n4"], outcomes: ["Draw supply/demand curves", "Explain elasticity", "Predict price shocks"],
    resources: ["r5"], projects: ["p3"], realWorld: ["Map a commodity supply shock"], col: 2, row: 0,
  },
  {
    id: "n6", title: "Macroeconomics & Cycles", phase: "Economics & Markets",
    description: "GDP, interest rates, and the credit cycle that drives boom and bust.",
    status: "AVAILABLE", type: "CORE", difficulty: "ADVANCED", estimatedHours: 12, completion: 0,
    dependencies: ["n5"], outcomes: ["Read the yield curve", "Understand monetary policy", "Position for the cycle"],
    resources: ["r5", "r6"], projects: [], realWorld: ["Track the Fed's dual mandate"], col: 2, row: 1,
  },
  {
    id: "n7", title: "Equity Valuation", phase: "Capital Markets & Valuation",
    description: "Discounted cash flow, multiples, and the art of valuing a business.",
    status: "AVAILABLE", type: "CORE", difficulty: "ADVANCED", estimatedHours: 14, completion: 0,
    dependencies: ["n6"], outcomes: ["Build a DCF model", "Apply comparable multiples", "Estimate intrinsic value"],
    resources: ["r6", "r7"], projects: ["p4"], realWorld: ["Value a public company end-to-end"], col: 3, row: 0,
  },
  {
    id: "n8", title: "Portfolio Construction", phase: "Capital Markets & Valuation",
    description: "Diversification, risk parity, and building an all-weather portfolio.",
    status: "AVAILABLE", type: "CORE", difficulty: "ADVANCED", estimatedHours: 11, completion: 0,
    dependencies: ["n7"], outcomes: ["Optimize risk-adjusted returns", "Rebalance systematically", "Size positions"],
    resources: ["r7"], projects: [], realWorld: ["Construct a model portfolio"], col: 3, row: 1,
  },
  {
    id: "n9", title: "Building a Business", phase: "Business & Entrepreneurship",
    description: "Unit economics, moats, and turning an idea into a cash-generating machine.",
    status: "LOCKED", type: "CORE", difficulty: "EXPERT", estimatedHours: 16, completion: 0,
    dependencies: ["n7"], outcomes: ["Model unit economics", "Identify durable moats", "Design a business model"],
    resources: ["r8"], projects: ["p5"], realWorld: ["Draft a one-page business model"], col: 4, row: 0,
  },
  {
    id: "n10", title: "Capital Allocation", phase: "Advanced Capital Allocation",
    description: "Think like a CEO and a capital allocator — where every dollar earns its highest return.",
    status: "LOCKED", type: "CORE", difficulty: "EXPERT", estimatedHours: 18, completion: 0,
    dependencies: ["n8", "n9"], outcomes: ["Rank reinvestment options", "Master the ROIC framework", "Allocate like Buffett"],
    resources: ["r8"], projects: [], realWorld: ["Allocate a hypothetical $10M"], col: 5, row: 0,
  },
];

export const roadmapEdges: RoadmapEdge[] = roadmapNodes.flatMap((n) =>
  n.dependencies.map((dep) => ({ id: `${dep}-${n.id}`, source: dep, target: n.id })),
);

/* ------------------------------------------------------------------ */
/* Knowledge graph                                                     */
/* ------------------------------------------------------------------ */

export const conceptNodes: ConceptNode[] = [
  { id: "c1", label: "Inflation", domain: "Economics", definition: "A sustained rise in the general price level, reducing purchasing power.", mastery: 90, connections: ["c2", "c3"] },
  { id: "c2", label: "Interest Rates", domain: "Economics", definition: "The cost of money; the price paid to borrow capital over time.", mastery: 75, connections: ["c1", "c3", "c4"] },
  { id: "c3", label: "Bond Yields", domain: "Investing", definition: "The return an investor earns on a bond, inversely related to price.", mastery: 60, connections: ["c2", "c5"] },
  { id: "c4", label: "Monetary Policy", domain: "Economics", definition: "Central bank actions managing money supply and interest rates.", mastery: 55, connections: ["c2", "c6"] },
  { id: "c5", label: "Discount Rate", domain: "Capital Allocation", definition: "The rate used to convert future cash flows to present value.", mastery: 48, connections: ["c3", "c7"] },
  { id: "c6", label: "Credit Cycle", domain: "Economics", definition: "The expansion and contraction of access to credit over time.", mastery: 40, connections: ["c4", "c8"] },
  { id: "c7", label: "DCF Valuation", domain: "Investing", definition: "Valuing an asset by the present value of its expected cash flows.", mastery: 35, connections: ["c5", "c9"] },
  { id: "c8", label: "Leverage", domain: "Capital Allocation", definition: "Using borrowed capital to amplify potential returns and risk.", mastery: 52, connections: ["c6", "c10"] },
  { id: "c9", label: "Free Cash Flow", domain: "Business", definition: "Cash a business generates after capital expenditures.", mastery: 44, connections: ["c7", "c10"] },
  { id: "c10", label: "Return on Capital", domain: "Capital Allocation", definition: "How efficiently a business converts capital into profit.", mastery: 30, connections: ["c8", "c9"] },
  { id: "c11", label: "Network Effects", domain: "Technology", definition: "A product becomes more valuable as more people use it.", mastery: 66, connections: ["c12"] },
  { id: "c12", label: "Economic Moats", domain: "Business", definition: "Structural advantages that protect long-term profitability.", mastery: 58, connections: ["c11", "c10"] },
];

/* ------------------------------------------------------------------ */
/* Current affairs                                                     */
/* ------------------------------------------------------------------ */

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;

export const newsArticles: NewsArticle[] = [
  {
    id: "a1", title: "Central Bank Signals Pause as Inflation Cools to 3-Year Low",
    source: "Global Macro Wire", imageUrl: img("photo-1611974789855-9c2a0a7236a3"),
    publishedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    category: "Economy", impact: "HIGH",
    summary: "Policymakers held rates steady and hinted that the tightening cycle may be over as price pressures ease.",
    aiSummary: {
      what: "The central bank held its benchmark rate and softened forward guidance.",
      why: "Headline inflation fell to a three-year low while labor markets stayed resilient.",
      matters: "Rate expectations anchor asset prices across every market.",
      wealthEffect: "A pause typically supports equities and lengthens duration appeal in bonds — favorable for diversified portfolios.",
    },
    isBookmarked: false,
  },
  {
    id: "a2", title: "AI Infrastructure Spending Crosses Record Threshold This Quarter",
    source: "Tech Capital", imageUrl: img("photo-1518770660439-4636190af475"),
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    category: "Technology", impact: "HIGH",
    summary: "Hyperscalers accelerated data-center capex, reshaping the semiconductor and energy supply chains.",
    aiSummary: {
      what: "Cloud giants raised capital-expenditure guidance for AI compute.",
      why: "Demand for model training and inference outpaced existing capacity.",
      matters: "Capex cycles redistribute profits across the value chain.",
      wealthEffect: "Picks-and-shovels exposure (chips, power, networking) often captures durable value in infrastructure build-outs.",
    },
    isBookmarked: true,
  },
  {
    id: "a3", title: "Energy Markets Steady After Supply Agreement Extension",
    source: "Commodity Desk", imageUrl: img("photo-1497435334941-8c899ee9e8e9"),
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    category: "Markets", impact: "MEDIUM",
    summary: "Producers extended output curbs, stabilizing prices within a tight trading band.",
    aiSummary: {
      what: "Major producers agreed to extend voluntary supply cuts.",
      why: "Coordinated action aims to balance softening global demand.",
      matters: "Energy prices feed directly into inflation and corporate margins.",
      wealthEffect: "Stable energy supports consumer spending power and reduces input-cost volatility for businesses.",
    },
    isBookmarked: false,
  },
  {
    id: "a4", title: "Emerging Market Currencies Rally on Capital Inflows",
    source: "FX International", imageUrl: img("photo-1526304640581-d334cdbbf45e"),
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    category: "International", impact: "MEDIUM",
    summary: "A weaker reserve currency drew investors back to higher-yielding emerging markets.",
    aiSummary: {
      what: "EM currencies appreciated as global capital rotated in.",
      why: "Relative yield advantage and improving growth outlooks attracted flows.",
      matters: "Currency moves change real returns for global investors.",
      wealthEffect: "Geographic diversification can enhance returns when capital rotates across regions.",
    },
    isBookmarked: false,
  },
  {
    id: "a5", title: "Startup Funding Rebounds as Late-Stage Deals Return",
    source: "Venture Brief", imageUrl: img("photo-1559526324-4b87b5e36e44"),
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    category: "Business", impact: "LOW",
    summary: "Private capital markets thawed with a wave of late-stage rounds across fintech and AI.",
    aiSummary: {
      what: "Venture funding rose for the second consecutive quarter.",
      why: "Lower rate expectations revived risk appetite among allocators.",
      matters: "Private market liquidity signals broader risk sentiment.",
      wealthEffect: "Reviving venture activity hints at renewed appetite for long-duration growth assets.",
    },
    isBookmarked: false,
  },
  {
    id: "a6", title: "Trade Corridor Realignment Reshapes Global Supply Chains",
    source: "Geopolitics Today", imageUrl: img("photo-1494412574643-ff11b0a5c1c3"),
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    category: "Geopolitics", impact: "HIGH",
    summary: "New regional trade pacts are redirecting manufacturing and logistics flows.",
    aiSummary: {
      what: "Several nations signed agreements rerouting key trade corridors.",
      why: "Resilience and near-shoring priorities are reshaping logistics.",
      matters: "Supply-chain geography determines cost structures and risk.",
      wealthEffect: "Re-shoring beneficiaries and logistics infrastructure may see multi-year tailwinds.",
    },
    isBookmarked: false,
  },
];

/* ------------------------------------------------------------------ */
/* Assessments                                                         */
/* ------------------------------------------------------------------ */

export const assessments: Assessment[] = [
  {
    id: "as1", title: "Foundations of Money", description: "Test your grasp of monetary fundamentals.",
    difficulty: "BEGINNER", totalQuestions: 3, timeLimitMinutes: 10, status: "PASSED", score: 92,
    questions: [
      { id: "q1", prompt: "Which is NOT a core function of money?", options: [
        { id: "o1", label: "Store of value" }, { id: "o2", label: "Unit of account" },
        { id: "o3", label: "Medium of exchange" }, { id: "o4", label: "Source of inflation" },
      ], correctOptionId: "o4", explanation: "The three functions are store of value, unit of account, and medium of exchange." },
      { id: "q2", prompt: "Inflation primarily reduces…", options: [
        { id: "o1", label: "Nominal wages" }, { id: "o2", label: "Purchasing power" },
        { id: "o3", label: "The money supply" }, { id: "o4", label: "Interest rates" },
      ], correctOptionId: "o2", explanation: "Inflation erodes the real value, i.e. purchasing power, of money." },
      { id: "q3", prompt: "Fiat currency derives value from…", options: [
        { id: "o1", label: "Gold backing" }, { id: "o2", label: "Government decree & trust" },
        { id: "o3", label: "Silver reserves" }, { id: "o4", label: "Oil reserves" },
      ], correctOptionId: "o2", explanation: "Fiat money is backed by trust in the issuing government, not a commodity." },
    ],
  },
  {
    id: "as2", title: "Markets & Valuation", description: "Equity valuation and market mechanics.",
    difficulty: "ADVANCED", totalQuestions: 3, timeLimitMinutes: 20, status: "NOT_STARTED",
    questions: [
      { id: "q1", prompt: "A DCF values a company based on…", options: [
        { id: "o1", label: "Book value" }, { id: "o2", label: "Present value of future cash flows" },
        { id: "o3", label: "Market cap" }, { id: "o4", label: "Dividend history" },
      ], correctOptionId: "o2", explanation: "DCF discounts expected future cash flows to present value." },
      { id: "q2", prompt: "When yields rise, bond prices…", options: [
        { id: "o1", label: "Rise" }, { id: "o2", label: "Fall" },
        { id: "o3", label: "Stay flat" }, { id: "o4", label: "Double" },
      ], correctOptionId: "o2", explanation: "Bond prices move inversely to yields." },
      { id: "q3", prompt: "A higher discount rate generally…", options: [
        { id: "o1", label: "Raises valuation" }, { id: "o2", label: "Lowers valuation" },
        { id: "o3", label: "Has no effect" }, { id: "o4", label: "Removes risk" },
      ], correctOptionId: "o2", explanation: "A higher discount rate reduces the present value of future cash flows." },
    ],
  },
  {
    id: "as3", title: "Economic Cycles", description: "Macro forces and the credit cycle.",
    difficulty: "INTERMEDIATE", totalQuestions: 0, timeLimitMinutes: 15, status: "FAILED", score: 48,
    questions: [],
  },
  {
    id: "as4", title: "Capital Allocation Mastery", description: "Allocate capital like a top-tier CEO.",
    difficulty: "EXPERT", totalQuestions: 0, timeLimitMinutes: 30, status: "NOT_STARTED", questions: [],
  },
];

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export const projects: Project[] = [
  { id: "p1", title: "Build a Personal Balance Sheet", description: "Create a living statement of assets, liabilities, and net worth.", status: "COMPLETED", difficulty: "BEGINNER", hours: 4, deliverables: ["Net-worth spreadsheet", "Monthly update ritual"], resources: ["r3"], tags: ["personal-finance"] },
  { id: "p2", title: "12-Month Cash-Flow Model", description: "Forecast income, expenses, and surplus across a year.", status: "COMPLETED", difficulty: "INTERMEDIATE", hours: 8, deliverables: ["Cash-flow model", "Scenario analysis"], resources: ["r3"], tags: ["modeling"] },
  { id: "p3", title: "Supply-Shock Case Study", description: "Analyze how a commodity supply shock propagates through prices.", status: "IN_PROGRESS", difficulty: "INTERMEDIATE", hours: 10, deliverables: ["Written analysis", "Price chart annotations"], resources: ["r5"], tags: ["economics"] },
  { id: "p4", title: "Full DCF Valuation", description: "Value a public company from revenue to intrinsic value.", status: "IN_PROGRESS", difficulty: "ADVANCED", hours: 16, deliverables: ["3-statement model", "DCF", "Sensitivity table"], resources: ["r6", "r7"], tags: ["valuation"] },
  { id: "p5", title: "One-Page Business Model", description: "Design unit economics and a moat for a new venture.", status: "PLANNED", difficulty: "EXPERT", hours: 12, deliverables: ["Business model canvas", "Unit-economics sheet"], resources: ["r8"], tags: ["entrepreneurship"] },
];

/* ------------------------------------------------------------------ */
/* Resources                                                           */
/* ------------------------------------------------------------------ */

export const resources: Resource[] = [
  { id: "r1", title: "The Ascent of Money", author: "Niall Ferguson", type: "Book", domain: "Money", durationLabel: "12h", rating: 4.6, progress: 100, bookmarked: true, description: "A sweeping financial history of the world." },
  { id: "r2", title: "Inflation Explained", author: "Macro Academy", type: "Course", domain: "Economics", durationLabel: "3h", rating: 4.4, progress: 100, bookmarked: false, description: "How inflation is measured, caused, and tamed." },
  { id: "r3", title: "The Psychology of Money", author: "Morgan Housel", type: "Book", domain: "Money", durationLabel: "6h", rating: 4.8, progress: 80, bookmarked: true, description: "Timeless lessons on wealth, greed, and happiness." },
  { id: "r4", title: "Good Debt vs Bad Debt", author: "Capital Notes", type: "Article", domain: "Capital Allocation", durationLabel: "20m", rating: 4.1, progress: 60, bookmarked: false, description: "A framework for evaluating leverage." },
  { id: "r5", title: "Principles of Economics", author: "N. G. Mankiw", type: "Book", domain: "Economics", durationLabel: "20h", rating: 4.5, progress: 35, bookmarked: false, description: "The canonical introduction to economic thinking." },
  { id: "r6", title: "Valuation Masterclass", author: "Aswath Damodaran", type: "Course", domain: "Investing", durationLabel: "30h", rating: 4.9, progress: 10, bookmarked: true, description: "The definitive course on valuing anything." },
  { id: "r7", title: "The Intelligent Investor", author: "Benjamin Graham", type: "Book", domain: "Investing", durationLabel: "15h", rating: 4.7, progress: 0, bookmarked: true, description: "The bible of value investing." },
  { id: "r8", title: "The Outsiders", author: "William Thorndike", type: "Book", domain: "Capital Allocation", durationLabel: "8h", rating: 4.8, progress: 0, bookmarked: false, description: "Eight unconventional CEOs and their radical playbook." },
  { id: "r9", title: "How Markets Move", author: "TradingView Talks", type: "Podcast", domain: "Investing", durationLabel: "1h", rating: 4.2, progress: 0, bookmarked: false, description: "Conversations on market microstructure." },
  { id: "r10", title: "Network Effects 101", author: "a16z", type: "Video", domain: "Technology", durationLabel: "45m", rating: 4.3, progress: 0, bookmarked: false, description: "Why some products compound in value." },
];

/* ------------------------------------------------------------------ */
/* Achievements                                                        */
/* ------------------------------------------------------------------ */

export const achievements: Achievement[] = [
  { id: "ac1", title: "First Steps", description: "Complete your first module.", tier: "Bronze", xp: 100, unlocked: true, unlockedAt: "2025-01-12", progress: 100 },
  { id: "ac2", title: "Streak Starter", description: "Maintain a 7-day streak.", tier: "Silver", xp: 250, unlocked: true, unlockedAt: "2025-02-03", progress: 100 },
  { id: "ac3", title: "Knowledge Seeker", description: "Read 10 resources.", tier: "Silver", xp: 300, unlocked: true, unlockedAt: "2025-03-19", progress: 100 },
  { id: "ac4", title: "Quiz Master", description: "Score 90%+ on 3 assessments.", tier: "Gold", xp: 500, unlocked: false, progress: 66 },
  { id: "ac5", title: "Builder", description: "Complete 5 projects.", tier: "Gold", xp: 600, unlocked: false, progress: 40 },
  { id: "ac6", title: "Capital Allocator", description: "Finish the Capital Allocation phase.", tier: "Platinum", xp: 1200, unlocked: false, progress: 12 },
  { id: "ac7", title: "Marathon Mind", description: "Reach a 100-day streak.", tier: "Diamond", xp: 2500, unlocked: false, progress: 27 },
  { id: "ac8", title: "Master of Wealth", description: "Reach 100% roadmap completion.", tier: "Legendary", xp: 10000, unlocked: false, progress: 42 },
];

/* ------------------------------------------------------------------ */
/* Activity, notifications, journal, goals                             */
/* ------------------------------------------------------------------ */

export const activityFeed: ActivityItem[] = [
  { id: "av1", kind: "completed", title: "Completed “Budgeting & Cash Flow”", detail: "Personal Finance Mastery", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: "av2", kind: "assessment", title: "Passed Foundations of Money", detail: "Score 92%", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: "av3", kind: "achievement", title: "Unlocked “Knowledge Seeker”", detail: "+300 XP", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
  { id: "av4", kind: "bookmark", title: "Bookmarked “The Intelligent Investor”", detail: "Resources", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString() },
  { id: "av5", kind: "started", title: "Started “Supply, Demand & Price”", detail: "Economics & Markets", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString() },
];

export const notifications: AppNotification[] = [
  { id: "nt1", title: "New achievement unlocked", body: "You earned “Knowledge Seeker” (+300 XP).", timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), read: false, type: "achievement" },
  { id: "nt2", title: "Streak reminder", body: "Keep your 27-day streak alive — study 15 minutes today.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: false, type: "warning" },
  { id: "nt3", title: "New module available", body: "“Macroeconomics & Cycles” is now unlocked.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), read: false, type: "info" },
  { id: "nt4", title: "Weekly digest ready", body: "You studied 6.5 hours this week — up 18%.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), read: true, type: "success" },
];

export const journalEntries: JournalEntry[] = [
  { id: "j1", title: "Why interest rates rule everything", date: "2025-06-22", preview: "Rates are the gravity of finance. The higher they go, the more they pull on every asset price...", tags: ["macro", "reflection"] },
  { id: "j2", title: "DCF intuition finally clicked", date: "2025-06-19", preview: "A business is worth the cash it returns to owners, discounted for time and risk. Everything else is detail...", tags: ["valuation"] },
  { id: "j3", title: "Leverage is a double-edged sword", date: "2025-06-15", preview: "It amplifies outcomes in both directions. The survivors respect the downside first...", tags: ["risk", "capital"] },
];

export const goals: Goal[] = [
  { id: "g1", label: "Study hours", period: "Weekly", current: 6.5, target: 8, unit: "h" },
  { id: "g2", label: "Modules completed", period: "Monthly", current: 3, target: 5, unit: "" },
  { id: "g3", label: "Roadmap completion", period: "Yearly", current: 42, target: 100, unit: "%" },
];

/* Contribution heatmap (last 18 weeks x 7 days), deterministic. */
export function contributionData(): number[][] {
  const weeks = 18;
  const out: number[][] = [];
  for (let w = 0; w < weeks; w++) {
    const row: number[] = [];
    for (let d = 0; d < 7; d++) {
      const seed = (w + 1) * 31 + (d + 1) * 7;
      const v = Math.floor((Math.sin(seed) * 0.5 + 0.5) * 5);
      row.push(v);
    }
    out.push(row);
  }
  return out;
}

/* Learning velocity (XP per week) */
export const learningVelocity = [
  { week: "W1", xp: 320, hours: 4 }, { week: "W2", xp: 540, hours: 6 },
  { week: "W3", xp: 420, hours: 5 }, { week: "W4", xp: 680, hours: 7 },
  { week: "W5", xp: 760, hours: 8 }, { week: "W6", xp: 610, hours: 6 },
  { week: "W7", xp: 880, hours: 9 }, { week: "W8", xp: 940, hours: 9 },
];

/* Knowledge radar */
export const knowledgeRadar = [
  { axis: "Money", value: 88 }, { axis: "Economics", value: 72 },
  { axis: "Business", value: 54 }, { axis: "Investing", value: 61 },
  { axis: "Technology", value: 47 }, { axis: "Capital", value: 38 },
];

/* Suggested mentor prompts */
export const mentorPrompts = [
  "Explain the credit cycle like I'm building a portfolio.",
  "What did I learn about valuation this week?",
  "Quiz me on monetary policy.",
  "How does inflation affect my capital allocation?",
];
