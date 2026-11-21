# monohud

Cockpit playground built from real Monohud components: tactical volume, radar, hologram, warp starfield, cell meters, with a control deck for every numeric prop.

## Sub-features

- `tactical` group "Tactical volume" (drag / arrow keys orbit); contact buttons Warden, Kestrel, Halcyon, Drift swarm; Lock (aria-pressed), Fire, Jump
- `scope` Radar "Short-range radar" with the same contacts
- `target` DataList + Integrity meter (drops on Fire)
- `log` "Event log" (role=log)
- `controls` radiogroups Theme / Alert / Motion / Hull model; sliders Signal, Hull, Warp, Planet, Cells, Gap; switch "Signal follows hull"
- `top` Reset, Copy JSX (toast), Switch to light/dark theme

## How to get to it (user POV)

- Open `https://li.yishan.app/monohud/`, locally `http://127.0.0.1:<port>/monohud/` from `dist/`.
- Click the `Red` alert radio.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh monohud` succeeded and `dist/monohud/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** `bun scripts/verify.ts monohud` clicks radio "Red"; the log shows `Alert red` and the hash gains `a=red`.
- **Proof.** `.verify/<run>/monohud/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md`.
- **Other sub-features.** Drive by hand with Playwright against the same server.

## Gotchas

- Role names are substring matches: "Ion" also matches "Caution" — use `exact: true` for Theme radios.
- Starfield needs WebGL2; without it Monohud falls back to a flat dark surface (headless Chromium: `--use-angle=swiftshader`).
- Jump is disabled for 1 s after each press (flash guardrail).
