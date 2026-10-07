---
template: sheet
theme: auto
title: How the xbm nightly demo pipeline works
subtitle: From an X bookmark to an unmerged PR
cols: 3
source: xbm AGENTS.md, nightly pick/status notes 2026-10-08
---

## Sequence {span=2}

```sequence num
participants: Scout, Yishan, Builder, GitHub, Report
note Scout: 19:55 scan bookmarks
Scout -> Yishan: pick.md (pending)
Yishan -> Builder: approve in chat
note Builder: 22:00 build if approved
Builder -> GitHub: branch demo/slug, aider + DeepSeek
Builder -> GitHub: build-all.sh, screenshot, video
Builder -> GitHub: open one PR (no merge)
Yishan -> GitHub: merge (Yishan only)
note Report: 05:53
Report -> Yishan: result report
```

## Rules

- Build only when `pick.md` shows `approved`.
- One app per PR, under `apps/<slug>/`.
- The PR has a screenshot and a video.
- Never auto-merge. Yishan merges.

## When approval is late

```callout warn Manual start
Tonight the 22:00 build checked at 22:17 and skipped. The status was pending.

Yishan approved at 00:23 on 2026-10-08 and asked to start now.

A manual run does the same build steps. The 05:53 report includes it.
```

```flow LR
(pending) -> [Skipped at 22:17]: 22:00 check
[Skipped at 22:17] -> [Approved 00:23]: Yishan in chat
[Approved 00:23] -> *[Manual run] -> [(Unmerged PR)]
```

## Times

| Time | Step | Output |
| --- | --- | --- |
| 19:55 Asia/Shanghai | Scout scans the X bookmark folders | pick.md, status pending |
| before 22:00 | Yishan approves in chat | status approved |
| 22:00 | Nightly build routine starts | branch `demo/<slug>`, app in `apps/<slug>/`, one PR |
| 05:53 | Report routine | result to Yishan |
