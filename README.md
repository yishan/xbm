# xbm-demo

Sticky monorepo for weekday X-bookmark tech demos.

- One app per pick under `apps/<slug>/`
- Plans from `skills/project-planning/`
- Dedup state in `tracking/seen-bookmarks.json`
- Bun + shadcn; cloud agents only touch `apps/`

## Run an app

```bash
cd apps/<slug>
bun install
bun run dev
```
