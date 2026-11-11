# unfake

Bench for recovering a crisp 1× sprite from a soft, upscaled pixel image, or tracing it to SVG. Samples are 示例数据. Pixel and Vector modes retune live; exports are 1× PNG, upscaled PNG, and SVG.

## Sub-features

- `samples` 示例数据 灯塔 / 蘑菇 / 骑士 / 药水, plus 打开, drop, and paste
- `pixel` 倍率, 自动, 取样, 颜色, 透明, 去杂点, 去斜刺, 网格
- `vector` 矢量, 去噪, 强度, 颜色, 平滑, 细节
- `compare` 对比 divider, loupe, palette swap
- `export` 1× PNG, 放大 PNG, SVG, 设置
- `theme` 系统 / 浅色 / 深色

## How to get to it (user POV)

- Open `https://li.yishan.app/unfake/`, locally `http://127.0.0.1:<port>/unfake/` from `dist/`.
- The lighthouse sample processes on load. Click `矢量`.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh unfake` succeeded and `dist/unfake/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** `bun scripts/verify.ts unfake` clicks role tab "矢量"; the panel shows 去噪.
- **Proof.** `.verify/<run>/unfake/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md`.
- **Other sub-features.** Drive by hand with Playwright against the same server: divider, color slider, palette chip, sample buttons, exports, 390px, light, dark, reduced motion.

## Gotchas

- Heavy steps run in a worker. The first pixel result can land after the doctor screenshot; the tab switch does not wait on it.
- Palette quantization is an in-repo median-cut. Output will not match upstream WASM palettes.
- Integer grids only. Fractional and elastic fitting from the upstream core are not in this build.
