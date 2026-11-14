# UI SDK

## Goal

一个单人实验台：开关 UI SDK 的弹出层、选择、键入定位和焦点回收，并按三条示例请求把这些行为装成一个控件。

## MVP

- 行为实验室：负责人、状态、环境三列。弹出层、单选/多选、键入定位、焦点回收可开关。检查器读真实 DOM 的槽位、ARIA 和焦点。
- 组装：示例需求板。请求为「按负责人筛选」「多选标签」「拖动调整优先级」。旁边是对应 primitive 源码。
- 外观：圆角、密度、动效。跟随系统明暗，可改浅色或深色。
- 依赖钉死 `@ui-sdk/react` 与 `@ui-sdk/core` 的 `0.1.0-beta.2`。`bunfig` 只排除这两个包名。

## 不做

- 不调用模型，不接后端，不用真实项目数据。
- 不使用未公开的 `selectPreset`。弹出层用 `popoverPreset`，列表本身是 `listbox`。
- 不把 primitive 做成可发布的组件库。

## 任务

1. Vite + React 19 + Tailwind v4，`base` 为 `/ui-sdk/`。
2. 用 `definePrimitive` 接上 `createPopup`、`createSelection`、`createTypeahead`、`createFocusRecovery`、`createRovingFocus`、`createReorder`。
3. 实验室、检查器、示例需求板和源码面板。
4. `bun test` 锁住筛选和版本钉死。

## 技术选择

- Vite + React：单页实验台，和现有 demo 一致。
- Tailwind v4：令牌。组件样式手写，不引入 shadcn，因为控件本身来自 UI SDK。
- IBM Plex Sans / Mono：拉丁文和属性；中文走系统字体。
- Bun：安装和测试。年龄例外只覆盖这两个包名，版本在 `package.json` 里不带 `^`。

## 推迟

- 公开导出里没有 `selectPreset`，所以弹出内容的角色是 `dialog`，里面再放 `listbox`。
- `createFocusRecovery` 不会从别的控件抢走焦点。移出按钮用 `pointerdown` 的 `preventDefault` 把焦点留在条目上。
