# focus-mk3-anatomy — MVP plan

## Goal

A single-user web demo of four working, interactive isometric "anatomy" figures of the owner's Ford Focus Mk3 sedan (C346, 1.6 Ti-VCT, PowerShift automatic): cam phasers, twin-clutch gearbox, electric power steering and Control Blade rear axle.

## Single-user MVP

**In scope**
- Four figures, each a real machine drawn as an isometric bench model that moves from a small pure model:
  - Ti-VCT twin cam phasers: rpm/load → oil-driven phaser angles → valve timing and overlap
  - PowerShift DPS6: pre-selection on the idle shaft and the hand-over between two dry clutches
  - EPAS: torsion-bar torque sensor, speed-dependent assist, belt-driven rack, Ackermann knuckles
  - Control Blade: multi-link kinematics solved live (camber, toe-in, blade flex through bump and rebound)
- Interaction on every figure: drag, buttons, keyboard, idle tour, reduced-motion still
- Follows the system light/dark setting (with a toggle), phone layout, an index page with thumbnails
- Runnable with `bun install && bun run dev` from this directory; static output in `dist/`, served by the shared deploy at `li.yishan.app/focus-mk3-anatomy/`

**Explicitly out of scope**
- Other Focus systems (start-stop, ABS/ESC, torque vectoring)
- WebGL effects, 3D turning, part-by-part explode
- Ford's exact calibrations (timing maps, assist curves, suspension hardpoints) — captions say where the drawing is illustrative
- Touching other apps or root monorepo tooling

## Outcome-oriented tasks

1. Gather published facts per system (ratios, timing-map ranges, steering ratio, link layout) and write each as a pure `model.mjs`.
2. Build each figure's geometry with the vendored anatomy kit; settle depth order and pass the geometry audit.
3. Wire the live page per figure (`live.js`): model → motion, readout, controls, tour.
4. Index page, shared nav, both themes, phone layout.
5. Verify: `bun run audit`, line-end checks, phone and theme captures; capture screenshot and demo video under `artifacts/`.

## Stack (with rationale)

| Choice | Rationale |
|--------|-----------|
| Bun | Monorepo default runtime and script runner |
| Plain ES modules generating static HTML/SVG | Each figure is pre-built SVG plus a small vanilla script; a framework and UI kit would add weight and nothing the figures use |
| Anatomy isometric kit (MIT, vendored in `vendor/anatomy`) | Prebuilt isometric solids, turned parts, painter's-order settling and geometry audit |
| `Bun.serve` static server (`serve.ts`) | Zero dependencies for `bun run dev` |

Deviation from the repo default (scaffold + shadcn/ui): there is no form UI to build — the page is generated SVG — so the scaffold and component library were skipped on purpose.

## Deferred

- Hover/tap a part to show its name and job (needs per-part hit targets; next step if wanted)
- Chinese captions
- WebGL oil flow in the phaser chambers
