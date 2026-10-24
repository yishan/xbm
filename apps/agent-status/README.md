# Agent Status 组件

一组让人看清 AI 助理在做什么的 React 组件：状态胶囊、运行卡片（思考 → 调用工具 → 等待批准 → 完成 / 出错，带用时）、运行时间线和积分用量表（统一额度 vs 分开额度）。点「播放」走一遍完整运行，所有名字和数字都是示例数据。

## Components

- `AgentStatusPill` — state pill with per-state motion (thinking dots, tool spinner, approval ping, done / error).
- `AgentRunCard` — current step, tool, elapsed time, credits, and an approval panel with 批准 / 拒绝 (local state only).
- `RunTimeline` — every step of the run with status, duration and credits.
- `CreditsMeter` — one shared pool vs. split pools, with a note on the two-wallet problem.
- `BotGrid` — six example bots, one per state.

## Run

```bash
bun install && bun run dev   # http://localhost:5173/agent-status/
```

## Credits

Own-idea demo. Design inspiration only — no code or assets copied — from:

- [@eliakuratli — agent status component](https://x.com/eliakuratli/status/2113618712066711970)
- [@PostiauxCharles — agent credits usage](https://x.com/PostiauxCharles/status/2112882320978104612)

Built with React, [Motion](https://motion.dev) (MIT), Tailwind CSS (MIT) and shadcn/ui (MIT). Follows `prefers-color-scheme` on first load (toggle in the header) and `prefers-reduced-motion`. Component code was written by DeepSeek (via aider) from our own specs.
