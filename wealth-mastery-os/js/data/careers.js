/* ============================================================
   Wealth Mastery OS — Career Explorer data
   ============================================================ */
(function () {
  "use strict";

  const CAREERS = [
    {
      id: "economist", name: "Economist", emoji: "📊", color: "#3b82f6",
      description: "Studies how economies allocate resources, advising governments, banks and firms using data and theory.",
      skills: ["Macroeconomics", "Statistics", "Econometrics", "Policy Analysis", "Data Visualization"],
      phases: ["0.5", "5", "15", "9"],
      projects: ["Macroeconomic Dashboard", "Economic Analysis Report"],
      salary: "₹8L – ₹60L+ / yr (varies by institution & geography)",
      aiImpact: "Augmented — AI accelerates data work but judgement on policy and causality remains human.",
      future: "Demand rising for economists fluent in data science, climate and AI-driven productivity analysis."
    },
    {
      id: "investment-banker", name: "Investment Banker", emoji: "🏦", color: "#3b82f6",
      description: "Advises companies on raising capital, M&A and restructuring; builds models and executes deals.",
      skills: ["Financial Modeling", "Valuation", "Accounting", "Negotiation", "Stamina"],
      phases: ["4", "8", "10", "18"],
      projects: ["DCF Model", "M&A Case Study", "Company Valuation Model"],
      salary: "₹12L – ₹1Cr+ / yr (analyst to MD)",
      aiImpact: "Augmented — modelling is increasingly automated; relationships and judgement dominate.",
      future: "Fewer juniors doing grunt work; premium on deal judgement and sector expertise."
    },
    {
      id: "ca", name: "Chartered Accountant (CA)", emoji: "🧾", color: "#22c55e",
      description: "Expert in accounting, audit, taxation and assurance — the trusted scorekeeper of business.",
      skills: ["Financial Accounting", "Taxation", "Auditing", "Internal Controls", "Compliance"],
      phases: ["4", "18", "3"],
      projects: ["Build Financial Statements", "Company Analysis Report"],
      salary: "₹7L – ₹40L+ / yr",
      aiImpact: "Augmented — routine bookkeeping automates; advisory and assurance judgement grows in value.",
      future: "Shift from compliance to strategic advisory, ESG and forensic work."
    },
    {
      id: "cfa", name: "CFA / Research Analyst", emoji: "📈", color: "#22c55e",
      description: "Analyses securities and builds investment theses across asset classes.",
      skills: ["Valuation", "Financial Analysis", "Portfolio Theory", "Ethics", "Writing"],
      phases: ["4", "8", "11", "10"],
      projects: ["Investment Memo", "Company Valuation Model", "Paper Portfolio"],
      salary: "₹8L – ₹70L+ / yr",
      aiImpact: "Augmented — screening and summarisation automate; differentiated insight stays scarce.",
      future: "Analysts who pair domain depth with AI tooling will out-produce peers many-fold."
    },
    {
      id: "investor", name: "Investor", emoji: "💎", color: "#22c55e",
      description: "Allocates capital to compounding assets with a margin of safety and a long horizon.",
      skills: ["Valuation", "Temperament", "Business Analysis", "Mental Models", "Patience"],
      phases: ["11", "17", "19", "2"],
      projects: ["Paper Portfolio", "Investment Memo", "Portfolio Dashboard"],
      salary: "Uncapped — function of capital, returns and discipline",
      aiImpact: "Augmented — tools sharpen research; psychology and judgement remain the edge.",
      future: "Information edges shrink; behavioural and structural edges endure."
    },
    {
      id: "portfolio-manager", name: "Portfolio Manager", emoji: "🧮", color: "#3b82f6",
      description: "Constructs and manages portfolios to meet return and risk objectives.",
      skills: ["Asset Allocation", "Risk Management", "Macro", "Security Selection", "Discipline"],
      phases: ["11", "10", "5", "14"],
      projects: ["Portfolio Dashboard", "Portfolio Optimizer"],
      salary: "₹20L – ₹2Cr+ / yr + carry",
      aiImpact: "Augmented — quant overlays standard; mandate design and client trust are human.",
      future: "Blended discretionary + systematic strategies become the norm."
    },
    {
      id: "quant", name: "Quant", emoji: "🤖", color: "#f97316",
      description: "Designs mathematical and ML models to find and trade systematic edges.",
      skills: ["Python", "Statistics", "Machine Learning", "Backtesting", "Risk Modeling"],
      phases: ["0.5", "14", "16", "10"],
      projects: ["Backtesting Engine", "Portfolio Optimizer"],
      salary: "₹25L – ₹3Cr+ / yr (elite funds)",
      aiImpact: "Core beneficiary — but alpha decays fast; research speed is everything.",
      future: "Alternative data + ML arms race; engineering rigour is the moat."
    },
    {
      id: "entrepreneur", name: "Entrepreneur", emoji: "🚀", color: "#f97316",
      description: "Builds products and companies that create and capture value.",
      skills: ["Product", "Sales", "Strategy", "Hiring", "Resilience"],
      phases: ["7", "3", "20", "17"],
      projects: ["MVP Development", "Launch a Small Online Business", "Unit Economics Dashboard"],
      salary: "Bimodal — many fail, winners create generational wealth",
      aiImpact: "Massive tailwind — AI collapses the cost of building and reaching customers.",
      future: "Tiny, AI-leveraged teams build category-defining products."
    },
    {
      id: "vc", name: "Venture Capitalist", emoji: "🌱", color: "#a855f7",
      description: "Invests early in high-growth startups, betting on outliers and power laws.",
      skills: ["Market Sizing", "Founder Judgement", "Networks", "Portfolio Construction", "Conviction"],
      phases: ["13", "7", "17", "19"],
      projects: ["Startup Analysis", "PE Investment Memo"],
      salary: "Management fees + carry; uncapped upside",
      aiImpact: "Augmented — sourcing and diligence speed up; pattern judgement is the craft.",
      future: "AI-native startups dominate dealflow; speed and access matter most."
    },
    {
      id: "pe", name: "Private Equity", emoji: "🏗️", color: "#a855f7",
      description: "Acquires, improves and exits private companies, often using leverage.",
      skills: ["LBO Modeling", "Operations", "Due Diligence", "Governance", "Negotiation"],
      phases: ["8", "13", "4", "18"],
      projects: ["PE Investment Memo", "DCF Model"],
      salary: "₹20L – ₹5Cr+ / yr + carry",
      aiImpact: "Augmented — value creation increasingly via tech & AI transformation of portfolio cos.",
      future: "Operational alpha and AI-led efficiency become the differentiators."
    },
    {
      id: "fintech-founder", name: "FinTech Founder", emoji: "💳", color: "#a855f7",
      description: "Builds technology companies that reinvent payments, lending, investing or banking.",
      skills: ["Product", "Regulation", "Risk", "Engineering", "Distribution"],
      phases: ["9", "16", "7", "18"],
      projects: ["MVP Development", "Banking System Map", "Financial Research Assistant"],
      salary: "Bimodal — equity-driven",
      aiImpact: "Core enabler — AI underwriting, support and personalisation reshape financial products.",
      future: "Embedded finance + AI agents transacting on users' behalf."
    }
  ];

  window.WM = window.WM || {};
  window.WM.CAREERS = CAREERS;
})();
