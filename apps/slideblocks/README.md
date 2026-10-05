# SlideBlocks

A 10-slide Chinese web deck on 「Personal Agent 的发展现状」 in SlideBlocks-style block layouts — title, agenda, comparison, timeline, capability diagram, product grid, metric cards and closing — with keyboard navigation, a slide overview grid and light/dark themes.

> Layouts inspired by **[UniUni2000/slideblocks-skill](https://github.com/UniUni2000/slideblocks-skill)** (MIT License) — an agent skill that turns papers, docs and web pages into Slidev presentations. This demo is an original, smaller React re-implementation of the look for the xbm nightly gallery. It does not use Slidev or copy the upstream sample decks or their images. Live upstream sample: https://uniuni2000.github.io/slideblocks-skill/#/1

- Live: https://li.yishan.app/slideblocks/
- Bookmark: https://x.com/geekbb/status/2103065656480690337
- Upstream: https://github.com/UniUni2000/slideblocks-skill (MIT)

## What it shows

| # | Slide | Block |
|---|-------|-------|
| 1 | Personal Agent 的发展现状 | Cover with agent-and-tools diagram |
| 2 | 议程 | 6 numbered agenda cards |
| 3 | Personal Agent 是什么 | Definition + 2 contrast cards + checklist |
| 4 | 时间线 | Year-grouped timeline, 2023–2026 |
| 5 | 能力分层 | Stacked capability diagram + notes |
| 6 | 代表产品 | 3 × 2 comparison grid |
| 7 | 瓶颈与争议 | 6 problem cards (「待补」 highlighted) |
| 8 | 近 12 个月的 4 个趋势 | 4 trend columns |
| 9 | 关键数字 | 6 metric cards |
| 10 | 收尾 | Summary list + callout |

Deck copy: written by the Social Writing agent from a Researcher brief (2026-10-05) and approved by Yishan; speaker Tech Demos / Yishan. 「待补」 marks data the brief could not confirm. All visuals are CSS and inline SVG; there are no third-party images.

## Controls

| Key | Action |
|-----|--------|
| → ↓ Space PageDown Enter | Next slide |
| ← ↑ PageUp Backspace | Previous slide |
| Home / End | First / last slide |
| O | Open / close the overview grid (Esc closes) |
| D | Toggle light / dark |
| Swipe left / right | Next / previous (touch) |

The current slide is kept in the URL hash (`#/3`), the same scheme as the upstream sample. Slides render on a fixed 1280 × 720 canvas that scales to the window. Chinese text uses a CJK system font stack (PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans CJK SC).

## Run

```bash
bun install && bun run dev   # http://localhost:5173/slideblocks/
bun run build
```

Stack: Vite + React 19 + TypeScript, Tailwind v4, shadcn/ui (radix-nova, neutral), lucide. No backend, so there is no Cloudflare Worker.

## Credits

- SlideBlocks © 2026 SlideBlocks contributors (UniUni2000/slideblocks-skill), MIT License — https://github.com/UniUni2000/slideblocks-skill (copy of the license in `LICENSE-SlideBlocks`)
- Code written mostly by DeepSeek (`deepseek-flash` via aider), one component per request; see `PLAN.md`.
