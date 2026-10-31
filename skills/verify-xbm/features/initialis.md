# initialis 装饰首字母

INITIĀLIS demo: generative decorated initial with a tuning panel + live preview, 8-up variation grid, PNG/JSON export, grow-in animation, and an article opening (示例数据) whose text wraps the cap via shape-outside.

## Sub-features

- `preview` big CapCanvas (role=img, 首字母预览); header 重播生长 replays the grow-in
- `tune` sidebar: 首字母 input (A–Z only), 字体 select, sliders (字号, 边距, 密度…), ink colour swatches, 恢复默认
- `variations` buttons 采用变体 1…8, 变化幅度 slider, 再来一组
- `export` 透明背景 switch, 512/1024/2048, 下载 PNG, 复制设置, 下载 JSON (status line aria-live)
- `article` 文章开头 section; cap floated with shape-outside from the canvas dataURL
- `theme` header toggle 切换深浅色; first load follows `prefers-color-scheme`; caps swap paper/ink A in dark

## How to get to it (user POV)

- Open `https://li.yishan.app/initialis/`, locally `http://127.0.0.1:<port>/initialis/` from `dist/`. Scroll to 变体 and click the first tile.

## Driving it with scripts/verify.ts

- **Main interaction.** `DRIVES["initialis"]` clicks 采用变体 1; preview and article cap redraw with that variation.
- **Proof.** `.verify/<run>/initialis/before.png`, `after.png`, `drive.webm`, `STATUS.md`.

## Gotchas

- Rendering runs in WebGL2 workers; headless Chromium uses SwiftShader, so a cap takes a few seconds. Wait ~10 s before screenshots.
- Don't drive export buttons in automated runs (downloads / clipboard).
