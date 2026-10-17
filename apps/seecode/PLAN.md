# PLAN — SeeCode 交互图解

**Goal:** show what SeeCode (JSON spec → animated, explorable HTML diagram) feels like, using 5 diagrams that are either public xbm info or clearly labelled 示例数据.

## Single-user MVP
- One page, 5 tabs: 夜间流水线 (architecture), 审批对话 (sequence), 上线时间线 (Gantt from `tracking/seen-bookmarks.json`), 产品流程 (flowchart, 示例数据), 需求流转 (Sankey, 示例数据).
- Each tab: live diagram (same-origin iframe of the SeeCode HTML) + 上一步/下一步/重播 step-through + 节点说明 panel (click a node or chip) + JSON spec.
- Theme follows `prefers-color-scheme`; header toggle overrides and is pushed into every diagram (`data-theme`).

**Out:** in-browser spec editor, export buttons in our UI (SeeCode's own Export menu stays), any backend.

## Tasks (vertical slices)
1. Vendor SeeCode v0.6.1 release (`vendor/seecode/`, LICENSE + THIRD_PARTY_LICENSES.md kept).
2. Specs in `src/specs/`, `scripts/build-diagrams.mjs` renders them at `dev`/`build` time (+ Gantt from tracking).
3. React page (shadcn Tabs/Button/Badge) with iframe panel, step controls, node details, theme sync.
4. Verify (verify-xbm), screenshots, video, tracking entry, PR.

## Stack
- Vite + React + Tailwind + shadcn/ui: same set as other demos; reused manimgx lockfile so no new npm packages (bunfig 3-day rule).
- SeeCode CLI renderer run with Bun at build time: zero dependencies, outputs standalone HTML with built-in hover/focus/route/step.
- iframe embed: keeps SeeCode's viewer JS/CSS isolated from the app.

## Deferred
- Live spec editing (would need the renderer in the browser; it's a Node CLI).
- GIF/MP4 export UI (SeeCode's menu loads encoders from jsDelivr on demand).
