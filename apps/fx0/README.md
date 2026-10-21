# fx0 设计风格对比

同一份产品需求（「Pulse 笔记」定价页），用 fx0 内置的四种 design.md 风格并排渲染，并预览「提示词 → 单文件 HTML」的逐轮版本。全部为预先生成的示例数据，不调用模型。

## 运行

```sh
bun install && bun run dev
# http://localhost:5173/fx0/
```

## 说明

- 原项目：[vercel-labs/fx0](https://github.com/vercel-labs/fx0)（Apache-2.0，见 `LICENSE-fx0`）。本 demo 不包含 fx0 源码。
- 风格预设名与色板取自 fx0 的 `lib/design-md/`，来源 [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)（MIT，见 `LICENSE-design-md` 与 `NOTICE`）。
- 跟随系统明暗主题（可切换），iframe 内的渲染结果同步切换。

## 观察（示例）

- 同一 brief 下，风格差异主要体现在色板、圆角、字重与留白；信息结构基本一致。
- 逐轮修改会累积：第 2 轮加入年付开关，第 3 轮加入常见问题。真实使用中模型偶尔会丢掉前一轮的改动，需要在提示词里显式要求保留。
