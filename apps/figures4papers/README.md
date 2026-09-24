# figures4papers

Single-user showcase: paper-style **Without vs With Jev** A/B figures from a recorded local-run proxy (not a formal benchmark).

## Showcase data

Defaults match:

- Primary JSON: `grok-bot-jev/examples/chatgpt_pack.json`
- Summary: `grok-bot-jev/examples/ab_results.md`

**Main figure:** Sample B — 24-candidate ≥200k filter timing (53.803 s vs 4.125 s, 13.0×).  
**Secondary:** five-task proxies (retries, skills, pages/searches, …).  
**Line chart:** weekly usage meter 37% → 38% → 39% (does **not** prove token savings).

Inspired by [ChenLiu-1996/figures4papers](https://github.com/ChenLiu-1996/figures4papers).

## Run

```bash
bun install
bun run dev
```

## Stack

Bun + Vite + React + TypeScript + shadcn/ui + Recharts + html-to-image

See [PLAN.md](./PLAN.md) for scope and caveats.
