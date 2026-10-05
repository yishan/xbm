# Hairline 细线实验室

探索全部 19 个等距交互图形，切换 7 类、明暗主题和交互强度；再用 Dicembre → Grok → Muse 的模拟任务体验规划、审阅、执行与交接。

## 运行

```sh
bun install && bun run dev
# http://localhost:5173/hairline/
bun run lint
bun run build
bun test tests/collaboration.test.ts
```

Vite + React + TypeScript，官方 `@lucasmarkes/hairline/react` 入口，shadcn/ui nova 按钮。每次只挂载当前图形；读数以 160ms 间隔更新，不把逐帧回调传到整个应用。场景页挂载三个示意图。

## 体验范围

| 分类（沿用官方） | 图形 |
| --- | --- |
| 界面 | Exploded |
| 数据 | Terrain, Phosphor, Riffle |
| 机器 | Slow, Turntable, Elevator |
| 设备 | Keyboard, Phone, Laptop |
| 开发 | Terminal, Cabinet, Branches |
| 安全 | Vault, Lockers, Padlock |
| 连接 | Patch, Dish, Router |

- 图形说明与可访问名称为中文；读数同时保留官方原始值，便于核对。
- 明亮 / 暗色 / 跟随系统主题；强度 0–1（步长 0.05）。强度改变含义因图形而异，在说明面板中解释。
- Riffle 可聚焦后用左右方向键选择卡片。其他图形以指针或触摸探索为主；所有导航和控件可用键盘操作。
- `prefers-reduced-motion` 下关闭界面过渡，Hairline 自带的 Phosphor / Slow 循环停止，指针交互仍保留。
- 协作流程支持自动开始、暂停、单步、重置、交接物与交接记录；自动每 2.4 秒推进一次。重复开始不创建多个时钟，完成后不会重复追加记录。切换到组件页或浏览器页面隐藏时暂停；切换视图保留进度，刷新页面重置。
- **协作场景是固定脚本的本地模拟。** 角色名称不表示真实产品集成；不连接产品账号，不调用外部助手或 AI 服务，无后端或数据持久化。

## 包与许可

[Hairline](https://github.com/lucasmarkes/hairline) © 2026 Lucas Marques，MIT。实际 npm 包锁定 `0.2.0`，React peer 为 `>=18`，无运行时依赖；19 个命名导出与官方分类已核对。[官方图形目录](https://hairline.lucasmarkes.com/figures)。许可保存在 `LICENSE-Hairline`。

`0.2.0` 发布时间为 2026-10-03 21:23 UTC。用户在 2026-10-05 明确批准此单包三天安装门槛例外；`bunfig.toml` 仅将 `@lucasmarkes/hairline` 加入例外列表，`package.json` 精确锁定该版本，其他依赖继续遵守 `minimumReleaseAge = 259200`。

[shadcn/ui](https://github.com/shadcn-ui/ui) 按钮使用 MIT，完整许可保存在 `LICENSE-shadcn`。没有安装或运行第三方 agent Skill。

## 浏览器证据

`artifacts/screenshot.png` 是仓库首页缩略图；`dark.png`、`collaboration.png`、`mobile.png`、`mobile-collaboration.png` 展示其他视图。`catalogue/` 保留 19 个图形的实际截图，`demo.webm` 是运行演示录像。验证详情见 `VALIDATION.md` 与 `artifacts/qa-results.json`。

复现浏览器检查：在临时 Python 环境安装 Playwright、执行 `python -m playwright install chromium`，启动 app 后运行 `python tests/browser_qa.py`。可用 `HAIRLINE_QA_URL` 指定生产构建的本地预览地址。Python 测试工具不属于 app 运行依赖。

## 发布范围

只修改 `apps/hairline/`，Vite base 为 `/hairline/`。根构建自动纳入此 app，无共享构建脚本、Vercel 配置或 tracking 变更。草稿 PR 可触发已获许可的 Vercel 预览；不合并，也不执行正式部署。
