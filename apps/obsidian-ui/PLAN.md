# obsidian-ui — MVP plan

## Goal

A single-page, single-user showcase that re-creates 11 signature pieces from [ObsidianUI](https://obsidianui.dev) — weighted toward its rich **WebGL / canvas / GSAP / Motion** effects — as live, interactive React demos with a copyable source file each.

Source pick: X post [athrix_codes/status/2104101588466074028](https://x.com/athrix_codes/status/2104101588466074028) (ObsidianUI launch by its author, [@athrix_codes](https://x.com/athrix_codes)).

## Licensing stance

ObsidianUI ([Atharvsinh-codez/ObsidianUI](https://github.com/Atharvsinh-codez/ObsidianUI)) is **MIT**, so adapting its source would be allowed with the copyright notice. We still **re-implement every piece from scratch** from the public component names and one-line behaviour descriptions (written by aider + DeepSeek from our own specs), so the demo stays dependency-light (no three.js, postprocessing, lenis or @paper-design/shaders — raw WebGL / Canvas 2D instead) and fits this Vite app. ObsidianUI and the post are credited in the header, footer, README, PR and every block's header comment.

## How this differs from `apps/spectrum-ui`

- Dark "obsidian" theme instead of light zinc.
- **Full-width section blocks** (hero-scale previews) interleaved with the card grid, not only cards.
- Heavier effects: a raw-WebGL lensed gallery, a WebGL liquid-metal shader, a Canvas 2D refracting prism, and GSAP-driven marquee / text reel / hover-follow — alongside Motion pieces.

## Single-user MVP

**In scope — 11 pieces**

| Layout | Piece | Tech |
|--------|-------|------|
| Section (hero) | Prism Beam — drag to aim a light beam through a glass prism; it disperses into a spectrum (after `v-prism`) | Canvas 2D, Snell's law |
| Section | Lens Gallery — drag through an infinite tiled gallery under barrel distortion (after `art-gallery`) | Raw WebGL + GLSL |
| Section | Draggable Marquee — looping card track with drag momentum + arrow keys | GSAP ticker |
| Section | Text Reel — vertical word stream whose speed/direction follows scroll & wheel (after `text-stream`) | GSAP ticker |
| Section | Split Showcase — two partner cards, spring outward shift + growing radius on hover | Motion |
| Card | Flip Text — per-character 3D flip on hover | Motion |
| Card | Liquid Metal Button — flowing chrome rim rendered by a fragment shader | Raw WebGL |
| Card | Click Spark — radiating sparks on click | Canvas 2D |
| Card | Hover Image — pointer-following thumbnail over a project list | GSAP quickTo |
| Card | File Input — idle → drag-over → uploading → file list morph | Motion |
| Card | Gooey Loader — blobs merging through an SVG goo filter | Motion + SVG filter |

- Each card/section: live preview, description, "how to interact" hint, tech badges, collapsible source viewer, Copy button (+ toast), remount button
- Each piece is one self-contained file in `src/blocks/` (imported normally **and** as `?raw`, so the copied code is exactly what runs); demo harnesses in `src/demos/`
- Reduced motion: app-level "Reduce motion" switch + OS setting → `<MotionConfig reducedMotion>`, a `reducedMotion` prop for GSAP/canvas/WebGL blocks (static frame, no auto-drift; interaction still works), CSS kill-switch
- Credits in header/footer; runnable with `bun install && bun run dev`

**Explicitly out of scope**
- ObsidianUI's shadcn registry / MCP server install flow, templates (Project One), docs site
- Real photo assets (procedural gradients instead), three.js / postprocessing parity with v-prism
- Light theme, search/filter, routing, multi-user, persistence, deployment wiring

## Tasks (vertical slices)

1. Scaffold: `bunfig.toml` → `bunx create-vite` (react-ts) → `bun install` → Tailwind v4 + `shadcn init` (radix-nova) + card/badge/switch/sonner → `motion`, `gsap`, `lucide-react`
2. Contract: `src/blocks/types.ts` (hand-written), conventions file for the coding CLI
3. Shell: header/footer credits, reduced-motion switch, `ShowcaseSection` + `ShowcaseCard` + registry — one aider/DeepSeek session
4. Pieces — one aider/DeepSeek session per piece (block + demo), run in parallel
5. Review, `bun run build` + `bun run lint` (oxlint), hand-fix; raw DeepSeek output and fixes in separate commits
6. Visual QA via Playwright screenshots (layout bugs don't show in the build), reduced-motion check, console errors
7. Artifacts: full-page screenshot + 20–40 s webm into `artifacts/`

## Stack

| Choice | Rationale |
|--------|-----------|
| Bun | Monorepo default runtime / package manager |
| Vite + React 19 + TypeScript | Same light SPA scaffold as sibling apps |
| Tailwind v4 + shadcn/ui (radix-nova) | Minimal primitives, same preset as siblings |
| motion | ObsidianUI's animation layer for springs, layout, AnimatePresence |
| gsap | ObsidianUI uses GSAP for marquee / text reel / hover-image; ticker + quickTo |
| Raw WebGL + Canvas 2D | Shader effects without three.js weight |
| aider + DeepSeek `deepseek-v4-pro` | Owner-requested: code written by a coding CLI |
| Playwright (box install, not a dependency) | Screenshot + video artifacts |

## Deferred

- Remaining ObsidianUI pieces (sidebar-stackbits, skeuomorphic music card, playground navbar, smooth-scroll, visitor count) — cut for scope
- Syntax highlighting in the source viewer — plain `<pre>` is enough
- Tests — visual components with no critical logic; build + lint + Playwright QA is the gate
