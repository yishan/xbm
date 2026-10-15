# verify-xbm: snapcn — PASS

URL: http://127.0.0.1:<port>/snapcn/
Feature driven: play the first Remotion player

| step | ok | detail |
|---|---|---|
| launch | ✅ | serving http://127.0.0.1:<port>/snapcn/ |
| doctor: http | ✅ | GET http://127.0.0.1:<port>/snapcn/ → 200 |
| doctor: home pill | ✅ | #xbm-home-link present (injected by build-all.ts) |
| doctor: identity | ✅ | title "snapcn · 产品演示组件"; README heading "snapcn 产品演示组件" |
| doctor: console | ✅ | no console errors / page errors on load |
| drive | ✅ | play the first Remotion player: UI state changed |
| drive: console | ✅ | no console errors during drive |
| check: tracking | ✅ | built 2026-10-14 |
| check: sensitive | ✅ | no internal paths/links/keys; 1 email(s) to review |
| evidence: light/dark | ✅ | [shoot] snapcn: luminance light 244 / dark 15 → light + dark |

Evidence:
- skills/verify-xbm/example-run/snapcn/before.png
- skills/verify-xbm/example-run/snapcn/after.png
- skills/verify-xbm/example-run/snapcn/after.aria.yml
- skills/verify-xbm/example-run/snapcn/drive.webm
- skills/verify-xbm/example-run/snapcn/sensitive-scan.txt
- skills/verify-xbm/example-run/snapcn/screenshot.png
- skills/verify-xbm/example-run/snapcn/screenshot-dark.png

Warnings:
- review email: hi@remotion.dev (dist/snapcn/assets/index-DzHSAOq8.js)
- no denylist (skills/verify-xbm/denylist.local.txt or XBM_VERIFY_DENYLIST): names / internal project names not scanned
