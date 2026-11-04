# Base UI — motion & surface lab

Goal: one screen where real `@base-ui/react` 1.9.0 components (Popover, Menu, Select, Dialog, Toast, Tabs, Slider) are styled only through Base UI's `data-*` state attributes and CSS variables, and a row of sliders retunes their motion and surfaces live.

## MVP
- Tuning row: duration, easing (named curves), enter scale + origin (trigger-aware `--transform-origin` vs center vs top), radius, shadow depth, accent hue (OKLCH). All write CSS variables on the lab root (no re-render of the board per tick beyond the panel itself).
- Board of real components, each with 示例数据 copy.
- State labels toggle: overlays the live `data-*` attributes (data-open, data-starting-style, data-ending-style, data-highlighted, data-side, data-activation-direction…) of every part, portals included.
- Slow motion switch (×5 duration).
- Copy CSS: one click copies the current variables + rules.
- prefers-color-scheme default with a theme toggle; prefers-reduced-motion disables transitions.

## Out of scope
Bezier editor, presets persistence, Tooltip/Accordion.

## Stack
Vite + React 19 + TS (create-vite react-ts), Tailwind v4, shadcn base-nova (Base UI flavored) for chrome, `@base-ui/react` 1.9.0 (MIT, published 2026-10-09, older than the 3-day minimumReleaseAge). Plain CSS file for the lab so the copied CSS is exactly what runs.

## Files
- `src/lab/tuning.ts` — tuning model, defaults, easing list, `toVars()` and `toCss()`.
- `src/lab/lab.css` — component styles keyed on data attributes + vars.
- `src/lab/TuningBar.tsx`, `src/lab/Board.tsx`, `src/lab/StateLabels.tsx`, `src/App.tsx`.

## Verify
`bash scripts/build-all.sh base-ui && bun scripts/verify.ts base-ui`; drive: open the Popover ("Open popover").
