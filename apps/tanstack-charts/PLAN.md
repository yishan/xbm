# TanStack Charts — plan

## Goal

Show what TanStack Charts 1.0 (`@tanstack/charts` + its React adapter) can do in one responsive dashboard page built from real data: the xbm gallery's own merge history and two cited articles about agent cost.

## Single-user MVP

In:
- One dashboard page with 5 charts plus a small stats strip:
  1. **xbm gallery timeline** — merged PRs per day on `yishan/xbm` main, split by kind (new demo / update / fix / infra). Interactive: toggle "per day" vs "cumulative" view and toggle each kind on or off. Hover tooltips. Data: `src/data/xbm-timeline.json`, generated from `git log` by `scripts/gen-timeline.ts` and committed.
  2. **Jev latency** — 1 question 603 ms vs 32 questions 566 ms in one call.
  3. **Jev rule compliance** — 24/24 with the rule in the prompt vs 5/24 without.
  4. **Subscription value per $200 plan** — API-equivalent value used: $2,485 of Fable 5.1 (Claude, 50 % quota left) vs $2,897 of GPT-6 Astra (OpenAI, quota used up), with a $200 reference rule.
  5. **Gross margin by model and utilization** — Opus 5.5 −369 % / Fable 5.1 ~1 % at full use, 6 % / 80 % at 20 % use. Interactive utilization toggle + a shadcn table with the same 4 numbers.
- Numbers come ONLY from `xbm-nightly/2026-10-07/pick.md` (which quotes Nutrient's 2026-10-06 Readwise brief) and the xbm git history. Every chart caption cites its source. Nothing invented; no example data is needed.
- Hover tooltips on every chart (built-in `tooltip` extension); keyboard focus works through the library.
- Light / dark / system theme. Chart paint follows `currentColor` and `--ts-chart-*` CSS variables.
- Responsive grid: 1 column on phones, 2 on desktop.
- Header links to https://github.com/TanStack/charts, https://tanstack.com/charts and the bookmark https://x.com/tan_stack/status/2107141729111736483. MIT credit for TanStack Charts in the UI footer and the README.

Out:
- Live data fetching, any backend or Cloudflare Worker (static Vercel app only).
- Canvas renderer, motion renderer, brushing/zoom, export.
- Other framework adapters.

## Tasks (vertical slices)

1. Scaffold: `bun x create-vite` react-ts, `bunfig.toml` (minimumReleaseAge 259200) before install, shadcn (radix-nova, neutral) config copied from the known-good `apps/slideblocks`, `base: "/tanstack-charts/"`.
2. Data: `scripts/gen-timeline.ts` → `src/data/xbm-timeline.json`; `src/data/sources.ts` with the article numbers and citations.
3. Shell: header (title, links, theme toggle), `ChartCard` wrapper with source caption, footer credit, chart CSS tokens.
4. One component per chart (`src/components/charts/*.tsx`), written by DeepSeek (deepseek-flash via aider), one component per request.
5. Visual QA by Playwright screenshots in light, dark and a 390 px mobile width; fix rounds via aider diff mode.
6. README, `artifacts/screenshot.png`, `artifacts/demo.webm`, tracking entry, unmerged PR.

## Stack

- Vite + React 19 + TypeScript: same as the other xbm demos; known to pass `scripts/build-all.sh`.
- `@tanstack/charts` 1.0.0 with `@tanstack/charts/react`: the pick. `@tanstack/react-charts` 1.0.0 is now a compatibility package whose README says new apps use `@tanstack/charts/react`, so the app imports from there.
- Tailwind v4 + shadcn/ui (radix-nova): cards, toggle group, table, badge, button.
- lucide-react: icons.

## Deferred

- Brush / zoom on the timeline (controlled viewport API is larger than one night's scope).
- Motion renderer (`motion()`) transitions; the default SVG renderer with `svgAnimation` is enough.
- Auto-regenerating the timeline JSON in the root build (would make the Vercel build depend on git history depth).
