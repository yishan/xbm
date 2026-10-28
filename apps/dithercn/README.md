# dithercn 抖动引擎

用 dithercn 引擎做的一页抖动效果演示：WebGL 抖动场做首屏，早报风格的柱状图、仪表和山脊图都用抖动填充（全部是示例数据），一张 NASA《地出》照片可以换算法抖动并导出 PNG / SVG，最后是一个可以选预设、拖滑块、直接改 GLSL 的 field playground。跟随系统深浅色和「减少动态效果」，也可以手动整页静止。

## Sections

- **Hero** — full-width `DitherShader` field (ordered Bayer dither of a GLSL tone field), theme-coloured, pauses off-screen.
- **抖动仪表盘** — `FillPattern` bars (items per brief), a gauge (reading minutes, with a small shader glow) and hourly ridgelines; all tagged 示例数据.
- **图片抖动** — `ditherImage` on a sample photo (or your own upload): method, threshold, cell size, two-tone or theme palette; export PNG / SVG.
- **写你自己的场** — preset fields (aurora / contours / rings / waves), sliders for scale / intensity / speed / cell, matrix and colour picks, and an editable GLSL `field()` body.
- **动态** — shows the OS `prefers-reduced-motion` state, the engine's `data-state`, and a page-wide "force still" switch.

## Run

```bash
bun install && bun run dev   # http://localhost:5173/dithercn/
```

## Credits

- Engine and agent skill: [dithercn](https://dithercn.dev) by Leo ([@leodev](https://x.com/leodev), [opencoredev/dithercn](https://github.com/opencoredev/dithercn)), installed with `npx shadcn@latest add https://dithercn.dev/r/dithercn-skill.json`. MIT License — Copyright (c) 2026 Leo, Copyright (c) 2026 Shadcn Labs (startercn); full text in `src/lib/dither/LICENSE`. Bookmark: [Introducing dithercn](https://x.com/leodev/status/2114688757404447027).
- Sample photo: *Earthrise*, NASA / Bill Anders (Apollo 8, 1968), public domain.
- Built with React, Vite, Tailwind CSS (MIT) and shadcn/ui (MIT). Component code was written by DeepSeek (via aider) from our own specs; the engine is dithercn's, unmodified.
