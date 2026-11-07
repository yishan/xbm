# fluid-functionalism

Live lab of Fluid Functionalism registry components (Base UI, plus a Radix Button). Spring speed, accent hue, hover proximity, surface level and density apply immediately. Slow motion and copy-theme sit in the same panel.

## Sub-features

- `dialog` 打开对话框 / 关闭
- `menu` 范围
- `select` 水果（荔枝 / 龙眼 / 柚子）
- `tabs` 概览 / 明细 / 记录
- `tuning` 弹簧、慢动作、色相、表面、接近、密度、圆角、复制主题、重置
- `theme` 浅色 / 深色
- `motion` 移动、发送

## How to get to it (user POV)

- Open `https://li.yishan.app/fluid-functionalism/`, locally `http://127.0.0.1:<port>/fluid-functionalism/` from `dist/`.
- Click `打开对话框`.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh fluid-functionalism` succeeded and `dist/fluid-functionalism/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** `bun scripts/verify.ts fluid-functionalism` clicks role button "打开对话框"; the dialog shows 示例数据.
- **Proof.** `.verify/<run>/fluid-functionalism/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md`.
- **Other sub-features.** Drive by hand with Playwright against the same server: sliders, reset, copy, theme, menu, keyboard, 390px, light, dark, reduced motion.

## Gotchas

- `--fluid-accent` is set on `<html>`, so portaled dialogs, menus and focus rings follow the hue.
- Spring durations are written onto the shared `spring` module. `prefers-reduced-motion` forces that scale to 0 and skips motion; slow motion does not override it.
- Sample sentences are 示例数据. ThinkingIndicator keeps its upstream English words.
