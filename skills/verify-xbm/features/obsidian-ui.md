# obsidian-ui

11 signature ObsidianUI effects, each with Remount, Code and Copy controls, plus Light/Dark/System and Reduce motion.

## Sub-features

- `code-view` Code toggles the source panel
- `remount` Remount demo replays an effect
- `flip` Flip all on Flip Text
- `theme` Light / Dark / System

## How to get to it (user POV)

- Open `https://li.yishan.app/obsidian-ui/` (or the gallery card on `https://li.yishan.app/`), locally `http://127.0.0.1:<port>/obsidian-ui/` from `dist/`.
- Scroll to an effect card and choose `Code`.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh obsidian-ui` succeeded and `dist/obsidian-ui/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** Run `bun scripts/verify.ts obsidian-ui`. The `DRIVES["obsidian-ui"]` recipe clicks role button "Code" (first). The first card (Prism Beam) shows its source panel.
- **Proof.** `.verify/<run>/obsidian-ui/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md` with `drive ✅ … UI state changed`.
- **Other sub-features.** Drive them by hand with Playwright (same server, same handles listed above) and save screenshots into the same run dir; do not report them as verified by the default recipe.

## Gotchas

- `Flip all` is a transient animation that settles back to the same DOM; it is not a good proof target.
