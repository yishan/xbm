# INITIĀLIS 装饰首字母

A demo of [INITIĀLIS](https://github.com/azlen/initialis) by Azlen Elza (MIT): tune a generative decorated initial with sliders and a live preview, pick from a variation grid, export PNG or settings JSON, and watch it grow into a 有所启发-style article opening whose body text wraps around the drawn letter (示例数据).

- Library vendored under `public/initialis/` (upstream commit in `UPSTREAM_COMMIT`), loaded at runtime via `import.meta.env.BASE_URL`.
- `bun install && bun run dev` · build: `bun run build`.
- Needs WebGL2 + module workers.
