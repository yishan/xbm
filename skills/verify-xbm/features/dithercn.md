# dithercn 抖动引擎

dithercn engine demo: WebGL dithered hero field, dithered dashboard (bars / gauge / ridgelines, 示例数据), image dithering with PNG/SVG export, GLSL field playground, motion panel.

## Sub-features

- `hero` `[data-testid=hero-shader]` — DitherShader canvas; `data-state` running / paused / static / fallback
- `dashboard` `brief-bars`, `reading-gauge` (+ `gauge-slider`), `ridgelines` (+ `ridgelines-mono` switch)
- `image` `image-dither`: `image-method` select, `image-upload`, `export-png`, `export-svg` (downloads; status in `export-status`)
- `playground` `preset-aurora|contours|rings|waves` buttons (`aria-pressed`), sliders, `glsl-editor` + `apply-glsl`
- `motion` `force-still` switch (page-wide `animate=false`), `os-reduced-motion` badge, `engine-state`
- `theme` header toggle (aria-label 切换到深色模式 / 切换到浅色模式); first load follows `prefers-color-scheme`

## How to get to it (user POV)

- Open `https://li.yishan.app/dithercn/`, locally `http://127.0.0.1:<port>/dithercn/` from `dist/`. Scroll to 写你自己的场 and click 等高线.

## Driving it with scripts/verify.ts

- **Main interaction.** `DRIVES["dithercn"]` clicks `[data-testid=preset-contours]`; the playground shader switches field and the button becomes `aria-pressed=true`.
- **Proof.** `.verify/<run>/dithercn/before.png`, `after.png`, `drive.webm`, `STATUS.md`.

## Gotchas

- WebGL in headless Chromium runs on SwiftShader (~13 fps); screenshots at DPR 1.5 look best. Animated fields differ between runs.
- Don't drive the export buttons in automated runs (they trigger downloads). There is no PDF export.
- A broken custom GLSL field only logs a console error (the canvas falls back), so drives should use presets.
