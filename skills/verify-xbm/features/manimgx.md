# ManimGX 讲解动画画廊

Official ManimGX showcase scenes (quadratic formula, Fourier π, Lorenz) with GIF playback beside Python source.

## Sub-features

- `tabs` switch between 二次方程 / 傅里叶 π / Lorenz 吸引子
- `thumbs` thumbnail strip synced with tabs
- `theme` 切换深浅色

## How to get to it (user POV)

- Open `https://li.yishan.app/manimgx/` (or the gallery card on `https://li.yishan.app/`), locally `http://127.0.0.1:<port>/manimgx/` from `dist/`.
- Click a scene tab or thumbnail to switch the panel.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh manimgx` succeeded and `dist/manimgx/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** Run `bun scripts/verify.ts manimgx`. The `DRIVES["manimgx"]` recipe clicks role tab "傅里叶 π". The panel shows Fourier content (`expectText: /Fourier/`).
- **Proof.** `.verify/<run>/manimgx/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md` with `drive ✅ … UI state changed`.
- **Other sub-features.** Theme toggle and thumbnails: drive by hand with Playwright; do not report them as verified by the default recipe.

## Gotchas

- GIFs are large (especially Lorenz ~2.9 MB); first paint may wait on image decode. Prefer expectText / tab state over pixel diffs.
- Do not click any PDF export (none on this page).
