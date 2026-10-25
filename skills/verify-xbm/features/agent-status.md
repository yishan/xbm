# Agent Status 组件

Agent status UX components on example data: AgentStatusPill, AgentRunCard (idle → thinking → tool → approval → done / error), RunTimeline, CreditsMeter, plus a grid of six example bots.

## Sub-features

- `play` 播放 button walks one scripted run through every state; it stops at 等待批准 until 批准 / 拒绝
- `approve` 批准 / 拒绝 on the run card (aria-label `批准 Otter 的请求` / `拒绝 Otter 的请求`) and on the Maple card in the bot grid — local state only
- `speed` 速度 1x / 2x
- `credits` 统一额度 / 分开额度 toggle in CreditsMeter (`aria-pressed`)
- `theme` sun/moon toggle (aria-label 切换到深色模式 / 切换到浅色模式); first load follows `prefers-color-scheme`

## How to get to it (user POV)

- Open `https://li.yishan.app/agent-status/`, locally `http://127.0.0.1:<port>/agent-status/` from `dist/`. Click 播放, wait ~8 s for 等待批准, click 批准.

## Driving it with scripts/verify.ts

- **Main interaction.** `bun scripts/verify.ts agent-status`: `DRIVES["agent-status"]` clicks 播放; the pill/run card leave 空闲 (`data-state` changes) and the timeline shows the first step active.
- **Proof.** `.verify/<run>/agent-status/before.png`, `after.png`, `drive.webm`, `STATUS.md`.

## Gotchas

- The run is time-based (≈8 s to the approval step at 1x); screenshots taken mid-run differ between runs.
- No network requests besides the bundle; no PDF export.
