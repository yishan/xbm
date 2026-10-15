# Focus Mk3, opened up

Four isometric working models (cam phasers, DPS6 gearbox, EPAS steering, Control Blade axle), each on its own static page with a tour.

## Sub-features

- `model-page` index → `tivct.html`, `dps6.html`, `epas.html`, `blade.html`
- `tour` each model runs its tour / reacts to drag and keys
- `theme` `dark theme` button

## How to get to it (user POV)

- Open `https://li.yishan.app/focus-mk3-anatomy/` (or the gallery card on `https://li.yishan.app/`), locally `http://127.0.0.1:<port>/focus-mk3-anatomy/` from `dist/`.
- From `/focus-mk3-anatomy/` choose a model card link.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh focus-mk3-anatomy` succeeded and `dist/focus-mk3-anatomy/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** Run `bun scripts/verify.ts focus-mk3-anatomy`. The `DRIVES["focus-mk3-anatomy"]` recipe clicks css `a[href="dps6.html"]`. Navigation to `dps6.html`; page text contains `DPS6`.
- **Proof.** `.verify/<run>/focus-mk3-anatomy/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md` with `drive ✅ … UI state changed`.
- **Other sub-features.** Drive them by hand with Playwright (same server, same handles listed above) and save screenshots into the same run dir; do not report them as verified by the default recipe.

## Gotchas

- Not a Vite app: built by `build.mjs`, dev via `bun run dev` (serve.ts). The browser's own favicon 404 is ignored by the harness.
