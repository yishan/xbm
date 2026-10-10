# Agent rules — xbm

Sticky tech-demo monorepo. Never create a new GitHub repo for a demo.

## Layout

- `apps/<kebab-slug>/` — one self-contained app per pick
- `apps/<kebab-slug>/worker/` — optional Cloudflare Worker backend for that app (see **Backends** below)
- `skills/project-planning/` — planning skill (read before coding)
- `tracking/seen-bookmarks.json` — proposed/built bookmark ids (do not re-propose)
- `.github/workflows/rebuild-yishan-li.yml` — after each successful Production deploy, calls yishan.li's Vercel deploy hook (secret `YISHAN_LI_DEPLOY_HOOK`) so its demo list refreshes. Do not edit per demo.
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
10. The index page at `https://li.yishan.app/` uses the app README's first `# heading` as the name, the first paragraph after it as the description, `artifacts/screenshot.png` as the thumbnail, and the `built` date of the app's entry in `tracking/seen-bookmarks.json` for ordering (newest first) — keep those meaningful and always set `slug` + `built` on the tracking entry. The same list is published as `https://li.yishan.app/demos.json`, which yishan.li reads to show the latest demos (demos without a `built` date are hidden there).
11. Don't add your own "back to index" link: `scripts/build-all.ts` injects a small fixed `← Experiments` pill (`#xbm-home-link`, bottom-left) linking to `https://li.yishan.app/` before `</body>` of every built `dist/<slug>/**/*.html`. Keep the bottom-left ~120×30px corner free of essential controls.
12. Before opening a PR, `bash scripts/build-all.sh` from the repo root must succeed (it fails the deploy if any app fails to build).

## Backends (standing rule): Cloudflare Workers via `cf`

Frontends stay in this repo and deploy through the shared Vercel project at `https://li.yishan.app/<slug>/`. **Any backend a demo needs** (real export, AI calls, storage, realtime, …) is a Cloudflare Worker — never a Vercel function, never a separate server.

- Location: `apps/<slug>/worker/` with its own `package.json`, `bunfig.toml` (`minimumReleaseAge = 259200`), `bun.lock`, `cloudflare.config.ts` (`defineConfig` / `bindings` from `cf/config`), `src/index.ts`, `README.md`. Scaffold with `cfx init workers worker --no-install` from `apps/<slug>/` (note: `cfx init worker` is misparsed as a typo of the `workers` subcommand). Worker name: `<slug>-<purpose>` (e.g. `docu-md-pdf`).
- Deploy with the new `cf` CLI, from `apps/<slug>/worker/`:
  ```bash
  /home/box/tools/cf/cfx workers types      # generates .cloudflare/types (gitignored) for tsc
  /home/box/tools/cf/cfx deploy --dry-run   # build + show bindings
  /home/box/tools/cf/cfx deploy             # -> https://<worker-name>.liyishan.workers.dev
  ```
  `cf` needs Node >= 22 and cannot load `cloudflare.config.ts` under Bun; the box wrapper `cfx` runs it on `/home/box/tools/node22`. Discover commands with `cfx cli search "<anonymous task description>"`. Wrangler (`/home/box/tools/cf/wr`) is a fallback only. If `cf` auth fails, stop and report — don't re-login.
- Pinning: `minimumReleaseAge` blocks very fresh `cf` / `@cloudflare/vite-plugin` betas; pin the newest version older than 3 days in the worker's `package.json` (deploys still go through the box `cfx`).
- CORS locked to `https://li.yishan.app` plus `http://localhost:*` / `http://127.0.0.1:*`; reject other origins. Add a body-size cap and simple abuse protection (rate-limit binding, no open proxying / SSRF).
- Frontend reads the Worker URL from a `VITE_*` env var with the deployed `workers.dev` URL as the default (e.g. `VITE_PDF_API`), so `bun run dev` and the Vercel build work with no extra config.
- Free tier only: **no purchases, plan upgrades, or billing changes**. If a product isn't available on the account's plan, report it instead of working around it.
- Root build skips workers automatically: `scripts/build-all.ts` only builds directories matching `apps/*/package.json` (one level deep), so `apps/<slug>/worker/` is never built or shipped by Vercel. Keep the app's `tsconfig.app.json` `include` at `src` so the app's `tsc -b` doesn't pick up worker code. `bash scripts/build-all.sh` must still pass.
- Document the Worker URL, endpoints, limits and cost in `apps/<slug>/worker/README.md` and the PR.

## After approval

1. Read `skills/project-planning/SKILL.md` and write `apps/<slug>/PLAN.md`.
2. Implement only that app directory.
3. Open one PR with screenshot + video artifacts.
