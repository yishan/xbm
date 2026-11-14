# UI SDK

把 @ui-sdk/core 0.1.0-beta.2 的弹出层、选择、键入定位、焦点回收和拖动排序拆开，开关后看每个槽位的 ARIA 与焦点。需求板用示例数据，按脚本请求组装对应控件，并显示生成的 primitive。

上游是 [vercel-labs/ui](https://github.com/vercel-labs/ui)（Apache-2.0，`@ui-sdk/react` 与 `@ui-sdk/core` 钉在 `0.1.0-beta.2`）。声明见 `THIRD_PARTY_LICENSE.txt`。

运行：`bun install && bun run dev`，打开 http://localhost:5173/ui-sdk/。`bunfig.toml` 只对这两个包名放行 3 天年龄，其余依赖仍遵守 `minimumReleaseAge = 259200`。
