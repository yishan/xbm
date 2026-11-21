# Monohud

A cockpit built from real Monohud components — tactical volume, radar, ship hologram, warp starfield and cell meters — with every numeric prop on a control: signal distortion, alert level, theme, warp, planet, hull integrity, cells and gap.

- Library: [Monohud](https://github.com/jshguo-labs/monohud) by Joshua Guo (MIT, © 2026), `@monohud/react` + `@monohud/css` 0.1.0 on Base UI 1.9. Fonts: Geist Mono (OFL).
- Monohud ships dark only; `src/index.css` adds a light scheme by remapping its `--mh-*` tokens (unlayered, so no `!important`) and printing the starfield as a negative. The page follows `prefers-color-scheme`, with a toggle.
- Every setting lives in the URL hash; **Copy JSX** copies the matching `MonohudProvider` snippet.
- Guardrails: `prefers-reduced-motion` forces `motion="off"`; Jump fires the starfield white-out at most once per second and never when motion is off.
- Run: `bun install && bun run dev` → http://localhost:5173/monohud/
- All ships, contacts and log lines are 示例数据.
