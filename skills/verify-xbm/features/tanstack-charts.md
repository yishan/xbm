# TanStack Charts

Six responsive SVG charts on TanStack Charts 1.1, including a launch timeline with a brushX date-range brush.

## Sub-features

- `timeline-mode` Per day / Cumulative toggle
- `series` Show New demo / Demo update / Fix / Infra
- `brush` brushX range + Reset range
- `theme` Toggle dark mode

## How to get to it (user POV)

- Open `https://li.yishan.app/tanstack-charts/` (or the gallery card on `https://li.yishan.app/`), locally `http://127.0.0.1:<port>/tanstack-charts/` from `dist/`.
- Choose `Cumulative` on the Demo launch timeline toggle.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh tanstack-charts` succeeded and `dist/tanstack-charts/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** Run `bun scripts/verify.ts tanstack-charts`. The `DRIVES["tanstack-charts"]` recipe clicks css `[aria-label="Cumulative"]`. The toggle item becomes on (`data-state`) and the timeline redraws as running totals.
- **Proof.** `.verify/<run>/tanstack-charts/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md` with `drive ✅ … UI state changed`.
- **Other sub-features.** Drive them by hand with Playwright (same server, same handles listed above) and save screenshots into the same run dir; do not report them as verified by the default recipe.

## Gotchas

- `getByRole("button", {name: "Cumulative"})` times out (toggle-group item); use the aria-label selector.
