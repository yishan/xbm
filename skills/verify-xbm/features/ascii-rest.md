# ascii.rest

Three pages built from ascii.rest animated ASCII works: a categorized gallery, an agent-fleet terminal page (`fleet.html`) and a plain page (`plain.html`).

## Sub-features

- `gallery-filter` 15 category chips (`all 217`, `ui 12`, `data 10`, …)
- `playback` fps / still / mono toggles
- `fleet` the agent fleet terminal page
- `theme` `switch to dark` button

## How to get to it (user POV)

- Open `https://li.yishan.app/ascii-rest/` (or the gallery card on `https://li.yishan.app/`), locally `http://127.0.0.1:<port>/ascii-rest/` from `dist/`.
- Open `/ascii-rest/`, choose a category chip; or follow the links to `fleet.html` / `plain.html`.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh ascii-rest` succeeded and `dist/ascii-rest/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** Run `bun scripts/verify.ts ascii-rest`. The `DRIVES["ascii-rest"]` recipe clicks role button /^data \d+/. The grid shows only the data category (element count and active chip state change).
- **Proof.** `.verify/<run>/ascii-rest/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md` with `drive ✅ … UI state changed`.
- **Other sub-features.** Drive them by hand with Playwright (same server, same handles listed above) and save screenshots into the same run dir; do not report them as verified by the default recipe.

## Gotchas

- Works animate continuously, so screenshots differ every frame; the harness compares element counts and chip state, not pixels.
