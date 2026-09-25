# transitions-dev — MVP plan

## Goal

A single-page, single-user gallery that re-creates a dozen of the **free** UI transitions showcased on [transitions.dev](https://transitions.dev) as live, replayable React demos, each with a copyable snippet.

Source pick: X bookmark [jonathan_wilke/status/2098801944756154391](https://x.com/jonathan_wilke/status/2098801944756154391).

## Licensing stance

transitions.dev's [Terms](https://transitions.dev/terms.html) allow using transitions in your own products but forbid republishing the collection (or a substantial part of it) as a competing library / template pack; the GitHub repo has no open-source license. So this demo **does not copy any transitions.dev code**. Every effect is reimplemented from scratch (own CSS + React), inspired only by the public names/descriptions, and the app + README credit and link to transitions.dev. Pro transitions (confetti burst, gooey plus menu, …) are out of scope.

## Single-user MVP

**In scope**
- Responsive grid of 12 transition cards: live preview, replay / trigger button, one-line description, copyable code snippet (Copy button + toast feedback)
- Transitions (all from the free set): number pop-in, toast open/close, tabs sliding pill, skeleton loader → reveal, 3D tilt with glare, streaming text, icon swap, success check, error state shake, menu dropdown (origin-aware), like button burst, shimmer text
- `prefers-reduced-motion` respected globally (CSS media query + a `useReducedMotion` hook that swaps motion for instant/opacity-only changes) plus an in-app "Reduce motion" toggle to preview it
- Header credit linking transitions.dev and the bookmark
- Runnable with `bun install && bun run dev`

**Explicitly out of scope**
- Pro transitions, the transitions.dev skill / CLI / Refine tool
- Reusing transitions.dev source code
- Search / filtering / routing / dark-mode toggle
- Multi-user, persistence, deployment wiring

## Tasks (vertical slices)

1. Scaffold: `bunfig.toml` → `bunx create-vite` (react-ts) → `bun install` → Tailwind v4 + shadcn/ui (button, card, badge, switch, sonner)
2. Gallery shell: header, credit, reduced-motion toggle, `TransitionCard` (preview slot, replay, description, snippet with copy)
3. Implement the 12 demos, one file each in `src/transitions/`, registered in `src/transitions/index.ts`
4. Reduced-motion path for every demo
5. `bun run build` + `bun run lint`
6. Artifacts: Playwright screenshot + 20–40 s webm into `artifacts/`

## Stack

| Choice | Rationale |
|--------|-----------|
| Bun | Monorepo default runtime / package manager |
| Vite + React + TypeScript | Light SPA scaffold, same as `apps/figures4papers` |
| Tailwind v4 + shadcn/ui | On-demand, minimal UI primitives |
| Plain CSS keyframes/transitions + tiny React state | Matches the copy-paste spirit of transitions.dev; no animation library needed |
| sonner (via shadcn) | "Copied" feedback toast |
| Playwright (bunx, dev-only, not a dependency) | Screenshot + video artifacts |

## Deferred

- Pro-style physics effects (confetti, gooey) — paid on transitions.dev
- Per-transition timing controls / timeline scrubber
- Tests — no critical logic beyond visuals; build + lint is the gate
