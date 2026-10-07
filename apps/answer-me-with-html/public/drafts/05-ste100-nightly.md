---
template: sheet
theme: auto
title: Nightly build procedure (STE100)
subtitle: Steps for an agent that builds an xbm demo
cols: 3
style: strict
specification: ASD-STE100
source: xbm AGENTS.md; written in ASD-STE100 style
---
This procedure gives the steps for one nightly build of an xbm demo. Do the steps in the given sequence. Read the warnings before the steps.

## Procedure {span=2}

```callout warn Before the steps
Read panel B before you start. Do not merge the PR.
```

1. Read `pick.md`.
2. Examine the status in `pick.md`.
3. Build the demo only when the status shows `approved`.
4. Make a branch `demo/<slug>`.
5. Add files only in `apps/<slug>/`.
6. Put `bunfig.toml` with `minimumReleaseAge = 259200` in the app folder before the install.
7. Set the vite base to `/<slug>/`.
8. Run `bun run build`.
9. Run `bash scripts/build-all.sh` from the repo root.
10. Record a screenshot.
11. Record a video.
12. Open one PR.
13. Do not merge the PR.

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
