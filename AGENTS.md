# Agent rules — xbm

Sticky tech-demo monorepo. Never create a new GitHub repo for a demo.

## Layout

- `apps/<kebab-slug>/` — one self-contained app per pick
- `skills/project-planning/` — planning skill (read before coding)
- `tracking/seen-bookmarks.json` — proposed/built bookmark ids (do not re-propose)

## Hard rules

1. Only add or update files under `apps/<kebab-slug>/` for a given demo. Do not rewrite other apps, root tooling, or tracking except to append a built entry after the PR is ready.
2. Runtime and package manager: Bun. Every app root must include `bunfig.toml` with `[install] minimumReleaseAge = 259200` before `bun install` / `bun add`.
3. Prefer official scaffolds (`bunx create-next-app`, `bunx create-vite`, etc.) with install skipped, then `bun install`. UI: shadcn/ui minimalist preset; add components on demand.
4. Single-user MVP only. Cut scope before cutting clarity. Prefer prebuilt over bespoke.
5. Model for initial prototypes: `claude-fable-5` (Fable 5) unless the owner asks otherwise.
6. Every PR must attach **both** at least one screenshot **and** at least one video of the running app. Not optional.
7. App must be runnable with `bun install && bun run dev` from `apps/<slug>/`.
8. One Pages project for Cloudflare previews (path per app), not one project per app.

## After approval

1. Read `skills/project-planning/SKILL.md` and write `apps/<slug>/PLAN.md`.
2. Implement only that app directory.
3. Open one PR with screenshot + video artifacts.
