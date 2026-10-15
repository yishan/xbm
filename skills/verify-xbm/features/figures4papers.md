# figures4papers

Paper-style Without vs With Jev A/B figures from a recorded local-run proxy.

## Sub-features

- `dataset-tab` Main · 200k timing / Secondary · Five-task proxies
- `chart-type` Bar / Radar / Line tabs
- `export-png` Export PNG

## How to get to it (user POV)

- Open `https://li.yishan.app/figures4papers/` (or the gallery card on `https://li.yishan.app/`), locally `http://127.0.0.1:<port>/figures4papers/` from `dist/`.
- Choose a chart-type tab above the figure.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh figures4papers` succeeded and `dist/figures4papers/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** Run `bun scripts/verify.ts figures4papers`. The `DRIVES["figures4papers"]` recipe clicks role tab "Radar". The Radar tab becomes selected (`aria-selected`) and the figure re-renders.
- **Proof.** `.verify/<run>/figures4papers/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md` with `drive ✅ … UI state changed`.
- **Other sub-features.** Drive them by hand with Playwright (same server, same handles listed above) and save screenshots into the same run dir; do not report them as verified by the default recipe.

## Gotchas

- Export PNG triggers a download; capture it with `page.waitForEvent("download")` if you drive it.
