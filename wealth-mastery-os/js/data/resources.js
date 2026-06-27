/* ============================================================
   Wealth Mastery OS — Global Resource Library (curated, versioned)
   Real, well-known resources. Links are working search URLs so
   they never go dead.
   ============================================================ */
(function () {
  "use strict";
  const s = (q) => "https://www.google.com/search?q=" + encodeURIComponent(q);
  const yt = (q) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);

  const RESOURCES = [
    // Books
    { id: "r1", title: "The Psychology of Money", source: "Morgan Housel", type: "Book", phase: "2", url: s("The Psychology of Money Morgan Housel"), note: "Timeless lessons on wealth, greed and happiness." },
    { id: "r2", title: "Rich Dad Poor Dad", source: "Robert Kiyosaki", type: "Book", phase: "1", url: s("Rich Dad Poor Dad"), note: "The assets-vs-liabilities mental model." },
    { id: "r3", title: "The Intelligent Investor", source: "Benjamin Graham", type: "Book", phase: "11", url: s("The Intelligent Investor Benjamin Graham"), note: "The bible of value investing." },
    { id: "r4", title: "The Almanack of Naval Ravikant", source: "Eric Jorgenson", type: "Book", phase: "17", url: s("Almanack of Naval Ravikant"), note: "Wealth and happiness via leverage and judgement." },
    { id: "r5", title: "Poor Charlie's Almanack", source: "Charlie Munger", type: "Book", phase: "19", url: s("Poor Charlie's Almanack"), note: "The multidisciplinary latticework of mental models." },
    { id: "r6", title: "Thinking, Fast and Slow", source: "Daniel Kahneman", type: "Book", phase: "2", url: s("Thinking Fast and Slow Kahneman"), note: "The science of cognitive bias." },
    { id: "r7", title: "Principles", source: "Ray Dalio", type: "Book", phase: "20", url: s("Principles Ray Dalio"), note: "Life and work operating principles." },
    { id: "r8", title: "Financial Statements", source: "Thomas Ittelson", type: "Book", phase: "4", url: s("Financial Statements Thomas Ittelson"), note: "Accounting from first principles." },
    { id: "r9", title: "Naked Economics", source: "Charles Wheelan", type: "Book", phase: "5", url: s("Naked Economics Charles Wheelan"), note: "Economics without the dismal." },
    { id: "r10", title: "Zero to One", source: "Peter Thiel", type: "Book", phase: "7", url: s("Zero to One Peter Thiel"), note: "Building monopolies and moats." },
    { id: "r11", title: "The Most Important Thing", source: "Howard Marks", type: "Book", phase: "11", url: s("The Most Important Thing Howard Marks"), note: "Risk, cycles and second-level thinking." },
    { id: "r12", title: "Antifragile", source: "Nassim Taleb", type: "Book", phase: "1", url: s("Antifragile Nassim Taleb"), note: "Gaining from disorder and convexity." },
    { id: "r13", title: "How to Take Smart Notes", source: "Sönke Ahrens", type: "Book", phase: "0", url: s("How to Take Smart Notes Ahrens"), note: "The Zettelkasten method." },
    { id: "r14", title: "Python for Finance", source: "Yves Hilpisch", type: "Book", phase: "16", url: s("Python for Finance Hilpisch"), note: "Coding financial analytics." },

    // Courses
    { id: "r20", title: "Khan Academy — Finance & Capital Markets", source: "Khan Academy", type: "Course", phase: "10", url: s("Khan Academy finance and capital markets"), note: "Free foundational finance." },
    { id: "r21", title: "Aswath Damodaran — Valuation", source: "NYU Stern (free)", type: "Course", phase: "8", url: yt("Aswath Damodaran valuation lectures"), note: "The dean of valuation, free on YouTube." },
    { id: "r22", title: "CS50 / Python", source: "Harvard", type: "Course", phase: "16", url: s("CS50 Python Harvard free"), note: "Programming foundations." },
    { id: "r23", title: "MIT OCW — Microeconomics", source: "MIT", type: "Course", phase: "5", url: s("MIT OCW principles of microeconomics"), note: "Rigorous, free." },

    // Newsletters / Articles
    { id: "r30", title: "Farnam Street (fs.blog)", source: "Shane Parrish", type: "Newsletter", phase: "19", url: "https://fs.blog/", note: "Mental models and clear thinking." },
    { id: "r31", title: "Morgan Housel — Collab Fund", source: "Collab Fund", type: "Article", phase: "2", url: s("Morgan Housel Collaborative Fund blog"), note: "Essays on behaviour and money." },
    { id: "r32", title: "Stratechery", source: "Ben Thompson", type: "Newsletter", phase: "7", url: "https://stratechery.com/", note: "Tech strategy and business models." },

    // Podcasts
    { id: "r40", title: "We Study Billionaires", source: "The Investor's Podcast", type: "Podcast", phase: "11", url: s("We Study Billionaires podcast"), note: "Value investing interviews." },
    { id: "r41", title: "Invest Like the Best", source: "Patrick O'Shaughnessy", type: "Podcast", phase: "17", url: s("Invest Like the Best podcast"), note: "Investors and operators." },
    { id: "r42", title: "Acquired", source: "Ben & David", type: "Podcast", phase: "7", url: s("Acquired podcast"), note: "Deep company histories." },

    // Research / Papers
    { id: "r50", title: "Berkshire Hathaway Shareholder Letters", source: "Warren Buffett", type: "Paper", phase: "17", url: "https://www.berkshirehathaway.com/letters/letters.html", note: "Decades of capital-allocation wisdom." },
    { id: "r51", title: "SSRN — Finance Working Papers", source: "SSRN", type: "Paper", phase: "14", url: "https://www.ssrn.com/index.cfm/en/", note: "Cutting-edge finance research." },

    // YouTube channels
    { id: "r60", title: "Ben Felix / Common Sense Investing", source: "YouTube", type: "Video", phase: "11", url: yt("Ben Felix common sense investing"), note: "Evidence-based investing." },
    { id: "r61", title: "Patrick Boyle", source: "YouTube", type: "Video", phase: "14", url: yt("Patrick Boyle finance"), note: "Markets, quant and history." }
  ];

  const TYPES = ["Book", "Course", "Video", "Article", "Newsletter", "Podcast", "Paper"];

  window.WM = window.WM || {};
  window.WM.RESOURCES = RESOURCES;
  window.WM.RESOURCE_TYPES = TYPES;
})();
