# SeeCode 交互图解

Five SeeCode diagrams (pipeline, approval sequence, gallery Gantt, sample product flow, sample Sankey) rendered at build time and embedded as same-origin iframes, with step-through and node details.

## Sub-features

- `tabs` 夜间流水线 / 审批对话 / 上线时间线 / 产品流程 / 需求流转
- `step` 上一步 / 下一步 / 重播 (drives the diagram's own ◀ ▶ Replay buttons; status text 「第 N 步」)
- `details` click a node in the diagram or a chip in 节点说明 → description
- `hover` SeeCode's own hover highlight inside the iframe
- `theme` 切换深浅色 (also sets `data-theme` inside each iframe)

## How to get to it (user POV)

- Open `https://li.yishan.app/seecode/` (or the gallery card on `https://li.yishan.app/`), locally `http://127.0.0.1:<port>/seecode/` from `dist/`.
- Pick a tab, press 下一步 to walk the diagram, click a node for its description.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh seecode` succeeded and `dist/seecode/index.html` + `dist/seecode/diagrams/*.html` exist.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** Run `bun scripts/verify.ts seecode`. The `DRIVES["seecode"]` recipe clicks tab 「审批对话」 then button 「下一步」; the status shows 「第 1 步」 (`expectText: /第 1 步/`).
- **Proof.** `.verify/<run>/seecode/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md` with `drive ✅ … UI state changed`.
- **Other sub-features.** Node details, hover and theme sync: drive by hand with Playwright (`frameLocator('iframe').locator('[data-sc-node="approval"]')`); do not report them as verified by the default recipe.

## Gotchas

- The diagram HTML loads IBM Plex / Fraunces from Google Fonts; offline runs fall back to system fonts (no console error expected, but check).
- SeeCode's in-diagram Export menu loads encoders from jsDelivr; don't click it in verification.
- `public/diagrams/` is generated (gitignored); `bun run build` regenerates it and `src/specs/gallery-gantt.json` from tracking.
