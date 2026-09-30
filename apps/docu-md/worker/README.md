# docu-md PDF Worker

Tiny Cloudflare Worker that turns the docu-md preview (standalone HTML with inlined CSS, Mermaid already rendered as SVG) into an A4 PDF using **Cloudflare Browser Rendering** (`env.BROWSER` + `@cloudflare/puppeteer`).

Deployed at **https://docu-md-pdf.liyishan.workers.dev** (`POST /pdf`, `GET /health`).

## API

`POST /pdf` — `Content-Type: application/json`, body `{ "html": "<!doctype html>…", "filename": "doc.pdf" }` → `application/pdf` attachment.

| Guard | Behaviour |
|-------|-----------|
| CORS / Origin | only `https://li.yishan.app`, `http://localhost:*`, `http://127.0.0.1:*`; POST without an allowed `Origin` → 403 |
| Size cap | 2 MB (Content-Length and actual body) → 413 |
| Rate limit | Workers rate-limit binding, 6 renders / 60 s per IP → 429 |
| Sandbox | page JS disabled; every network request except `data:` is aborted (no SSRF, no external fetches) |
| Browser limits | sessions are reused (`keep_alive` 60 s + `puppeteer.connect`); if Browser Rendering refuses a new browser → 503 + `Retry-After` (the frontend retries) |

## Develop / deploy (cf CLI)

Config lives in `cloudflare.config.ts` (`defineConfig` + `bindings.browser()` / `bindings.rateLimit()` from `cf/config`).

```bash
bun install
# cf needs Node >= 22 and can't load cloudflare.config.ts under Bun.
# On the xbm box use the wrapper (Node 22 in /home/box/tools/node22):
/home/box/tools/cf/cfx workers types     # .cloudflare/types for tsc
/home/box/tools/cf/cfx deploy --dry-run
/home/box/tools/cf/cfx deploy            # -> https://docu-md-pdf.<subdomain>.workers.dev
```

`cf dev` needs a remote browser session for `env.BROWSER`; it's simpler to test against the deployed Worker from `bun run dev` in `apps/docu-md/`.

## Cost

Workers Free + Browser Rendering free allowance (limited browser minutes per day, few concurrent browsers / new browsers per minute). Nothing was purchased and no billing settings were changed. Heavy use will hit the free-tier limits (503/429), not a bill.
