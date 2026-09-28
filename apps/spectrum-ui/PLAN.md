# spectrum-ui — MVP plan

## Goal

A single-page, single-user showcase that re-creates 12 signature animated components from [Spectrum UI](https://ui.spectrumhq.in/) — the ones best suited to AI-agent interfaces — as live, interactive React demos with a copyable source file each.

Source pick: X bookmark [dingyi/status/2099784285775593630](https://x.com/dingyi/status/2099784285775593630).

## Licensing stance

Spectrum UI (by Arihant Jain, [arihantcodes/spectrum-ui](https://github.com/arihantcodes/spectrum-ui)) is **Apache-2.0**, so adapting its source would be allowed with attribution. We still **re-implement every component from scratch** (inspired by the public names and one-line behaviour descriptions only) so the demo stays small, dependency-light, and fits this Vite app. Spectrum UI is credited in the header, footer, README and PR.

## Single-user MVP

**In scope**
- Responsive grid of 12 cards: live interactive preview, one-line description, "how to interact" hint, collapsible source viewer, Copy button (+ toast)
- Components: 3D Tilt Card, Toast Stack, Beam Search, Hold to Confirm, Metal Prompt Bar, Text States, Undo Pill, Morph Button, Expandable Action Bar, Notification Bell, Swipe to Delete, Number Ticker
- Each component is one self-contained file in `src/blocks/` (Motion + Tailwind + lucide only); the file is imported normally **and** as `?raw`, so the copied code is exactly what runs
- Demo harnesses (buttons that fire toasts, etc.) live in `src/demos/`, separate from the copyable component
- `prefers-reduced-motion` respected (Motion `MotionConfig reducedMotion`, `useReducedMotion`-style checks for looping effects, CSS media query) plus an in-app "Reduce motion" toggle
- Header/footer credit to Spectrum UI + the bookmark
- Runnable with `bun install && bun run dev`

**Explicitly out of scope**
- The Spectrum UI MCP server / shadcn registry install flow
- Blocks, templates, dark-mode toggle, search/filter, routing
- Multi-user, persistence, deployment wiring

## Tasks (vertical slices)

1. Scaffold: `bunfig.toml` → `bunx create-vite` (react-ts) → `bun install` → Tailwind v4 + shadcn/ui (button, card, badge, switch, sonner) → `motion`
2. Shell: header with credit + reduced-motion toggle, `ShowcaseCard` (preview slot, hint, source viewer, copy), registry in `src/blocks/index.ts`
3. Components — one per slice, each written by a coding CLI (aider + DeepSeek `deepseek-v4-pro`), then reviewed/fixed by hand
4. Reduced-motion path for every component
5. `bun run build` + `bun run lint` (oxlint)
6. Artifacts: Playwright full-page screenshot + 20–40 s webm into `artifacts/`

## Stack

| Choice | Rationale |
|--------|-----------|
| Bun | Monorepo default runtime / package manager |
| Vite + React + TypeScript | Same light SPA scaffold as `apps/transitions-dev` |
| Tailwind v4 + shadcn/ui | Minimal UI primitives, same preset as siblings |
| motion (Framer Motion) | Spectrum UI's own animation layer; springs, layout, drag, AnimatePresence |
| sonner (via shadcn) | "Copied" feedback toast |
| aider + DeepSeek `deepseek-v4-pro` | Owner-requested: code written by a coding CLI on the owner's key |
| Playwright (existing box install, not a dependency) | Screenshot + video artifacts |

## Deferred

- Remaining 40+ Spectrum UI components and page blocks — cut for scope
- Syntax highlighting in the source viewer — plain `<pre>` is enough
- Tests — visual components with no critical logic; build + lint is the gate
