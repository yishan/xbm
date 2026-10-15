# verify-xbm: hairline — PASS

URL: http://127.0.0.1:<port>/hairline/
Feature driven: switch to 02 协作场景 (simulated agent task)

| step | ok | detail |
|---|---|---|
| launch | ✅ | serving http://127.0.0.1:<port>/hairline/ |
| doctor: http | ✅ | GET http://127.0.0.1:<port>/hairline/ → 200 |
| doctor: home pill | ✅ | #xbm-home-link present (injected by build-all.ts) |
| doctor: identity | ✅ | title "Hairline 细线实验室"; README heading "Hairline 细线实验室" |
| doctor: console | ✅ | no console errors / page errors on load |
| drive | ✅ | switch to 02 协作场景 (simulated agent task): UI state changed |
| drive: console | ✅ | no console errors during drive |
| check: tracking | ✅ | built 2026-10-05, 1 update(s), latest 2026-10-15 |
| check: sensitive | ✅ | no internal paths/links/keys; 0 email(s) to review |
| evidence: light/dark | ✅ | [shoot] hairline: luminance light 246 / dark 27 → light + dark |

Evidence:
- skills/verify-xbm/example-run/hairline/before.png
- skills/verify-xbm/example-run/hairline/after.png
- skills/verify-xbm/example-run/hairline/after.aria.yml
- skills/verify-xbm/example-run/hairline/drive.webm
- skills/verify-xbm/example-run/hairline/sensitive-scan.txt
- skills/verify-xbm/example-run/hairline/screenshot.png
- skills/verify-xbm/example-run/hairline/screenshot-dark.png

Warnings:
- no denylist (skills/verify-xbm/denylist.local.txt or XBM_VERIFY_DENYLIST): names / internal project names not scanned
