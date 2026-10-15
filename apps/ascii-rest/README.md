# ascii.rest

用 ascii.rest 0.4.0（bas3line/ascii，MIT）的动画 ASCII 作品做了三页：217 个作品按 15 个分类的画廊（fps / mono 开关、浅色/深色），一个只用 ascii.rest 作品拼出的“agent fleet terminal”状态页（真实数据：上线 demo、每周 demo 数和合并的 PR 数；0.4 起用 `ascii.rest/kit` 的 barChart 画「每周上线 demo 数」、typewriter 打出标题），以及一个只用 `<ascii-art>` 标签的纯 HTML 页。

- Live: https://li.yishan.app/ascii-rest/ · fleet: https://li.yishan.app/ascii-rest/fleet.html · plain: https://li.yishan.app/ascii-rest/plain.html
- Upstream: https://ascii.rest · https://github.com/bas3line/ascii — MIT License, Copyright (c) 2026 bas3line. Full notice in `LICENSE-ascii.rest`. Thanks to @bas3line.
- Bookmark: https://x.com/inlovewithgo/status/2107800389395636271

## Pages

| page | file | how it uses ascii.rest |
| --- | --- | --- |
| gallery | `index.html` → `src/pages/Gallery.tsx` | `<Ascii piece="…">` from `ascii.rest/react` for every piece; piece list and meta come from the package (`load`, `names`, `canvas`) via `scripts/gen-data.ts` |
| agent fleet terminal | `fleet.html` → `src/pages/Fleet.tsx` | 8 panels, each one library piece with real options: `big-text`, 2× `split-flap`, `file-tree`, `bar-chart`, `typewriter`, `digital-clock`, `uptime-bar` (example data) |
| plain html | `plain.html` | 11 `<ascii-art>` tags; the only script is `import "ascii.rest/element"` |

## Data sources (fleet page)

- Demos and merge dates: `git log --first-parent origin/main`, first commit that added `apps/<slug>/package.json` (12 demos, 2026-09-24 → 2026-10-08).
- Merged PRs per week: `git log --first-parent --merges origin/main` (15 PRs).
- **Example data:** the `uptime-bar` panel. The piece draws its own 60-day bars; only the three routine names are real. The panel says so.
- Regenerate with `bun run data` (needs the xbm git checkout; set `XBM_NIGHTLY` if the notes live elsewhere). Output is committed, so `bun run build` needs neither.

## Dependency version

`ascii.rest` is pinned to exactly `0.4.0` (published 2026-10-10, updated from 0.2.1 on 2026-10-15). It is older than the repo's 3-day `minimumReleaseAge = 259200`, so the earlier one-package `minimumReleaseAgeExcludes` exception for 0.2.1 has been removed from `bunfig.toml`.

```bash
bun install && bun run dev    # http://localhost:5173/ascii-rest/  (also /fleet.html, /plain.html)
bun run data                  # regenerate src/data/*.json
```

Notes: pieces only animate while on screen, and hold their first frame for readers who prefer reduced motion (library default). Box-drawing glyphs fall back to the 3 KB "ascii.rest mono" font from ascii.rest when the system monospace face lacks them.
