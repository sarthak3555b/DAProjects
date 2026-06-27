# Wealth Mastery OS — Full-Stack SaaS

> Learn · Build · Observe · Reflect · Implement · Review · Repeat

A production, full-stack learning operating system for mastering money, business, investing, economics, technology and capital allocation over ~10 years. Next.js 15 (App Router) + React 19 + TypeScript + TailwindCSS + Prisma + **PostgreSQL** + NextAuth, with cloud sync, an interactive roadmap, AI mentor, admin CMS, analytics and PWA support.

**All user data persists in PostgreSQL** and syncs across every device you log in from. LocalStorage is used only for theme/SW cache.

---

## ✨ Deploy in ~5 minutes (non-technical, no terminal)

You need two free accounts: **GitHub** (already have it) and **Vercel**. Vercel will create the database for you.

1. **Import the repo into Vercel**
   - Go to **https://vercel.com/new**, log in with GitHub, and **Import** the `DAProjects` repository.
   - When asked, set the **Root Directory** to `wealth-mastery-saas`.
   - Framework preset is detected automatically (Next.js). Don't deploy yet — add the database first (step 2).

2. **Add a free Postgres database (Neon)**
   - In the Vercel project, open the **Storage** tab → **Create Database** → **Neon (Serverless Postgres)** → Connect.
   - Vercel automatically injects `DATABASE_URL` (and a pooled URL) into the project. ✅

3. **Add two environment variables** (Project → Settings → Environment Variables)
   - `AUTH_SECRET` → click **Generate** or paste any long random string.
   - `SEED_SECRET` → any random word you'll remember (e.g. `load-my-content-123`).
   - (Optional) `ADMIN_EMAIL` → the email you'll register with, to get the admin role automatically.

4. **Deploy.** Vercel builds and gives you a live URL like `https://your-app.vercel.app`.
   - The build runs `prisma db push` automatically, creating all tables.

5. **Load the curriculum (one click).** Visit:
   ```
   https://your-app.vercel.app/api/seed?secret=YOUR_SEED_SECRET
   ```
   You'll see a JSON summary (`phases: 22, nodes: 326, …`). Done — all content is loaded.

6. **Create your account** at `https://your-app.vercel.app/register` and start learning.
   If you set `ADMIN_EMAIL` to that email, you'll also see the **Admin CMS**.

That's it — a real multi-user SaaS with cloud sync, on a live URL.

---

## 🧩 Optional integrations (all work without these)
| Feature | Env vars | Without it |
|---|---|---|
| Google login | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Email/password still works |
| GitHub login | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Email/password still works |
| Password-reset emails | `EMAIL_SERVER_*`, `EMAIL_FROM` | Reset link is printed to server logs |
| AI mentor via OpenAI/Anthropic | `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | Built-in offline mentor is used |
| Error monitoring | `NEXT_PUBLIC_SENTRY_DSN` | Standard logging is used |

See `.env.example` for the full list.

---

## 🏗️ Architecture
```
Browser (PWA)
  → Next.js App Router (React 19, server + client components)
    → API Routes + Server Actions (validation: Zod, rate limiting, RBAC, audit logs)
      → Prisma ORM
        → PostgreSQL (Neon)
```

### Tech
- **Frontend:** Next.js 15, React 19, TypeScript, TailwindCSS, Radix UI, Framer Motion, React Flow (+ dagre auto-layout), Recharts, TanStack Query, cmdk (command palette), Fuse.js (search), Sonner (toasts), next-themes, PWA.
- **Backend:** Next.js Route Handlers + Server Components, Node runtime, Zod validation, in-memory rate limiting, RBAC, audit logging.
- **Auth:** NextAuth v5 (Auth.js) — credentials (bcrypt) + Google/GitHub OAuth, JWT sessions, protected routes via middleware, password reset, role-based admin.
- **DB:** PostgreSQL + Prisma (25+ models, indexes, relations).
- **CI/CD:** GitHub Actions (lint, typecheck, unit tests, build).
- **Tests:** Vitest (unit) + Playwright (E2E smoke).

---

## 📦 Local development (optional, for developers)
```bash
npm install
cp .env.example .env          # set DATABASE_URL + AUTH_SECRET + SEED_SECRET
npx prisma db push            # create tables
npm run db:seed               # load all content
npm run dev                   # http://localhost:3000
```

Scripts: `dev`, `build`, `start`, `db:push`, `db:migrate`, `db:seed`, `db:studio`, `test`, `test:e2e`, `lint`, `typecheck`.

---

## 🔐 Security
Authentication, RBAC authorization, Zod input validation, rate limiting on auth/mentor endpoints, secure HTTP headers (next.config), bcrypt password hashing, no account enumeration on password reset, audit logs for admin actions, secrets via environment variables.

## 📈 Scalability
Indexed Postgres queries, server components for read-heavy pages, React Flow virtualized canvas, query caching (TanStack Query), pagination-ready admin/user queries, content seeded once and served from DB.

---

## 🗂️ Feature map
Dashboard · Roadmap (infinite canvas, zoom/pan/minimap, dependency edges, search, filters, auto-layout) · Node detail (outcomes, prerequisites, quiz, checklist, notes, resources, mastery, review scheduling) · Projects + live calculators (Compound/SIP/EMI/Retirement) · Resources · Current Affairs · Journal · Analytics (velocity, radar, heatmap, mastery, achievements) · Career Explorer · Settings · Admin CMS · AI Mentor · Global command palette (⌘K) · Notifications · Achievements · Streaks · Goals · PWA.

---

## 💾 Backups & recovery
- **Users:** Settings → Export downloads a full JSON of their data.
- **Content:** Admin → Overview → Export all content (JSON).
- **Database:** Neon provides automated branching/backups; restore from the Neon console.

---

Made with care. Learn · Build · Observe · Reflect · Implement · Review · Repeat.
