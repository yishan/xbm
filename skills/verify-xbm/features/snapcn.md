# snapcn 产品演示组件

Remotion product-demo components (AI answer stream, terminal, phone shell, karaoke captions, title reveal) previewed live in Remotion Players.

## Sub-features

- `player` Play / Pause / Mute / Fullscreen on each player
- `gallery` component gallery
- `theme` 切换到深色模式

## How to get to it (user POV)

- Open `https://li.yishan.app/snapcn/` (or the gallery card on `https://li.yishan.app/`), locally `http://127.0.0.1:<port>/snapcn/` from `dist/`.
- Press Play on a player in the 发布短片 or 组件画廊 sections.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh snapcn` succeeded and `dist/snapcn/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** Run `bun scripts/verify.ts snapcn`. The `DRIVES["snapcn"]` recipe clicks role button "Play video" (first). That player switches to playing: its button reads `Pause video`.
- **Proof.** `.verify/<run>/snapcn/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md` with `drive ✅ … UI state changed`.
- **Other sub-features.** Drive them by hand with Playwright (same server, same handles listed above) and save screenshots into the same run dir; do not report them as verified by the default recipe.

## Gotchas

- Some players autoplay; the first player starts paused. Frames change constantly, so compare control labels, not pixels.
