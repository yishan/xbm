# Unfake

## Goal

一个单人工作台：把放大发糊的像素图收成对齐的 1× 精灵，或描成 SVG，旋钮即时可见。

## MVP

- 四张自绘示例（标为示例数据），外加拖入、粘贴、打开本地图。
- 像素模式：自动或手动倍率、主色 / 中值 / 自适应 / 最近取样、颜色上限、去杂点、去斜刺、透明阈值、网格。
- 矢量模式：去噪、颜色、平滑、细节，用 imagetracer.js 出 SVG。
- 对比分割线、像素放大镜、色块点选换色。
- 导出 1× PNG、放大 PNG、SVG，复制设置 JSON。
- 重计算在 Web Worker 里。跟随系统明暗，可改浅色或深色。

## 不做

- 不打包 unfake-core 的 WASM，也不包含 libimagequant。
- 不做分数格和弹性格。那部分只在上游 WASM 里，整数格检测来自 MIT 的 JS 回退。
- 不接后端，不上传图片。

## 任务

1. 用 Vite + React + Tailwind v4，`base` 为 `/unfake/`。
2. 把倍率检测、对齐裁切、取样缩小、形态学和斜刺清理、透明二值化从 MIT 源码改写成 TypeScript。
3. 自写 median-cut 调色。矢量预滤波按 MIT 的 bilateral / median / gaussian 改写，描摹用 Unlicense 的 imagetracer.js。
4. 做出工作台，并用 `bun test` 锁住格子检测、裁切、调色和体积。

## 技术选择

- Vite + React：单页工作台。
- Tailwind v4：令牌和工具类。
- IBM Plex Sans / Mono：拉丁文和读数；中文走系统字体。
- Bun：安装、测试、示例图脚本。`minimumReleaseAge = 259200`。
- Web Worker：滑块留在主线程。

## 推迟

- 分数周期和弹性格子。需要上游 WASM 里的另一套拟合，整数格已经能对上示例。
- 固定调色板文件导入。点选换色覆盖眼前这一步。
