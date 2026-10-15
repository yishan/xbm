---
name: verify-xbm
description: "Verify xbm demos (apps/<slug>/ web apps served at li.yishan.app/<slug>/) end to end in a real browser: build + serve dist, health check, drive the demo's main interaction, capture light/dark screenshots + video + PASS/FAIL status, check tracking and scan for sensitive info, clean up. Use before opening or updating any demo PR, after upgrading a demo, or when asked to prove a demo works."
---

# verify-xbm

Scripted proof that an xbm demo works the way a user sees it. Written for an agent reading it cold. Harness: `scripts/verify.ts` (Playwright + Bun). Feature map: [`features/`](features/README.md), one file per demo.

Adapted from the `create-verification-skill` skill in **pstack** by Lauren Tan (https://github.com/cursor/plugins/tree/main/pstack, MIT License, © 2026 Lauren Tan). Structure (launch / doctor / drive / evidence / cleanup + feature map) follows it; the content is specific to this repo.

## TL;DR

```bash
export CHROMIUM_PATH=${CHROMIUM_PATH:-/home/box/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome}  # box; omit if Playwright's Chromium is installed
bun install                                   # root: playwright
bash scripts/build-all.sh snapcn hairline     # or no args = all demos (slow: ~10 min)
bun scripts/verify.ts snapcn hairline         # exit 0 only if every slug PASSes
# evidence: .verify/<timestamp>/<slug>/STATUS.md (+ SUMMARY.md for the run)
```

## 1. Launch

- **Built site (default, matches production):** `bash scripts/build-all.sh <slug>` builds `apps/<slug>/` into `dist/<slug>/`, injects the `#xbm-home-link` pill and writes `dist/index.html` + `dist/demos.json`. Ready = the command exits 0 and prints `[build-all] wrote dist/index.html …`. `scripts/verify.ts` then serves `dist/` on `127.0.0.1:<random port>` (same trailing-slash → `index.html` rule as Vercel) — no port collisions with other agents.
- **Deployed site:** `bun scripts/verify.ts --base https://li.yishan.app <slug>` (no local server; shoot.ts also uses `--base`).
- **Dev server (iterating on one app):** `cd apps/<slug> && bun install && bun run dev` → `http://localhost:5173/<slug>/` (Vite, `base: "/<slug>/"`). `focus-mk3-anatomy` is not Vite: `bun run dev` = `bun build.mjs && bun serve.ts`. The dev server does **not** inject the home pill, so the doctor's pill check only means something on the built site; use `--base http://localhost:5173` for quick drives and ignore that one check, then do a final run on the built site.
- Demos with a Cloudflare Worker (`docu-md`, `pdfcn`) call the deployed `*.workers.dev` URL; the default recipes don't hit it.

## 2. Doctor (health check, read-only)

`scripts/verify.ts` does this first for every slug; if anything looks off, re-run just this slug with `--no-shoot`:

- `GET /<slug>/` → **200**.
- `#xbm-home-link` exists exactly once (proves the page came from the root build).
- Page has a title; README `# heading` is recorded for identity.
- **No console errors, page errors, or HTTP ≥ 400 subresources** on load (and again during the drive).

## 3. Drive

`DRIVES[slug]` in `scripts/verify.ts` clicks the demo's main control by role + accessible name (or a stable `aria-label` / `href` CSS selector), waits for network idle + 1.5 s, and requires an observable state change (URL, headings, control labels, `aria-*`/`data-state`, `aria-live`/status text, iframe/img `src`, element count) plus optional `expectText`. The recipe and the expected end state for each demo are in `features/<slug>.md`. To drive other sub-features, use Playwright directly against the same server with the handles listed there.

## 4. Evidence

Per slug, in `.verify/<timestamp>/<slug>/` (gitignored; `--out DIR` to choose):

| file | what |
|---|---|
| `STATUS.md`, `status.json` | PASS/FAIL + every step with detail. Created **before** launch and rewritten after every step, so a crash still leaves the reason. |
| `before.png`, `after.png`, `after.aria.yml` | action and resulting state (1280×800, light) |
| `drive.webm` | Playwright video of load + drive (rule 6: attach to the PR) |
| `screenshot.png`, `screenshot-dark.png` | copied from `bun scripts/shoot.ts <slug>` (rules 12–13). Missing dark shot = FAIL: demo doesn't follow `prefers-color-scheme`. |
| `sensitive-scan.txt` | scan hits, or `clean` |

`shoot.ts` writes the real thumbnails into `apps/<slug>/artifacts/` — commit them in the demo's PR. Use `--no-shoot` when you must not touch app files (e.g. verifying a demo you are not changing).

Proof standards: drive the real user path (no internal setters / test endpoints); capture action + result, not just a final screen; a run that only proves one entry point does not prove the others.

## 5. Checks

- **Tracking:** `tracking/seen-bookmarks.json` `built[]` has an entry with this `slug` and `built: YYYY-MM-DD`; every `updates[]` item has a `date` and `changes`. (Rule 10: the index orders by `built`; demos without it are hidden on yishan.li.)
- **Sensitive info** (repo rule: no colleague names, internal projects, Linear titles, company data, internal links, keys). Scans rendered page text + every text file in `dist/<slug>/` + `apps/<slug>/README.md` for internal paths (`/workspace/…`, `/home/box/…`, `/cursor/stores/…`, `/Users/<name>/`), internal links (Linear, Slack, Notion, Atlassian), API keys / private keys → **FAIL**; emails (except `example.*`, `email.com`, noreply-style placeholders) → **warning to review by hand**. Names and internal project names can't be regex-detected: put one term per line in `skills/verify-xbm/denylist.local.txt` (gitignored, never commit it) or point `XBM_VERIFY_DENYLIST` at a file; hits are reported by line number, not echoed. Also eyeball `after.png` for real-looking people/company data.

## 6. Cleanup

The script closes the browser and stops the `dist/` server it started — nothing else. It never kills by process name, and never deletes `.verify/`. If you started a dev server yourself, stop that PID only (`kill <pid>` from your own `&` / background job). Delete old `.verify/<timestamp>/` dirs only after their evidence is in a PR.

## Reporting

Put `SUMMARY.md` (table of demo / result / feature / failed steps) in the PR body, attach `screenshot*.png` and `drive.webm` (or link them), and quote any warning you accepted with the reason.

## Maintaining

New demo → add `DRIVES[slug]` and `features/<slug>.md` in the same PR. Changed main control → update both. pstack's `maintain-verification-skill` describes the loop; do not install pstack here, just keep this map honest.
