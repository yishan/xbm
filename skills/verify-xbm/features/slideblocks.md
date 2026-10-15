# SlideBlocks

A 10-slide Chinese web deck on Personal Agent 的发展现状 with keyboard navigation, overview and theme.

## Sub-features

- `next-prev` 上一页 / 下一页 and arrow keys
- `overview` 总览 grid
- `theme` 切换主题

## How to get to it (user POV)

- Open `https://li.yishan.app/slideblocks/` (or the gallery card on `https://li.yishan.app/`), locally `http://127.0.0.1:<port>/slideblocks/` from `dist/`.
- Choose 下一页 or press →.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh slideblocks` succeeded and `dist/slideblocks/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** Run `bun scripts/verify.ts slideblocks`. The `DRIVES["slideblocks"]` recipe clicks role button "下一页". Slide 2 (agenda) replaces the title slide heading.
- **Proof.** `.verify/<run>/slideblocks/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md` with `drive ✅ … UI state changed`.
- **Other sub-features.** Drive them by hand with Playwright (same server, same handles listed above) and save screenshots into the same run dir; do not report them as verified by the default recipe.

## Gotchas

- Arrow keys only work when focus is in the deck, not in a button.
