# figures4papers — MVP plan

## Goal

A single-user web demo that lets you edit sample scientific metrics and render publication-style bar, radar, and line charts, then export the current figure as PNG.

## Single-user MVP

**In scope**
- Switch between bar, radar, and line chart types
- Edit underlying sample numbers (method names + metrics) in the UI
- Clean paper-figure look: white background, title, axis labels, legend
- Export the visible figure as PNG
- Runnable with `bun install && bun run dev` from this directory

**Explicitly out of scope**
- Full Claude Skill wiring from the upstream repo
- Paper PDF / LaTeX pipeline
- Multi-user / auth
- Custom drawing beyond what Recharts + PNG export need
- Touching other apps or root monorepo tooling

## Outcome-oriented tasks

1. Scaffold Vite + React + TypeScript under `apps/figures4papers/` with `bunfig.toml` (`minimumReleaseAge = 259200`) before install.
2. Init shadcn/ui (minimalist) and add Button, Card, Input, Tabs, Label (and Select if needed).
3. Ship sample paper datasets (methods × metrics) with editable cells.
4. Render bar / radar / line charts with a publication-style layout.
5. Wire PNG export of the figure region.
6. Verify build + dev; capture screenshot and short demo video under `artifacts/`.

## Stack (with rationale)

| Choice | Rationale |
|--------|-----------|
| Bun | Monorepo default runtime / package manager |
| Vite + React + TypeScript | Official light SPA scaffold; one-screen MVP does not need a full framework |
| Tailwind + shadcn/ui (minimalist) | Opinionated, on-demand UI without custom design system |
| Recharts | Prebuilt React charts (bar, radar, line) with solid axis/legend support |
| html-to-image | Simple DOM → PNG export of the figure card |

## Deferred

- Claude Skill / MCP integration (upstream focus; not needed for interactive demo)
- PDF / multi-panel publication layouts
- Import/export of CSV or plotting scripts
- Theme presets matching specific conference style guides
