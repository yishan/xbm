# SlideBlocks — plan

## Goal

Show what a SlideBlocks-style deck looks like as a small web slide viewer: one 10-slide Chinese deck on 「Personal Agent 的发展现状」 with block layouts, keyboard navigation, an overview grid and a light/dark theme.

## Single-user MVP

In:
- One deck, 10 slides, text from `deck-copy.md` (Social Writing, approved by Yishan on 2026-10-05). No new statistics.
- One layout component per slide kind: title, agenda, definition (comparison + checklist), timeline, capability-layer diagram, product comparison grid, challenge cards, trend cards, metric cards, closing (summary + callout).
- Fixed 1280 × 720 slide canvas, scaled to fit the window (the SlideBlocks quality floor uses this viewport).
- Keyboard: ← / → / Space / PageUp / PageDown / Home / End; `O` or Esc toggles the overview grid; `D` toggles dark mode.
- Overview grid with live thumbnails; click a slide to jump.
- Light / dark / system theme. Slide colours come from `--sb-*` CSS variables.
- URL hash `#/<n>` for the current slide (same scheme as the upstream live sample).
- Links to the upstream repo and the live sample; MIT credit in the README and the UI.
- CJK-capable system font stack (PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans CJK SC).

Out:
- Slidev runtime, presenter view, drawing, PDF / offline HTML export, in-place text editing.
- Any backend. No Cloudflare Worker.
- Third-party images. All visuals are CSS / inline SVG.

## Tasks (vertical slices)

1. Scaffold (`bun create vite` react-ts), `bunfig.toml`, shadcn setup copied from the known-good `apps/pdfcn` config, `base: "/slideblocks/"`.
2. Deck data model (`src/lib/deck-types.ts`) and deck content (`src/lib/deck.ts`).
3. Slide shell + 10 slide layouts (`src/components/slides/`).
4. Viewer: scaled stage, toolbar (prev/next, counter, overview, theme, links), progress bar, keyboard, hash routing.
5. Overview grid.
6. README, screenshot, video, tracking entry, PR.

## Stack

- Vite + React 19 + TypeScript: same as the other xbm demos; passes the root build reliably.
- Tailwind v4 + shadcn/ui (radix-nova, neutral): chrome buttons, dropdown, tooltip.
- lucide-react: icons.
- Slidev was considered (pick.md prefers it), but the React route is the known-good path for `scripts/build-all.sh` and keeps one toolchain in the repo.

## Code authorship

DeepSeek (`openai/deepseek-flash` via aider) writes the slide layouts, viewer, toolbar and overview, one component per aider request. Hand-written: config, CSS tokens, data types, theme provider, glue and fixes.

## Deferred

- Presenter view with notes and timer.
- PDF export (would need the Cloudflare Browser Rendering Worker, as in pdfcn).
- Slide transitions beyond a short fade.
