---
template: sheet
theme: auto
title: Demo build procedure (STE100)
subtitle: Steps for an agent that builds an xbm demo
cols: 3
style: strict
specification: ASD-STE100
source: xbm AGENTS.md; written in ASD-STE100 style
---
This procedure gives the steps for one build of an xbm demo. Do the steps in the given sequence. Read the warnings before the steps.

## Procedure {span=2}

```callout warn Before the steps
Read panel B before you start. Do not merge the PR.
```

1. 挑选 (pick): Read the pick note.
2. 审批 (approval): Examine the status in the pick note. Build the demo only when the status shows `approved`.
3. 构建 (build): Make a branch `demo/<slug>`. Add files only in `apps/<slug>/`.
4. 构建 (build): Put `bunfig.toml` with `minimumReleaseAge = 259200` in the app folder before the install.
5. 构建 (build): Set the vite base to `/<slug>/`. Run `bun run build`. Run `bash scripts/build-all.sh` from the repo root.
6. 构建 (build): Record a screenshot. Record a video.
7. 开 PR (open PR): Open one PR. Do not merge the PR.

## Warnings

```callout warn Do not merge
Keep the PR open. Do not merge the PR.
```

```callout warn Do not edit shared files
Do not edit `vercel.json`. Do not edit the files in `scripts/`. All demos use these files.
```

## Checks

| Check | Result |
| --- | --- |
| Build passes | ok |
| build-all passes | ok |
| Screenshot | ok recorded |
| Video | ok recorded |
| PR open | ok |
| PR not merged | ok |
