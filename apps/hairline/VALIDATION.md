# 本地验证 · 2026-10-05

执行环境：用户 Mac，任务独立克隆；全仓构建使用独立临时快照。当前 base：main `6d14c1e`，已纳入刚合并的 pdfcn PR #11。没有修改共享配置、其他 apps 或 tracking。

| 检查 | 实际结果与证据 |
| --- | --- |
| 包核验 | npm/安装包均为 Hairline 0.2.0；`./react` 导出 19 个组件；React peer >=18；MIT 许可已保留 |
| 冻结安装 | `bun install --frozen-lockfile` 通过；单包安装年龄例外经用户明确批准 |
| lint | `bun run lint` 通过，0 警告 |
| app build | `bun run build` 通过（TypeScript + Vite）；JS 352.09 kB / gzip 121.75 kB |
| 状态机 | `bun test tests/collaboration.test.ts`：2 tests / 9 assertions，通过 |
| 浏览器交互 | 全部 19 个组件生成非空 SVG，每个均观察到指针读数；明暗主题、强度 0/0.5/1、7 类数量、前后切换循环、Riffle 方向键和动态系统主题通过 |
| 协作边界 | 自动完成、重复开始/完成、暂停、单步、运行中重置、旧时钟清理、切换视图暂停且保留进度通过 |
| 响应式 | 320/390/768px，全部 19 个 SVG 可见，无水平溢出；触摸读数与窄屏协作控件通过 |
| 减少动态效果 | 全部图形可渲染；Phosphor/Slow 空闲循环停止；单步协作完成通过 |
| 浏览器错误 | Chromium，无 console/page errors；原始检查与读数见 `artifacts/qa-results.json` |
| 最新 main 全仓构建 | 原样执行 `bash scripts/build-all.sh`，Bun 1.4.2，9 个 demos 成功；见 `artifacts/full-build.log`。兄弟 apps 有既有 chunk-size 警告，构建未失败 |
| 生产静态入口 | 根索引包含 9 个 demo；`/hairline/` 与全部 19 个 SVG、主题、中文读数、手动交接、390px 布局通过；无 HTTP >=400 或 page error；见 `artifacts/production-results.json` |
| 视觉复核 | 实际查看桌面明/暗、协作和窄屏截图；图形、说明与控制区没有遮挡或水平溢出 |

## 证据

- `artifacts/screenshot.png`：生产构建的明亮组件体验（首页缩略图）
- `artifacts/dark.png`：生产构建的暗色体验
- `artifacts/collaboration-active.png`、`collaboration.png`：生产构建的审阅阶段与完成状态
- `artifacts/mobile.png`、`mobile-collaboration.png`：390px 生产构建
- `artifacts/catalogue/*.png`：全部 19 图形的实际渲染
- `artifacts/demo.webm`：组件交互、主题/强度、协作自动交接的运行录像

## 验证边界

浏览器是无头 Chromium；未在 Safari、Firefox 或真实 iPhone 上验证，未做完整屏幕阅读器或 WCAG 审计。减少动态效果保留直接指针响应，遵循 Hairline 行为。协作场景无真实账号集成、外部助手调用或持久化；“完成”仅指固定脚本交接完成，用户验收单列。线上 PR 预览的结果由 GitHub 回写证据单独确认；本地构建和测试不等于正式部署。
