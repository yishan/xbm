# PLAN — ascii.rest (xbm nightly 2026-10-09, manual start)

**Goal:** show what [ascii.rest](https://ascii.rest) ([bas3line/ascii](https://github.com/bas3line/ascii), MIT, v0.2.1) does, and use its pieces for one real page about Yishan's agent fleet.

## MVP scope
- **Gallery** (`index.html`, React): all 208 pieces read from the installed package, by category (15), with filter, fps (native / 24 / 8 / still) and mono toggles, light/dark.
- **Agent fleet terminal** (`fleet.html`, React): a status page built only from ascii.rest pieces fed with real data — nightly pipeline (19:55 pick / 22:00 build / 05:53 report), the 12 live demos and merged PRs from `git log --first-parent origin/main`, nightly run results from `/workspace/xbm-nightly/<date>/status.md`. Anything the piece simulates is labelled "example data".
- **Plain HTML** (`plain.html`): only `<ascii-art piece="…">` tags plus the `ascii.rest/element` module. No React.
- Credit + MIT notice (README, footer, `LICENSE-ascii.rest`).

## Out of scope
- Writing custom pieces (the piece contract allows it, but the fleet page must use library pieces only).
- Astro component, terminal CLI (`npx ascii.rest`), README SVGs.
- Any backend / Cloudflare Worker.

## Tasks
1. Scaffold (`bun create vite` react-ts), bunfig with the one-package release-age exception, Tailwind v4 + shadcn base, pin `ascii.rest` 0.2.1.
2. `scripts/gen-data.ts` → `src/data/pieces.json` (package meta) and `src/data/fleet.json` (git log + nightly notes).
3. Components by DeepSeek (aider, one per request): AsciiFrame, SiteHeader, SiteFooter, GalleryToolbar, PieceCard, Gallery, FleetPanel, Fleet, plain.html.
4. Build (pi trial on the first failure), hand fixes, root build-all, Playwright QA 1280×800 / 390×844 × light/dark, screenshot + video.

## Stack
- Vite multi-page + React 19 + TS: repo standard; three static pages under one base.
- Tailwind v4 + shadcn button: repo standard, minimal.
- ascii.rest 0.2.1 from npm (not vendored), pinned exactly.
