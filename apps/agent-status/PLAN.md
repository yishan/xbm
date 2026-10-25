# agent-status — MVP plan

## Goal

One page of React components that make an AI agent's state, permission requests and cost visible: a status pill, a run card that walks idle → thinking → running a tool → waiting for approval → done / error, a run timeline, and a credits meter — all on example data.

Own-idea demo inspired by two X posts (design inspiration only, no code or assets copied):
- [@eliakuratli — agent status component](https://x.com/eliakuratli/status/2113618712066711970)
- [@PostiauxCharles — agent credits usage](https://x.com/PostiauxCharles/status/2112882320978104612)

## Single-user MVP

In scope:
- `AgentStatusPill` — compact pill with icon + label + animated indicator per state.
- `AgentRunCard` — current step, tool name, elapsed time, approval state with Approve / Deny buttons (local state only), done / error result.
- `RunTimeline` — vertical list of the run's steps with timestamps and durations.
- `CreditsMeter` — one shared pool vs. split pools (toggle), with a short note on the "two-wallet" problem.
- A scripted **Play** button that drives one example run through every state (pauses at approval until Approve / Deny, or auto-approves after a few seconds).
- A grid of six example bots in different states.
- Every name and number labelled 示例数据; credits to both authors with links.
- `prefers-color-scheme` on first load + light/dark toggle; `prefers-reduced-motion` respected (Motion `MotionConfig reducedMotion="user"`).

Out: real agents/backends, persistence, notifications, i18n switch.

## Tasks (vertical slices)
1. Scaffold (create-vite react-ts, Tailwind v4, shadcn radix-nova; button/badge/card/switch).
2. Shared types + scripted run data (`src/lib/agent.ts`).
3. Components, one per aider request: pill, run card, timeline, credits meter, bot grid.
4. App shell: header, Play controls, theme toggle, credits footer.
5. Build-all, shoot, verify-xbm (DRIVES + features file), tracking entry.

## Stack
- Vite + React + TS — official scaffold, one screen.
- Tailwind v4 + shadcn/ui — repo default, minimal preset.
- Motion (MIT) — state transitions, layout animation, reduced-motion support built in.
- lucide-react — icons.

## Deferred
- Real streaming from an agent API — no backend needed for a UX demo.
- Notification budget / batching patterns — separate idea.
