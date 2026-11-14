# UI SDK

Behavior lab for `@ui-sdk/core` 0.1.0-beta.2. Toggles popup, selection, typeahead and focus recovery, and assembles a sample requirements board. Samples are 示例数据.

## Sub-features

- `lab` 行为: 弹出层, 单选 / 多选, 键入定位, 焦点回收, 恢复
- `inspector` 检查器 reads live slot attributes and focus
- `owner` 按负责人筛选
- `tags` 多选标签
- `rank` 拖动调整优先级, keyboard grab and pointer drag
- `style` 圆角, 密度, 动效, 系统 / 浅色 / 深色

## How to get to it (user POV)

- Open `https://li.yishan.app/ui-sdk/`, locally `http://127.0.0.1:<port>/ui-sdk/` from `dist/`.
- The owner, status and environment lists are inline. Click `拖动调整优先级`.

## Driving it with scripts/verify.ts

Preconditions:

- `bash scripts/build-all.sh ui-sdk` succeeded and `dist/ui-sdk/index.html` exists.
- Doctor steps pass (HTTP 200, `#xbm-home-link`, no console errors).

- **Main interaction.** `bun scripts/verify.ts ui-sdk` clicks the radio `拖动调整优先级`. The code panel contains `createReorder` and the board becomes a sortable list.
- **Proof.** `.verify/<run>/ui-sdk/before.png`, `after.png`, `after.aria.yml`, `drive.webm`, `STATUS.md`.
- **Other sub-features.** Drive by hand with Playwright against the same server: 弹出层, 多选, typeahead, 焦点回收, 圆角, 390px, light, dark, reduced motion.

## Gotchas

- `selectPreset` is not a public export. Popup content is `role="dialog"`; the list inside is `role="listbox"`.
- `createFocusRecovery` does not steal focus from another control. 移出焦点项 keeps the option focused with `pointerdown` `preventDefault`.
- Popup placement uses `transform`. The demo animates opacity only.
- `@ui-sdk/react` and `@ui-sdk/core` are pinned to `0.1.0-beta.2`. `bunfig.toml` excludes those two package names from the 3-day age gate.
