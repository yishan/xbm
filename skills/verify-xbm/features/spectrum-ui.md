# spectrum-ui

12 animated components for AI-agent UIs (3D tilt card, toast stack, agent task runners …) with Remount / Code / Copy.

## Sub-features

- `toast-stack` Run agent task / Fail / Dismiss toast
- `task-pick` Research / Refactor / Summarize
- `code-view` Code / Copy source

## How to get to it (user POV)

- Open `https://li.yishan.app/spectrum-ui/` (or the gallery card on `https://li.yishan.app/`), locally `http://127.0.0.1:<port>/spectrum-ui/` from `dist/`.
- Scroll to Toast Stack and choose `Run agent task`.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh spectrum-ui` succeeded and `dist/spectrum-ui/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** Run `bun scripts/verify.ts spectrum-ui`. The `DRIVES["spectrum-ui"]` recipe clicks role button "Run agent task". A toast appears in the stack.
- **Proof.** `.verify/<run>/spectrum-ui/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md` with `drive ✅ … UI state changed`.
- **Other sub-features.** Drive them by hand with Playwright (same server, same handles listed above) and save screenshots into the same run dir; do not report them as verified by the default recipe.

## Gotchas

- Toasts auto-dismiss; capture the after-state within a few seconds.
