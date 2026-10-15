# xbm verification map

One file per demo in `apps/*`. Each says how a user reaches the demo, how an agent drives its main interaction with `scripts/verify.ts` (the `DRIVES` table in that script is the executable copy of these recipes), and what observable state proves it works. Read this index, then the demo's file.

## Baseline preconditions

- `bash scripts/build-all.sh [slug…]` succeeded; `dist/<slug>/index.html` exists.
- The harness serves `dist/` itself on a random `127.0.0.1` port; never drive someone else's dev server or the user's browser.
- Chromium: Playwright's, or `CHROMIUM_PATH` pointing at one.

## Driving conventions

- Prefer ARIA roles + accessible names (`getByRole`), then stable attributes (`aria-label`, `href`). No coordinates.
- Proof = UI state changed after the user action (URL, headings, control labels, aria/data state, live regions, iframe/img src, element count) plus any `expectText`, backed by before/after screenshots, an ARIA snapshot and a video.
- A recipe that can't reach its precondition FAILS with the reason in `STATUS.md`; never weaken the recipe to make it pass. Put the cause under that demo's Gotchas.

## Feature entry contract

H1 title + one paragraph, then exactly: `Sub-features`, `How to get to it (user POV)`, `Driving it with scripts/verify.ts`, `Gotchas`. When you add a demo, add its file here **and** its `DRIVES` entry in `scripts/verify.ts`.

## Demos

- [Answer me with HTML](./answer-me-with-html.md) — `answer-me-with-html`
- [AntV Infographic gallery](./antv-infographic.md) — `antv-infographic`
- [ascii.rest](./ascii-rest.md) — `ascii-rest`
- [docu.md](./docu-md.md) — `docu-md`
- [figures4papers](./figures4papers.md) — `figures4papers`
- [Focus Mk3, opened up](./focus-mk3-anatomy.md) — `focus-mk3-anatomy`
- [Hairline 细线实验室](./hairline.md) — `hairline`
- [obsidian-ui](./obsidian-ui.md) — `obsidian-ui`
- [Open Intelligent UI](./open-intelligent-ui.md) — `open-intelligent-ui`
- [pdfcn](./pdfcn.md) — `pdfcn`
- [Shadcn Admin](./shadcn-admin.md) — `shadcn-admin`
- [SlideBlocks](./slideblocks.md) — `slideblocks`
- [snapcn 产品演示组件](./snapcn.md) — `snapcn`
- [spectrum-ui](./spectrum-ui.md) — `spectrum-ui`
- [TanStack Charts](./tanstack-charts.md) — `tanstack-charts`
- [transitions-dev](./transitions-dev.md) — `transitions-dev`
