# focus-mk3-anatomy

Four interactive isometric figures of a Ford Focus Mk3 sedan (C346, 1.6 Ti-VCT, PowerShift automatic):

| Fig | Figure | Interaction |
|---|---|---|
| 1 | Ti-VCT twin cam phasers | Drag: left–right rpm, up–down load · keys 1–4 |
| 2 | PowerShift DPS6 twin dry clutch | Gear buttons or keys R, 1–6 · Space for the drive cycle |
| 3 | Electric power steering | Drag sideways to steer · speed buttons or keys 1–3 |
| 4 | Control Blade rear axle | Drag up and down for bump and rebound |

## Run

```bash
bun install
bun run dev
```

Then open http://localhost:4321. `bun run build` writes the static site to `site/` (deployable as-is); `bun run audit` re-runs every figure's geometry audit; `bun run thumbs` refreshes the index thumbnails (needs Chrome and Node).

## Layout

- `figures/<id>/` — `model.mjs` (the numbers), `build.mjs` (geometry and page), `live.js` (motion), CSS
- `lib/` — shared page chrome, drawing helpers, belt renderer
- `vendor/anatomy/` — the MIT-licensed isometric kit
- `assets/thumbs/` — index thumbnails

See [PLAN.md](./PLAN.md) for scope. Captions on each figure cite where numbers are published and where the drawing is illustrative.
