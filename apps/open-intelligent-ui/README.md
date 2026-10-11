# Open Intelligent UI

智能体不只回一段文字，而是从你的设计系统里挑组件来回答：天气卡、指标图、行程表单、发布清单、套餐对比，都能直接操作。全部为脚本化示例数据，没有接入真实模型。

- Live: https://li.yishan.app/open-intelligent-ui/
- Inspired by [CopilotKit/OpenIntelligentUI](https://github.com/CopilotKit/OpenIntelligentUI) (MIT, © CopilotKit — see `LICENSE-OpenIntelligentUI`). Re-implemented from scratch; no CopilotKit packages or source are used.
- Bookmark: https://x.com/CopilotKit/status/2108555099241128416

## How it works
- `src/genui/types.ts` — the contract: each tool (`render_weather`, `render_metric_chart`, `render_trip_form`, `render_task_board`, `render_plan_compare`) maps to one component in `src/genui/`.
- `src/data/scenarios.ts` — 5 scripted scenarios (示例数据) + keyword matcher. No network calls, no model, no API key.
- `src/App.tsx` — chat shell: thinking → streamed text → tool call JSON → live component; the right-side registry highlights the tool used. Form submit / plan select feed back into the chat.

## Run
```bash
bun install && bun run dev   # http://localhost:5173/open-intelligent-ui/
```
