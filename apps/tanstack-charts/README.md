# TanStack Charts

A one-page dashboard built with TanStack Charts 1.0 — five responsive SVG charts with hover tooltips, keyboard focus and light/dark themes, using real data: the xbm gallery's own merge history and cited numbers on AI agent cost (Jev latency and rule compliance, SemiAnalysis subscription value and margins).

> Charts are rendered with **[TanStack Charts](https://github.com/TanStack/charts)** (`@tanstack/charts` 1.0.0 and its React adapter `@tanstack/charts/react`), by TanStack, **MIT License**. This demo is not affiliated with TanStack.

- Live: https://li.yishan.app/tanstack-charts/
- Bookmark: https://x.com/tan_stack/status/2107141729111736483
- Upstream: https://github.com/TanStack/charts (MIT) · docs https://tanstack.com/charts

## What it shows

| # | Chart | Marks | Interaction | Source |
|---|-------|-------|-------------|--------|
| 1 | xbm gallery timeline — merged PRs per day by kind | stacked `barY` / multi-series `lineY` | **Per day ↔ cumulative toggle, kind filter**, grouped tooltip | `yishan/xbm` git history |
| 2 | Jev latency, 1 vs 32 questions in one call | `barX` + `text` | tooltip | Paweł Huryn, *A New Kind of AI Model: Jev and Quick Wins for PMs* |
| 3 | Jev rule compliance, 24/24 vs 5/24 | stacked `barY` + `text` | grouped tooltip | same article |
| 4 | API-equivalent value used on a $200 plan | `barY` + `ruleY` + `text` | tooltip | SemiAnalysis, *Anthropic Subscriptions Offer 5x+ More Value Than OpenAI* |
| 5 | Subscription gross margin by model and utilization | grouped `barY` (`layout: group()`) + table | **utilization toggle**, grouped tooltip | same article |

The article numbers were quoted in Nutrient's Readwise brief of 2026-10-06 and copied into `src/data/sources.ts`; no other numbers are used, and each chart caption names its source. There is no example data.

The timeline data is `src/data/xbm-timeline.json`, generated from `git log --merges --first-parent origin/main` (dates in Asia/Shanghai):

```bash
git fetch origin main && bun scripts/gen-timeline.ts   # from apps/tanstack-charts/, needs the repo's git history
```

## Run

```bash
bun install && bun run dev   # http://localhost:5173/tanstack-charts/
bun run build
```

## Notes

- `@tanstack/react-charts` 1.0.0 (the package named in the bookmark) is now a compatibility package; its README says new apps use the React adapter at `@tanstack/charts/react`, so this app depends on `@tanstack/charts` directly.
- Chart paint uses `currentColor` plus `--ts-chart-1 … 6` CSS variables (`src/styles/charts.css`), so the charts follow the light/dark theme without rebuilding definitions.
- Code written by DeepSeek (`deepseek-flash` via aider), one component per request; see the PR for hand-fix counts.

## License

This demo's code lives in the xbm monorepo. TanStack Charts is © 2026-present Tanner Linsley (TanStack), MIT License — copy in `LICENSE-TanStack-Charts`, upstream https://github.com/TanStack/charts/blob/main/LICENSE.
