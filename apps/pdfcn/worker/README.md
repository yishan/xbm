# pdfcn PDF Worker

Tiny Cloudflare Worker that turns the pdfcn A4 preview (a standalone HTML snapshot of the current template with the document theme applied, all CSS inlined and the Geist font embedded as `data:` URLs) into a real A4 PDF using **Cloudflare Browser Rendering** (`env.BROWSER` + `@cloudflare/puppeteer`).

Deployed at **https://pdfcn-pdf.liyishan.workers.dev** (`POST /pdf`, `GET /health`).

Same hardening as [`apps/docu-md/worker`](../../docu-md/worker/README.md) (`docu-md-pdf`); it's a separate Worker so the two demos have independent rate limits and can change independently.

## API

`POST /pdf` — `Content-Type: application/json`, body `{ "html": "<!doctype html>…", "filename": "invoice-professional.pdf" }` → `application/pdf` attachment.

The page is rendered with a 794×1123 viewport (A4 at 96 dpi, same as the on-screen page), `format: "A4"`, `printBackground: true`, `preferCSSPageSize: true` and **0 margins**. The frontend sends `@page { size: A4; margin: 0 }` and puts the theme background on `html, body`: Cloudflare's Chromium does not paint `@page` backgrounds, so this is how the theme colour fills every page edge to edge.

| Guard | Behaviour |
|-------|-----------|
| CORS / Origin | only `https://li.yishan.app`, `http://localhost:*`, `http://127.0.0.1:*`; POST without an allowed `Origin` → 403 |
| Size cap | 2 MB (Content-Length and actual body) → 413 |
| Rate limit | Workers rate-limit binding, 6 renders / 60 s per IP → 429 |
| Sandbox | page JS disabled; every network request except `data:` is aborted (no SSRF, no external fetches) |
| Browser limits | sessions are reused (`keep_alive` 60 s + `puppeteer.connect`); if Browser Rendering refuses a new browser → 503 + `Retry-After` (the frontend retries up to 3×) |

## Develop / deploy (cf CLI)

Config lives in `cloudflare.config.ts` (`defineConfig` + `bindings.browser()` / `bindings.rateLimit()` from `cf/config`).

```bash
bun install
# cf needs Node >= 22 and can't load cloudflare.config.ts under Bun.
# On the xbm box use the wrapper (Node 22 in /home/box/tools/node22):
/home/box/tools/cf/cfx workers types     # .cloudflare/types for tsc
/home/box/tools/cf/cfx deploy --dry-run
/home/box/tools/cf/cfx deploy            # -> https://pdfcn-pdf.<subdomain>.workers.dev
```

`cf dev` needs a remote browser session for `env.BROWSER`; it's simpler to test against the deployed Worker from `bun run dev` in `apps/pdfcn/` (localhost is allowed by CORS). Point the frontend at another deployment with `VITE_PDF_API=https://… bun run dev`.

## Cost

Workers Free + Browser Rendering free allowance (limited browser minutes per day, few concurrent browsers / new browsers per minute). Nothing was purchased and no billing settings were changed. Heavy use will hit the free-tier limits (503/429), not a bill.
