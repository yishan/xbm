# PLAN — shadcn-admin showcase

**Goal:** A polished, frontend-only showcase of the MIT [satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin) admin-dashboard pattern, served at `https://li.yishan.app/shadcn-admin/`.

Bookmark: https://x.com/fhwofjow51260/status/2104904784637739452 · Upstream: https://github.com/satnaing/shadcn-admin (MIT, © Sat Naing)

## Single-user MVP

- Collapsible sidebar shell (shadcn `sidebar`, icon-collapse, mobile sheet) + header with theme toggle
- **Dashboard** — 4 KPI cards, bar/area chart (shadcn `chart` + Recharts), recent sales list, tabs
- **Tasks** — TanStack Table data table with text filter, status/priority faceted filters, column sorting, pagination, row selection
- **Settings** — profile / account / appearance forms (react-hook-form + zod, toast on submit)
- **Sign in** — standalone auth card page (fake submit → dashboard)
- Light / dark / system theme persisted to localStorage
- Attribution to the original MIT project in UI (sidebar footer + dashboard banner) and README

Out: real auth, backend/API (no Cloudflare Worker), RTL, global command search, chats/apps/users pages, i18n, tests beyond build.

## Tasks (vertical slices)

1. Scaffold: `bun create vite` react-ts → bunfig.toml → Tailwind v4 + shadcn init → `base: "/shadcn-admin/"`
2. Shell: TanStack Router (hash history — vercel.json has no SPA rewrites) + AppSidebar + Header + ThemeProvider
3. Dashboard page (cards + charts + recent sales)
4. Tasks data table (columns, toolbar, faceted filter, pagination) with seeded fake data
5. Settings forms
6. Sign-in page
7. Playwright QA at 1440 / 390 widths, screenshot + webm, README, tracking

## Stack

- Vite + React 19 + TS — repo standard, fast static build
- Tailwind v4 + shadcn/ui (radix-nova, neutral) — same as upstream look, components on demand
- @tanstack/react-router (code-based, hash history) — mirrors upstream routing without SPA rewrite config
- @tanstack/react-table — data table like upstream
- recharts via shadcn `chart` — dashboard charts
- react-hook-form + zod — settings / auth forms
- sonner — toasts

## Deferred

- Real data/auth (single-user demo), command palette (time), more pages (scope), RTL (scope).
