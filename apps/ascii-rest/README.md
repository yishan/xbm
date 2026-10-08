# ascii.rest

用 ascii.rest 0.2.1（bas3line/ascii，MIT）的动画 ASCII 作品做了三页：208 个作品按 15 个分类的画廊（fps / mono 开关、浅色/深色），一个只用 ascii.rest 作品拼出的“agent fleet terminal”状态页（真实数据：nightly 流程、12 个上线 demo、合并的 PR、每晚运行结果），以及一个只用 `<ascii-art>` 标签的纯 HTML 页。

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
- Nightly runs: `/workspace/xbm-nightly/<date>/status.md` on the build box (8 nights; finish time and result).
- Tonight's board and schedule: 2026-10-09 `pick.md` / `status.md`, nightly pipeline 19:55 pick / 22:00 build / 05:53 report (Asia/Shanghai).
- **Example data:** the `uptime-bar` panel. The piece draws its own 60-day bars; only the three routine names are real. The panel says so.
- Regenerate with `bun run data` (needs the xbm git checkout; set `XBM_NIGHTLY` if the notes live elsewhere). Output is committed, so `bun run build` needs neither.

## Dependency exception (approved by Yishan, 2026-10-09 00:24 Asia/Shanghai)

`ascii.rest` 0.2.1 was published on 2026-10-08 14:16 UTC, so the repo's 3-day `minimumReleaseAge = 259200` blocks it (`bun add` fails with "blocked by minimum-release-age"). `bunfig.toml` keeps `minimumReleaseAge = 259200` for everything and adds `minimumReleaseAgeExcludes = ["ascii.rest"]` for this one package only (a 1-day-old react canary is still blocked). `package.json` pins `"ascii.rest": "0.2.1"` exactly (no caret), so the exception cannot pull in a newer, unreviewed release.

```bash
bun install && bun run dev    # http://localhost:5173/ascii-rest/  (also /fleet.html, /plain.html)
bun run data                  # regenerate src/data/*.json
```

Notes: pieces only animate while on screen, and hold their first frame for readers who prefer reduced motion (library default). Box-drawing glyphs fall back to the 3 KB "ascii.rest mono" font from ascii.rest when the system monospace face lacks them.
