# fx0 设计风格对比

One product brief (Pulse 笔记 pricing page) rendered in four fx0 design.md presets side by side, plus a prompt → HTML turn history. All pre-generated 示例数据; no model calls.

## Sub-features

- tab `并排对比`: 4 iframes (vercel.md / stripe.md / airbnb.md / apple.md)
- tab `逐轮版本`: buttons `第 1 轮` … `第 3 轮`, style `<select id="tp">`, live output `版本 vN`
- theme group `主题`: 跟随系统 / 浅色 / 深色 (iframes re-render)

## How to get to it (user POV)

- Open `https://li.yishan.app/fx0/` (locally `http://127.0.0.1:<port>/fx0/` from `dist/`).

## Driving it with scripts/verify.ts

Preconditions: `bash scripts/build-all.sh fx0` succeeded; doctor steps pass.

- **Main interaction.** `DRIVES["fx0"]` clicks tab `逐轮版本`, then button `第 2 轮`; expects text `版本 v2` and the preview iframe to change.
- **Proof.** `.verify/<run>/fx0/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md`.
- **Other sub-features.** Drive by hand with Playwright; not covered by the default recipe.

## Gotchas

- Iframes use `srcdoc`; their content is regenerated on theme change.
