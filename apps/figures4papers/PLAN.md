# figures4papers — MVP plan

## Goal

A single-user showcase page that renders **real Jev A/B comparison data** as paper-style figures (grouped bar / radar / usage-meter line) with PNG export.

Primary story: **Without Jev vs With Jev** from a recorded local-run proxy (2026-09-19) — **not** a formal benchmark, and **not** proof of token savings.

## Showcase dataset

| Source | Role |
|--------|------|
| `grok-bot-jev/examples/chatgpt_pack.json` | Authoritative numbers (`tasks`, `timing_comparison`, `grok_bot_meter`, `jev`) |
| `grok-bot-jev/examples/ab_results.md` | Human-readable summary + caveats |

**Main figure** — Sample B, 24-candidate ≥200k filter timing: wall 53.803 s vs 4.125 s (13.0×), pages 14 vs 5, searches 2 vs 0. Shared collection 104.5 s excluded from both arms.

**Secondary figure** — five-task proxies: retries 3→0, skills 6→3, model-research pages 10→4 / searches 5→2 (plus remaining recorded proxies).

Do **not** use the 2026-09-20 shadow RTT (~0.67 s) as the main comparison.

## Single-user MVP

**In scope**
- Tabs: Main (200k timing) / Secondary (five-task proxies)
- Chart types: grouped bar (Without | With), radar (count metrics), line (usage meter 37→38→39)
- Editable cells with defaults matching the pack JSON
- Caveats / footnotes on-page
- Clean paper-figure look + PNG export of the figure region
- Runnable with `bun install && bun run dev` from this directory

**Explicitly out of scope**
- Claiming formal benchmark or proven token savings
- Inventing extra metrics beyond the pack / ab_results
- Full Claude Skill wiring from the upstream figures4papers repo
- Paper PDF / LaTeX pipeline
- Multi-user / auth
- Touching other apps or root monorepo tooling

## Stack

| Choice | Rationale |
|--------|-----------|
| Bun | Monorepo default runtime / package manager |
| Vite + React + TypeScript | Light SPA scaffold |
| Tailwind + shadcn/ui | On-demand UI |
| Recharts | Bar / radar / line |
| html-to-image | DOM → PNG export |

## Deferred

- Claude Skill / MCP integration
- PDF / multi-panel publication layouts
- CSV import of other A/B runs
