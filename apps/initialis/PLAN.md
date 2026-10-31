# PLAN — initialis

**Goal:** a one-page, hands-on demo of INITIĀLIS (azlen/initialis, MIT): tune an ornamental drop cap with sliders, see variations, export it, and see it opening a 「有所启发」-style article with text wrapped round its shape.

## Single-user MVP
- Tuning panel: letter (A–Z), font, frame, ornament, texture and ink controls bound to upstream `PARAMS` (a curated ~14 of ~150), live preview, replay grow-in, seed shuffle.
- Variation grid: 8 variations of the current initial (`mutate` from upstream `styles.js`), click to adopt.
- Export: PNG (transparent and on paper) + copy / download settings JSON.
- In context: newsletter opening (「有所启发」style header, English public-domain passage, 示例数据), the initial floated with `shape-outside` from its own alpha.
- Theme follows `prefers-color-scheme` (toggle allowed); reduced motion skips the grow-in.
- Footer credit: INITIĀLIS by Azlen Elza (@azlenelza, initialis.azlen.me), MIT notice, fonts OFL / ET Book MIT.

**Out:** the infinite field, bookmarks/collections, share links (short links need upstream's API), zip/MP4/WebP export, WebGPU paper ageing, the Claude/GitHub marks.

## Tasks (vertical slices)
1. Vendor upstream `lib/ render/ src/{codes,breed}.js data/` unchanged into `public/initialis/` (commit 6cf93f7), LICENSE + THIRD-PARTY.md kept.
2. Bridge `src/lib/initialis.ts`: lazy import via `BASE_URL`, typed `draw / grow / render / random / mutate / fontList / PARAMS`.
3. `CapCanvas` (draw / grow, reduced motion), `TunePanel`, `VariationGrid`, `ExportBar`, `ArticleOpening`, `SiteHeader/Footer`, `App`.
4. emil review → polish → unslop pass; screenshots, verify, video, PR.

## Stack
- Vite + React + TS (create-vite react-ts): repo standard, static build at `/initialis/`.
- Tailwind v4 + shadcn/ui radix-nova: repo standard UI kit (slider, select, switch, tabs, button).
- INITIĀLIS vendored as static ES modules: no npm package exists; runs as-is with workers.
- Code by DeepSeek (aider, deepseek-flash), one component per request.

## Deferred
- Share links / collections (need upstream's server), multi-letter monograms (UI complexity), video export (heavy).

## Prototype decision (emil-prototype)

Three throwaway variants of the article opening in `public/__proto.html` (deleted after the pick): **Book** (60ch serif column, 132px cap, shape-outside wrap) — chosen; Newsletter (wider sans lede, cap boxed) and Broadside (huge cap, display layout) rejected: the newsletter cap looked like a thumbnail, the broadside fought the tuning panel for attention.
