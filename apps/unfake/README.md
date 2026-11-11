# Unfake

把发糊、放大过的像素图收回整齐的 1× 格子，或描成 SVG。台上的四张图是示例数据。

算法来自 [unfake.js](https://github.com/jenissimo/unfake.js)（MIT，commit `6636868`）。调色用这里自写的 median-cut。矢量描摹用 [imagetracer.js](https://github.com/jankovicsandras/imagetracerjs)（Unlicense）。

运行：`bun install && bun run dev`，打开 http://localhost:5173/unfake/。
