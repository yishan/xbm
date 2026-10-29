# dithercn — MVP plan

## Goal

One page that shows what the **dithercn** engine (`lib/dither`, installed from the shadcn registry together with its agent skill) can draw: moving GLSL fields, static SVG fills for charts, image dithering with export, and a playground for your own field — in light and dark, with reduced motion.

Source: [@leodev on X](https://x.com/leodev/status/2114688757404447027) · [dithercn.dev](https://dithercn.dev) · [opencoredev/dithercn](https://github.com/opencoredev/dithercn) (MIT).

## Single-user MVP

In scope:
- Install the engine + agent skill with `shadcn add https://dithercn.dev/r/dithercn-skill.json` (source in `src/lib/dither/`, skill in `.agents/skills/dithercn/`). Keep the MIT notice (`src/lib/dither/LICENSE`) and credit @leodev / dithercn.dev on the page.
- **Hero**: a full-width dithered field (`DitherShader`, drifting aurora/clouds) with the title on clear ground.
- **Dashboard** (all 示例数据, morning-brief style numbers): dithered bar chart (items per brief, `FillPattern` ramps), gauge (reading minutes, SVG arc), ridgelines (reading activity by hour, one row per day).
- **Image**: a public-domain photo (NASA *Earthrise*) dithered with `ditherImage` — method / threshold / cell size controls, theme ink & paper, PNG + SVG download (`toPNG`, `toSVG`, `download`).
- **Playground**: preset GLSL fields (aurora, contours, rings, waves) with sliders (scale, speed, cell, levels) and matrix select, plus an editable field.
- **Motion**: engine pauses offscreen; OS `prefers-reduced-motion` gives a still frame; a page switch forces the still frame so the behaviour is visible.
- `prefers-color-scheme` on first load + light/dark toggle; ink/paper follow `--primary` / `--background`.

Out: installing the 52 example components, a backend, user accounts, persistence.

## Tasks (vertical slices)
1. Scaffold: `bun x create-vite` react-ts, `bunfig.toml`, Tailwind v4, shadcn radix-nova init, dithercn skill + engine, ui (card, badge, slider, switch, tabs, select, label).
2. Data + presets: `src/lib/brief-data.ts`, `src/lib/fields.ts`, `src/hooks/use-theme.ts`.
3. Components, one aider (DeepSeek) request each: hero, bar chart, gauge, ridgelines, image dither, playground, motion panel.
4. App shell: header + theme toggle + motion switch, sections, credits/MIT footer.
5. build-all, shoot, verify-xbm (DRIVES + features file), screenshot QA (DPR 1.5 for WebGL), tracking entry, PR.

## Stack
- Vite + React 19 + TS — official scaffold, one screen.
- Tailwind v4 + shadcn/ui (radix-nova) — repo default; dithercn needs both.
- dithercn engine (source, MIT) — WebGL shader, SVG fills, image dithering, export; no npm runtime dependency added.

## Deferred
- Installing dithercn's example components — the point is to build our own on the engine, like the skill says.
- Web Worker for large images — the sample is downscaled to ≤ 320 px cells.
- GLSL error display in the UI — the engine logs compile errors to the console and keeps the fallback.
