# Hairline 细线实验室

Explore 33 isometric interactive hairline figures by category, then simulated collaboration and agent-workflow scenes.

## Sub-features

- `tab-01` 01 组件体验: catalog with 9 category filters (`全部图形 33` …)
- `tab-02` 02 协作场景: simulated Dicembre → Grok → Muse task
- `tab-03` 03 Agent 工作流: Relay / Rebuild / Stack / Format / Settle
- `skip-link` 跳转到体验区

## How to get to it (user POV)

- Open `https://li.yishan.app/hairline/` (or the gallery card on `https://li.yishan.app/`), locally `http://127.0.0.1:<port>/hairline/` from `dist/`.
- Choose a top tab `01 组件体验` / `02 协作场景` / `03 Agent 工作流`, or a category chip.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh hairline` succeeded and `dist/hairline/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** Run `bun scripts/verify.ts hairline`. The `DRIVES["hairline"]` recipe clicks role button /^02 协作场景/. The experience area switches to the collaboration scene (headings and pressed state change).
- **Proof.** `.verify/<run>/hairline/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md` with `drive ✅ … UI state changed`.
- **Other sub-features.** Drive them by hand with Playwright (same server, same handles listed above) and save screenshots into the same run dir; do not report them as verified by the default recipe.

## Gotchas

- Scenes are scripted sample data; nothing is sent anywhere.
