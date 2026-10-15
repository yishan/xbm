# Open Intelligent UI

Scripted generative-UI chat: each prompt chip answers with interactive design-system components (weather card, metrics chart, trip form, checklist, plan compare). No real model.

## Sub-features

- `prompt-chip` 上海天气 / 本周访问量 / 规划杭州周末 / 发布清单 / 选一个套餐
- `composer` type and 发送
- `theme` 浅色 / 深色 / 跟随系统

## How to get to it (user POV)

- Open `https://li.yishan.app/open-intelligent-ui/` (or the gallery card on `https://li.yishan.app/`), locally `http://127.0.0.1:<port>/open-intelligent-ui/` from `dist/`.
- Choose a suggestion chip under the composer, or type and press 发送.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh open-intelligent-ui` succeeded and `dist/open-intelligent-ui/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** Run `bun scripts/verify.ts open-intelligent-ui`. The `DRIVES["open-intelligent-ui"]` recipe clicks role button "上海天气". A new assistant turn renders a weather component (element count and headings change).
- **Proof.** `.verify/<run>/open-intelligent-ui/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md` with `drive ✅ … UI state changed`.
- **Other sub-features.** Drive them by hand with Playwright (same server, same handles listed above) and save screenshots into the same run dir; do not report them as verified by the default recipe.

## Gotchas

- Responses stream with a delay; the harness waits for network idle + 1.5 s.
