# xbm

Sticky monorepo for weekday X-bookmark tech demos.

- One app per pick under `apps/<slug>/`
- Plans from `skills/project-planning/`
- Dedup state in `tracking/seen-bookmarks.json`
- Bun + shadcn; cloud agents only touch `apps/`

## Live demos

All demos deploy from one Vercel project, one path per app, on **https://li.yishan.app/**:

| Demo | URL |
| --- | --- |
| Index (all demos) | https://li.yishan.app/ |
| figures4papers | https://li.yishan.app/figures4papers/ |
| transitions-dev | https://li.yishan.app/transitions-dev/ |
| spectrum-ui | https://li.yishan.app/spectrum-ui/ |
| obsidian-ui | https://li.yishan.app/obsidian-ui/ |

New `apps/<slug>/` directories are picked up automatically at `https://li.yishan.app/<slug>/` as long as `vite.config.ts` sets `base: "/<slug>/"` (see `AGENTS.md`).

## Build everything (what Vercel runs)

```bash
bash scripts/build-all.sh     # -> dist/index.html + dist/demos.json + dist/<slug>/
python3 -m http.server 4391 --directory dist   # then open http://localhost:4391/
```

## Run an app

```bash
cd apps/<slug>
bun install
bun run dev   # http://localhost:5173/<slug>/
```
