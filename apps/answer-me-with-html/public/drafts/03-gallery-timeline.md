---
template: sheet
theme: auto
title: xbm gallery timeline
subtitle: 11 demos live since 2026-09-24
cols: 3
source: git log --merges --first-parent origin/main (head ce5fd1d)
---
Demos merged to `main` by first-parent merge. Dates are in Asia/Shanghai.

## Demos {span=3}

```timeline v
2026-09-24 | figures4papers | PR #1
2026-09-25 | transitions-dev | PR #2
2026-09-28 | spectrum-ui | PR #3
2026-09-29 | obsidian-ui | PR #4
2026-09-30 | docu-md | PR #6
2026-10-02 | antv-infographic | PR #8
2026-10-02 | shadcn-admin | PR #9
2026-10-05 | pdfcn | PR #11
2026-10-05 | hairline | PR #12
2026-10-06 | slideblocks | PR #13
*2026-10-07 | tanstack-charts | PR #15
```

## Merges that are not new demos

| PR | Date | What for |
| --- | --- | --- |
| #5 | 2026-09-29 | infra/path-deploy — shared Vercel path deploy, not a demo |
| #7 | 2026-09-30 | docu-md-pdf — PDF Worker for docu-md, not a new app |
| #14 | 2026-10-06 | slideblocks localStorage fix |

## Counts

```kv
first-parent merges: 14
demo apps: 11
first demo: 2026-09-24
latest: 2026-10-07
```

## Next

```callout info Pending
answer-me-with-html is an open PR. It would be the 12th demo app, and it is not merged yet. Merge only by Yishan.
```
