# Monohud — plan

Pick: Monohud (https://x.com/jshguo/status/2122653563080024522), approved 2026-11-21.

## Scope (single page)
- Bridge: `Cockpit` with left `Wing` (Ship: `Hologram`, Hull `Meter`, Shields / Jump charge `Progress`, Velocity `Readout`, Reactor `Gauge`), center `TacticalVolume` with Lock / Fire / Jump, right `Wing` (Target `DataList` + integrity `Meter`, Scope `Radar`, `LogStream`).
- `Starfield` behind everything (warp, planet body, jump flash).
- Control deck (Monohud `RadioGroup`, `Slider`, `Switch`): theme, alert, motion, hull model, signal (optionally linked to hull damage), hull, warp, planet, cells, gap.
- Top bar: Reset, Copy JSX (toast), light/dark toggle.
- State in URL hash (non-default keys only); target integrity, lock and log are session state.

## Constraints
- DESIGN.md: no taglines, helper text or secondary labels (no Panel meta/footer, no Readout notes).
- Light + dark (Monohud is dark-only → token remap), reduced motion, ≤3 flashes/s, 44px touch targets, no horizontal scroll at 390px.
- Code written with DeepSeek (aider, local) — not cloud agents; hand glue only for config, tokens and fixes.

## Verify
`bash scripts/build-all.sh monohud && bun scripts/verify.ts monohud`; Playwright at 1280 / 390, light / dark / reduced motion.
