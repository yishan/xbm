# Answer me with HTML

用上游 `am` CLI（QingYunA/answer-me-with-html v0.4.14，MIT）把 5 份短 Markdown 草稿渲染成离线单页 HTML：xbm nightly 流程时序图、Vercel vs Cloudflare Worker 对比表、画廊时间线、上游 TCP 示例和 ASD-STE100 页面，带主题切换和“草稿 vs 页面”对照。

- Live: https://li.yishan.app/answer-me-with-html/
- Upstream: https://github.com/QingYunA/answer-me-with-html — MIT License, Copyright (c) 2026 Answer me with HTML contributors. Full notice in `LICENSE-answer-me-with-html`. Thanks to QingYunA.

## How it works

- `drafts/*.md` — the Markdown drafts (01–03, 05 drafted with DeepSeek via aider and hand-fixed; 04 is upstream `examples/tcp.en.md` unchanged).
- `scripts/render-pages.sh` runs the upstream CLI (`node <clone>/bin/am.js render`, Node ≥ 20) once per draft and writes `public/pages/<id>.html`; drafts are copied to `public/drafts/`. The generated HTML is committed, so `bun run build` and the root build do not need the CLI.
- Each rendered page carries all three themes (blueprint, shadcn = card, paper = long-read) in light and dark. The gallery switches them by setting `data-theme` / `data-mode` on the same-origin iframe's root element.
- `05-ste100-nightly` renders with `style: strict`: the CLI refuses to write the page if the STE check warns (the first draft failed on two passive sentences and was fixed).

```bash
bun install && bun run dev          # http://localhost:5173/answer-me-with-html/
git clone https://github.com/QingYunA/answer-me-with-html /tmp/amwh && (cd /tmp/amwh && git checkout v0.4.14 && npm ci)
AM_SRC=/tmp/amwh bun run render     # re-render public/pages/
```

## Data sources

Numbers come only from xbm `AGENTS.md`, `git log --merges --first-parent origin/main` (head ce5fd1d), the 2026-10-08 nightly pick/status notes, and the upstream README (benchmark: 5,341 → 870 output tokens, 33 s → 12 s, $0.092 → $0.067, Claude Sonnet 5.5, 3 topics × 3 runs, medians). No example data is used.

Not included: `am video` (narration needs a system/ElevenLabs voice; skipped), any backend.
