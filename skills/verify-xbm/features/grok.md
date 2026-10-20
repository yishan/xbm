# 我怎么用 Grok Bot

Static talk page: daily ASCII timeline + weekly strip, one card per bot grouped by role, three collaboration flows, design trade-offs. No network requests.

## Sub-features

- `jump` section nav under the title ([一天的时间线] … [设计取舍]) → anchor links (`#timeline`, `#flows-h`, `#tradeoffs`, …)
- `theme` follows `prefers-color-scheme` (no toggle)

## How to get to it (user POV)

- Open `https://li.yishan.app/grok/`, locally `http://127.0.0.1:<port>/grok/` from `dist/`. Scroll, or click a section in the nav.

## Driving it with scripts/verify.ts

- **Main interaction.** `bun scripts/verify.ts grok`: `DRIVES["grok"]` clicks `a[href="#flows-h"]`; the URL hash changes to `#flows-h` and 协作流程 is in view.
- **Proof.** `.verify/<run>/grok/before.png`, `after.png`, `drive.webm`, `STATUS.md`.

## Gotchas

- Content is rendered by an inline classic script; Vite leaves it as is.
