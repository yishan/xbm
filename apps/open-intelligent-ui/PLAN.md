# PLAN — Open Intelligent UI (xbm nightly 2026-10-11)

**Goal:** show the *generative UI* idea from [CopilotKit/OpenIntelligentUI](https://github.com/CopilotKit/OpenIntelligentUI) (MIT): the agent answers with live, interactive components from your own design system instead of plain text.

## Approval constraints (2026-10-10 20:27)
- No real model, no model key anywhere, no Worker. Every agent reply is **scripted example data (示例数据)**, labelled in the UI.
- Pure front end, static, served at li.yishan.app/open-intelligent-ui/.

## MVP scope
- Chat panel: suggestion chips + input; input is matched to the nearest scripted scenario by keyword (fallback reply lists what it can show).
- Simulated agent: "thinking" step, streamed text, then a **tool call** `render_<component>(props)` shown as JSON, then the live component.
- Component kit (shadcn-style, `src/genui/`): WeatherCard, MetricChart (SVG bars), TripForm (interactive form, submits back into chat), TaskBoard (checklist with progress), PlanCompare (pricing table with selectable plan).
- Side panel "Design system registry": lists the components the agent is allowed to call and highlights the one just used.
- Credit CopilotKit + MIT notice in README, footer and LICENSE file.

## Out of scope
- Real LLM / AG-UI protocol / CopilotKit runtime packages, Worker, persistence.

## Tasks
1. Scaffold (create-vite react-ts), bunfig, shadcn components, types contract (hand).
2. DeepSeek (aider, deepseek-flash), one component per request: 5 genui components, scripted scenarios, chat shell.
3. Hand fixes, build, root build-all, Playwright QA, screenshot + video, PR (unmerged).
