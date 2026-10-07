---
template: sheet
theme: auto
title: Vercel frontend vs Cloudflare Worker backend
subtitle: The xbm standing rule for demo backends
cols: 3
source: xbm AGENTS.md (Backends standing rule)
---
One rule for every xbm demo: the frontend is a static app on Vercel, and any backend is a Cloudflare Worker.

## A Comparison {span=2}

| Aspect | Vercel (frontend) | Cloudflare Worker (backend) |
| --- | --- | --- |
| Where | `apps/<slug>/` in the xbm repo | `apps/<slug>/worker/` in the xbm repo |
| What runs there | the built static app | the backend: real export, AI calls, storage, realtime |
| Deploy | ONE shared Vercel project "xbm". The root scripts/build-all.sh builds every apps/*/package.json into `dist/<slug>/` and the index page. The root build skips worker/ folders (only apps/*/package.json one level deep). | cf CLI through the box wrapper cfx, needs Node >= 22: cfx workers types, cfx deploy --dry-run, then cfx deploy. Wrangler is fallback only. |
| URL | `https://li.yishan.app/<slug>/` | `https://<worker-name>.liyishan.workers.dev` |
| Config | vite base must be `"/<slug>/"`. The frontend reads the Worker URL from a VITE_* env var, for example VITE_PDF_API, with the workers.dev URL as default. | worker name `<slug>-<purpose>`, for example docu-md-pdf |
| Limits / cost | free tier only: no purchases, upgrades or billing changes | free tier only: no purchases, upgrades or billing changes |
| Allowed? | no Vercel functions | ok Worker only; no separate server |

## B Decision

```flow LR
{Needs a backend?} -> [Static app on Vercel]: no
{Needs a backend?} -> *[Worker in apps/slug/worker]: yes
[Worker in apps/slug/worker] -> [(workers.dev URL)]: cfx deploy
[Static app on Vercel] -> [(li.yishan.app/slug)]: build-all.sh
```

## C Worker checklist

```kv
CORS: https://li.yishan.app plus localhost / 127.0.0.1 only
Body size: capped
Abuse: rate-limit binding
Proxy: no open proxy, no SSRF
```

## D This demo

```callout ok Pure frontend
answer-me-with-html is a static app on the shared Vercel project. It has no Worker.
```
