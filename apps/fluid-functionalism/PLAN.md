# Fluid Functionalism

## Goal

一个可交互的实验室：用 Fluid Functionalism 注册表里的真实组件，当场调节弹簧、强调色、接近高亮、表面和密度，并复制当前主题。

## MVP

- 板上有 Button、Dialog、Select、Tabs、Switch、Slider、Dropdown、ChatMessage、ThinkingIndicator，以及一条用 `useFluidHover` 的列表。
- 调节立刻作用：弹簧三档倍率、慢动作、OKLCH 色相、接近半径、表面层级 1–8、密度、圆角。
- 同一动作的 Radix 按钮和 Base UI 按钮并排。
- 跟随系统明暗，可切到浅色或深色。`prefers-reduced-motion` 关掉动画，慢动作不能覆盖它。
- 复制一段含 `--fluid-accent` 和当前弹簧读数的片段。示例文案标为示例数据。

## 不做

- 不安装两套会互相覆盖文件名的完整组件。Radix 只保留 Button。
- 不做注册表里不存在的「边框 / 阴影」开关。表面用现成的 8 级层级。
- 不接后端、不调用付费接口、不放公司或同事数据。

## 任务

1. 用官方 Vite 脚手架，锁住三天内的包版本，再从注册表装 Base UI 组件。
2. 把弹簧倍率、强调色和接近半径接到组件实际读取的对象和变量上。
3. 写出中文实验室，并补上系统深色、减弱动效和主题复制。
4. 用 `bun test` 锁住倍率计算，再用构建和浏览器把每项调节点一遍。

## 技术选择

- Vite + React：单页实验室，`base` 为 `/fluid-functionalism/`。
- Tailwind v4：注册表令牌和工具类都从这里发出。
- Fluid Functionalism 注册表（Base UI）：组件、弹簧、表面和悬停都用上游实现。
- `@radix-ui/react-slot`：只给并排的 Radix Button。
- `@fontsource-variable/inter` 的 standard 入口：可变字重含 `opsz`，不依赖站点上的绝对字体地址。
- Bun：安装、测试和脚本。`minimumReleaseAge = 259200`。

## 推迟

- 其余 Radix 组件。两套味道会写进同一批文件名，不能同时从 CLI 安装。
- 上游 `theme-context` 的视图过渡。注册表没有这份 JSON，而且过渡会在换主题时带动整页。
