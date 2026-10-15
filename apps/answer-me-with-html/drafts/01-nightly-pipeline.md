---
template: sheet
theme: auto
title: How the xbm demo pipeline works
subtitle: From a bookmark to an unmerged PR — 挑选、审批、构建、开 PR
cols: 3
source: xbm AGENTS.md (generic flow, no schedule details)
---

## Sequence {span=2}

```sequence num
participants: Scout, Owner, Builder, GitHub
note Scout: 挑选 · pick a bookmark
Scout -> Owner: pick note (pending)
Owner -> Builder: 审批 · approve
note Builder: 构建 · build only if approved
Builder -> GitHub: branch demo/slug, build-all.sh
Builder -> GitHub: screenshot + video
Builder -> GitHub: 开 PR · one PR (no merge)
Owner -> GitHub: merge (owner only)
```

## Rules

- Build only when the pick note shows `approved`.
- One app per PR, under `apps/<slug>/`.
- The PR has a screenshot and a video.
- Never auto-merge. The owner merges.

## When approval is late

```callout info Manual start
If the approval comes after the scheduled build has checked and skipped, the owner can ask for a manual run. A manual run does the same build steps.
```

```flow LR
(pending) -> [Skipped]: scheduled check
[Skipped] -> [Approved]: owner
[Approved] -> *[Manual run] -> [(Unmerged PR)]
```

## Steps

| Step | Who | Output |
| --- | --- | --- |
| 挑选 Pick | Scout | pick note, status pending |
| 审批 Approve | Owner | status approved |
| 构建 Build | Builder | branch `demo/<slug>`, app in `apps/<slug>/` |
| 开 PR Open PR | Builder | one unmerged PR with screenshot + video |
