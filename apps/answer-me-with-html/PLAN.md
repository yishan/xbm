# PLAN — Answer me with HTML (xbm nightly 2026-10-08, manual start)

**Goal:** show what the `am` CLI from [QingYunA/answer-me-with-html](https://github.com/QingYunA/answer-me-with-html) (MIT, v0.4.14) produces, using pages about xbm itself.

## MVP scope
- 5 Markdown drafts in `drafts/`, rendered by the upstream CLI (`am render`) into single-file offline HTML in `public/pages/` (committed; the root build does not need the CLI).
  1. Nightly pipeline (sequence) — AGENTS.md + pick/status notes
  2. Vercel frontend vs Cloudflare Worker backend (table) — AGENTS.md
  3. Gallery timeline — `git log --merges --first-parent origin/main`
  4. Upstream TCP example (reference, copied from `examples/tcp.en.md`)
  5. STE100 mode page (`style: strict`) — upstream `examples/ste100.md` rules
- Gallery shell (Vite + React + shadcn/ui minimalist): card per page, theme (blueprint / shadcn / paper) × light/dark switch that loads the pre-rendered variant in an iframe, "draft vs page" side-by-side view, README benchmark quote with link.
- Credit + MIT notice in README and UI.

## Out of scope
- `am video` (needs TTS for the narrated version; skipped), ElevenLabs, any backend / Cloudflare Worker.

## Tasks
1. Scaffold (create-vite react-ts), bunfig, shadcn button, build passes.
2. Drafts (DeepSeek, one per request) → `scripts/render-pages.sh` → 5 pages × 3 themes × 2 modes = 30 HTML files + `pages.json` manifest.
3. Shell components (DeepSeek, one per request), hand fixes.
4. Build, root build-all, Playwright QA 1280×800 / 390×844 light+dark, screenshot + video.

## Stack
- Vite + React + TS: repo standard, static.
- Upstream CLI run from a local clone at build/commit time (Node 20); output committed.
