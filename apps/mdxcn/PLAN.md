# mdxcn — Markdown figure lab

Goal: one screen where typing mdxcn's Markdown grammar redraws a real mdxcn figure live, with hands-on tuning and a React ↔ ASCII toggle.

## MVP
- Figure picker: Flow, Tree, Board, Decision, Matrix first, then Timeline, Gantt, Heatmap (English 示例数据; CJK breaks the ASCII column math upstream).
- Left: plain textarea with MDX source, grammar token buttons (`**`, `*`, `~~`, `→`, `—`), Ctrl/Cmd+B/I, reset, inline compile error.
- Right: live figure compiled in the browser with `@mdx-js/mdx` `evaluate` + `remark-gfm` and the vendored registry as `components`; Replay; Copy MDX / Copy ASCII.
- Controls: accent family (8 upstream solid accents), frame (box/corners/rule/none via `GraphFrameProvider`), density (scoped Tailwind `--spacing`), font (mono/sans via scoped `--font-mono`), speed (`setGraphTimeScale`).
- URL hash keeps figure, settings and edited source. System theme by default with a toggle.

## Out of scope
Comark / Knap output tabs, the other 39 components in the picker (they still render if typed), syntax highlighting.

## Stack
Vite + React 19 + TS, Tailwind v4, motion, @mdx-js/mdx 3.1.1, remark-gfm 4.0.1 (all older than the 3-day minimumReleaseAge). Components written by DeepSeek via aider on the box.

## Verify
`bash scripts/build-all.sh mdxcn && bun scripts/verify.ts mdxcn`; drive: pick the Tree figure.
