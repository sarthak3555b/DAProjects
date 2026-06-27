# Wealth Mastery OS

> Learn · Build · Observe · Reflect · Implement · Review · Repeat

A living, interactive learning operating system that guides a complete beginner to advanced **capital allocator** over ~10 years (60 min/day, 4 days/week). Inspired by roadmap.sh + Notion + Duolingo streaks + Obsidian graphs — built as a premium, dark-themed web app.

It runs **100% in your browser**. No server, no database, no sign-up, no API keys. All your progress is saved privately on your device. That means you can put it online in **2 minutes** and just use it.

---

## What's inside

- **Interactive Roadmap** — a custom infinite canvas (pan, zoom, pinch, mini-map, fit, keyboard nav) with **22 phases · 57 modules · 326 learning nodes**, dependency edges, status colours, difficulty/status filters and search.
- **Dashboard** — progress ring, current phase/module, hours, books, projects, streak, weekly/monthly/yearly goals, learning-hours graph, skill radar, knowledge heatmap, completion timeline and mentor recommendations.
- **Every node** has description, purpose, why-it-matters, learning outcomes, prerequisites, "unlocks next", exercises, assignments, a **knowledge test (quiz)**, reflection questions, real-life & career applications, resources (books/courses/videos/articles/podcasts/research), 5 mastery levels, notes, bookmark/favourite and review scheduling.
- **Projects** — every phase's projects + **live calculators**: Compound Interest, SIP, EMI, Retirement and a Monte-Carlo portfolio simulator.
- **Resources** — a curated, filterable, searchable library you can add to.
- **Current Affairs Engine** — each item answers What happened / Why / Why it matters / How it affects wealth. Add your own.
- **Journal** — daily reflective prompts, markdown, tags, search; feeds your streak.
- **Progress Analytics** — velocity, mastery by difficulty, phase completion, radar, 52-week heatmap, achievements.
- **Career Explorer** — 11 paths (Economist, IB, CA, CFA, Investor, PM, Quant, Entrepreneur, VC, PE, FinTech Founder) mapped to roadmap phases, with skills, salary, AI impact and trends.
- **AI Mentor** — a built-in offline mentor (always works). Optionally connect OpenAI/Anthropic in Settings (your key stays in your browser).
- **Admin / CMS** — add resources & current-affairs items from the UI. Curriculum is fully data-driven.
- **Streaks · Goals · Achievements (12)** · global search (press `/`) · notifications · import/export backup.

---

## Run it locally (optional)

Just open `index.html` in any modern browser. That's it — it works straight from the file.

> Tip: a couple of browsers restrict Google Fonts on `file://`. The app still works; fonts simply fall back to system fonts. Hosting it (below) removes that.

---

## Put it online (pick ONE — all free)

### Option A — Netlify Drop (easiest, ~2 minutes, no account-setup needed)
1. Go to **https://app.netlify.com/drop**
2. Drag the whole `wealth-mastery-os` **folder** onto the page.
3. You instantly get a live URL like `https://your-name.netlify.app`. Done.

### Option B — GitHub Pages
1. Create a new GitHub repository and upload all the files in this folder (keep the folder structure).
2. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick `main` and `/ (root)`, Save.
3. Your site appears at `https://<your-username>.github.io/<repo-name>/` within a minute.

### Option C — Vercel
1. Go to **https://vercel.com/new**, import the repo (or drag the folder with the Vercel CLI).
2. Framework preset: **Other** (it's a static site — no build command needed).
3. Deploy → you get a live URL.

No environment variables, no database, no build step are required for any option.

---

## Your data & backups
- Everything is stored in your browser's `localStorage` under the key `wm-os-v1`.
- **Settings → Data management → Export** downloads a JSON backup. **Import** restores it (use this to move between devices/browsers).
- Clearing your browser data will erase progress, so export occasionally.

---

## Project structure
```
wealth-mastery-os/
├─ index.html                 # App shell
├─ assets/css/styles.css      # Premium dark design system
├─ js/
│  ├─ data/                   # curriculum, resources, careers, news (seed/CMS)
│  ├─ util.js  store.js       # helpers + state store (localStorage, progress, streaks, goals, achievements)
│  ├─ charts.js               # hand-built SVG charts (ring, bars, line, radar, heatmap, sparkline)
│  ├─ search.js  mentor.js    # instant search + AI mentor (local + provider abstraction)
│  ├─ roadmap.js              # interactive canvas engine (pan/zoom/minimap/edges/filters)
│  ├─ views/                  # dashboard, roadmap, node, projects, resources, affairs, journal, analytics, career, settings
│  ├─ router.js  app.js       # hash router + bootstrap (nav, search, mentor, notifications)
└─ README.md
```

## Tech notes
Zero runtime dependencies — vanilla JS (ES5-safe, classic scripts), custom SVG charts and a custom roadmap canvas, so it deploys anywhere static and loads fast. Fonts: Inter + Plus Jakarta Sans (with system fallbacks). Fully responsive and keyboard-accessible.

The optional external AI mentor uses a provider abstraction (`local` / `openai` / `anthropic`); without a key it transparently uses the built-in offline mentor.
