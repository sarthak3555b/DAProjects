# Wealth Mastery OS

A premium, cinematic **operating system for mastering wealth** — money, economics, business, investing, technology, and capital allocation. Built as a frontend-only Next.js application with a 3D knowledge universe, a living roadmap, terminal-grade analytics, and an AI mentor.

> **Frontend only.** All data is rich mock data served through a simulated API layer (`src/lib/api.ts`) with realistic latency and a forced-error mode, so every loading / empty / error / offline / success state is exercised. The data models (`src/lib/types.ts`) are structured to drop onto a real backend.

---

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 15 (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) |
| UI primitives | Radix UI + custom shadcn-style components |
| Motion | Motion (Framer Motion) · GSAP · Lenis |
| 3D | three.js · @react-three/fiber · @react-three/drei |
| Graph / canvas | @xyflow/react (React Flow 12) · elkjs · d3-force |
| Charts | Recharts · ECharts · custom SVG |
| Editor / calendar | TipTap · FullCalendar |
| State / data | Zustand · TanStack Query |
| Command / toasts | cmdk · Sonner |
| Icons | lucide-react · @phosphor-icons/react |

## Getting started

```bash
npm install      # or pnpm install / yarn
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve production build
npm run typecheck
```

Requires Node.js 18.18+ (Node 20/22 recommended).

> ⚠️ **Build environment note.** This project was authored in a sandbox **without npm-registry access**, so `npm install`, `next build`, and Lighthouse could **not** be executed there. The source is written carefully against the real library APIs, but you should run the commands above in your own environment. Performance, hydration, and cross-browser targets are **engineered-for at the code level, not empirically measured** in the authoring environment — verify them locally (see Checklist below).

## Project structure

```
src/
  app/
    layout.tsx              # root: fonts, providers, metadata
    page.tsx                # landing (3D hero, no app shell)
    error.tsx / not-found.tsx
    (app)/                  # authenticated shell route group
      layout.tsx            # sidebar + header + command palette + ambient bg
      loading.tsx
      dashboard/ roadmap/ knowledge-graph/ current-affairs/
      assessments/ projects/ resources/ study-planner/ journal/
      analytics/ ai-mentor/ achievements/ settings/
  components/
    ui/        # Radix-based primitives (button, card, sheet, dialog, …)
    fx/        # ambient bg, tilt, magnetic, reveal, animated counter
    shell/     # sidebar, header, command palette, notifications, transitions
    charts/    # recharts + echarts + custom (lazy-loaded)
    landing/ dashboard/ roadmap/ knowledge/ news/ assessments/ journal/ planner/
    states.tsx # Empty / Error / Offline / Loading / QueryBoundary
  lib/
    types.ts mock-data.ts api.ts nav.ts hooks.ts sound.ts utils.ts
    stores/ui-store.ts  use-mentor-chat.ts
```

## Highlights

- **Landing** — cinematic 3D knowledge universe (R3F: orbiting topic galaxies, constellations, mouse-parallax camera) with a GSAP headline reveal and Lenis smooth scroll. Falls back to a static aurora field under reduced-motion.
- **Roadmap** — a living spatial canvas (React Flow + ELK auto-layout): four node states with glow/pulse, animated dependency edges, minimap, search, status filters, **focus mode**, **presentation mode** (phase fly-through), keyboard shortcuts, and a rich node-details drawer. Deep-linkable via `?node=`.
- **Knowledge Graph** — signature 2D (d3-force, precomputed for performance) **and** 3D (R3F with camera fly-to-node) modes, semantic clustering, relationship highlighting, search, and a concept detail panel.
- **Dashboard** — a Bloomberg/TradingView-style bento: animated metric cards with sparklines, learning velocity, knowledge radar, contribution heatmap, completion timeline, goals rings, activity feed.
- **AI Mentor** — streaming word-by-word responses, typing indicator, memory cards, reflection prompts, suggested prompts, contextual recommendations.
- **Analytics** — treemap, sunburst, radar, heatmap, velocity, and an interactive **capital-allocation simulator** with a projected compounding band.
- **Current Affairs / Assessments / Projects / Resources / Journal / Study Planner / Achievements / Settings** — each fully built with all required states. Quiz engine (timer + confetti), Kanban drag-and-drop, TipTap editor with autosave, FullCalendar planner, tiered achievements with celebrations, and a real (non-dead) theme system.

## Design system

CSS-first via Tailwind v4 `@theme` in `src/app/globals.css`.

- Background `#030712` · Surface `#111827` · Card `#1f2937` · Border `#374151`
- Primary `#3b82f6` · Green `#10b981` · Orange `#f59e0b` · Purple `#8b5cf6` · Red `#ef4444`
- Fonts: Inter (body) + Plus Jakarta Sans (display) · 8px spacing · radii 16/24/32 · soft glow shadows
- Utilities: `.glass`, `.glass-strong`, `.aurora-bg`, `.mesh-gradient`, `.noise`, `.gradient-text`, `.skeleton`
- A full **light theme** ships as token overrides (`html.light`), applied by the theme toggle.

## Accessibility & motion

- Skip-link, visible `:focus-visible` rings everywhere, ARIA labels on icon controls, Radix roles/labels.
- Full `prefers-reduced-motion` support: disables Lenis, GSAP, scroll reveals, tilt/magnetic, and swaps the 3D hero for a static fallback.
- Keyboard: ⌘/Ctrl-K command palette; roadmap `F`/`P`/`+`/`-`/`Esc`.

## Performance posture

- Heavy libraries (three.js/R3F, ECharts, React Flow, TipTap, FullCalendar) are **lazily loaded** via `next/dynamic({ ssr: false })`.
- Animations favor GPU-friendly `transform`/`opacity`; particle field and force layout are bounded/precomputed.
- `optimizePackageImports` configured for icon and chart libraries.

## Verification checklist (run in your environment)

These were **not** measurable in the authoring sandbox — please verify:

- [ ] `npm install` resolves cleanly
- [ ] `npm run build` and `npm run typecheck` pass
- [ ] `npm run dev` → 0 console errors, 0 hydration warnings
- [ ] Lighthouse (Performance / A11y / Best Practices) on `/` and `/dashboard`
- [ ] Manual a11y pass (axe DevTools) + keyboard-only navigation
- [ ] Responsive sweep at 320 / 375 / 768 / 1024 / 1280 / 1440 / 1920 / 2560
- [ ] Cross-browser: Chrome, Edge, Firefox, Safari, mobile Safari/Chrome

### Try the simulated states

In the browser console:

```js
localStorage.setItem("wm.forceError", "all"); // force every fetch to error → see error/retry UI
localStorage.removeItem("wm.forceError");      // back to normal
```

Toggle airplane mode (or DevTools offline) to see the offline banner and offline states.
