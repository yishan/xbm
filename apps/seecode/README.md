# SeeCode 交互图解

用 SeeCode 把一段 JSON 渲染成可悬停高亮、点击看详情、逐步演示的动画图：xbm 夜间流水线、审批对话时序图、画廊上线甘特图，以及标注「示例数据」的产品流程图和桑基图，跟随系统深浅色。

- 来源：[Aryanutkarsh/SeeCode](https://github.com/Aryanutkarsh/SeeCode) v0.6.1（MIT，© Aryan Utkarsh），渲染器 vendored 在 `vendor/seecode/`，保留 `LICENSE` 与 `THIRD_PARTY_LICENSES.md`。SeeCode 不是 npm 包，本 demo 不新增任何 npm 依赖。
- 书签：https://x.com/GitHub_Daily/status/2111064619808948697
- 图在构建时生成：`scripts/build-diagrams.mjs` 读取 `src/specs/*.json`（甘特图由公开的 `tracking/seen-bookmarks.json` 生成），输出 `public/diagrams/*.html`，页面用同源 iframe 嵌入并同步深浅色。
- 前三张图只含公开信息；产品流程与桑基图为虚构的示例数据。图内字体从 Google Fonts 加载；页面不调用任何 SeeCode 服务。SeeCode 名称与标志归原作者，图右下角保留其水印。

```bash
bun install && bun run dev   # http://localhost:5173/seecode/
```
