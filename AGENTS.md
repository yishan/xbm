# Agent rules — xbm

Sticky tech-demo monorepo. Never create a new GitHub repo for a demo.

## Layout

- `apps/<kebab-slug>/` — one self-contained app per pick
- `skills/project-planning/` — planning skill (read before coding)
- `tracking/seen-bookmarks.json` — proposed/built bookmark ids (do not re-propose)
- `vercel.json` + `scripts/` — **shared deploy setup** (one Vercel project `xbm`, custom domain `li.yishan.app`). `scripts/build-all.sh` builds every `apps/*/` with a `package.json` into `dist/<slug>/` and generates the index page `dist/index.html`. Do not edit per demo.

## Hard rules

1. Only add or update files under `apps/<kebab-slug>/` for a given demo. Do not rewrite other apps, root tooling (`vercel.json`, `scripts/`), or tracking except to append a built entry after the PR is ready.
2. Runtime and package manager: Bun. Every app root must include `bunfig.toml` with `[install] minimumReleaseAge = 259200` before `bun install` / `bun add`.
3. Prefer official scaffolds (`bunx create-next-app`, `bunx create-vite`, etc.) with install skipped, then `bun install`. UI: shadcn/ui minimalist preset; add components on demand.
4. Single-user MVP only. Cut scope before cutting clarity. Prefer prebuilt over bespoke.
5. Model for initial prototypes: `claude-fable-5` (Fable 5) unless the owner asks otherwise.
6. Every PR must attach **both** at least one screenshot **and** at least one video of the running app. Not optional.
7. App must be runnable with `bun install && bun run dev` from `apps/<slug>/`.
8. One Vercel project for all demos (path per app), not one project per app. Every app is served at `https://li.yishan.app/<slug>/` and picked up automatically by the root build — no deploy config per app.
9. Every app's `vite.config.ts` must set `base: "/<slug>/"` (slug = directory name). Keep asset paths base-aware: no hard-coded root-absolute URLs like `"/logo.png"` or `fetch("/data.json")` in `src/` — import assets, or use `` `${import.meta.env.BASE_URL}logo.png` `` for files in `public/`. (Root-absolute paths in `index.html` are fine; Vite rewrites them.) Locally, `bun run dev` then serves at `http://localhost:5173/<slug>/`.
10. The index page at `https://li.yishan.app/` uses the app README's first `# heading` as the name, the first paragraph after it as the description, and `artifacts/screenshot.png` as the thumbnail — keep those meaningful.
11. Before opening a PR, `bash scripts/build-all.sh` from the repo root must succeed (it fails the deploy if any app fails to build).

## After approval

1. Read `skills/project-planning/SKILL.md` and write `apps/<slug>/PLAN.md`.
2. Implement only that app directory.
3. Open one PR with screenshot + video artifacts.
