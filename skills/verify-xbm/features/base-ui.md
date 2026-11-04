# base-ui

Motion & surface lab: real Base UI 1.9 components (Popover, Menu, Select, Dialog, Toast, Tabs, Slider) retuned live by a slider row (duration, easing, scale + origin, radius, shadow, hue), with state labels, slow motion and Copy CSS.

## Sub-features

- `popover` Open popover
- `menu` Actions
- `select` Select trigger (荔枝 Lychee)
- `dialog` Open dialog / Cancel / Publish
- `toast` Show toast
- `tuning` sliders Duration / Scale / Radius / Shadow / Hue, Easing select, origin buttons
- `inspect` States switch, Slow ×5 switch, Copy CSS

## How to get to it (user POV)

- Open `https://li.yishan.app/base-ui/`, locally `http://127.0.0.1:<port>/base-ui/` from `dist/`.
- Click `Open popover`.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh base-ui` succeeded and `dist/base-ui/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** `bun scripts/verify.ts base-ui` clicks role button "Open popover"; the popup with "Rollout 示例" appears and the trigger gets `aria-expanded=true`.
- **Proof.** `.verify/<run>/base-ui/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md`.
- **Other sub-features.** Drive by hand with Playwright against the same server.

## Gotchas

- Tuning vars are set on `<html>` so portaled popups inherit them.
- Toasts auto-dismiss after ~5 s.
