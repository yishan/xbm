export type Origin = "trigger" | "center" | "top"

export type Tuning = {
  duration: number /* ms, 0-1200 */
  easing: string /* key of EASINGS */
  scale: number /* 0.5-1, enter scale */
  origin: Origin
  radius: number /* px, 0-28 */
  shadow: number /* 0-100 depth */
  hue: number /* 0-360 */
  slow: boolean
}

export const DEFAULT_TUNING: Tuning = {
  duration: 220,
  easing: "out-quint",
  scale: 0.92,
  origin: "trigger",
  radius: 14,
  shadow: 55,
  hue: 40,
  slow: false,
}

export const EASINGS: { id: string; label: string; value: string }[] = [
  { id: "out-quint", label: "Out quint", value: "cubic-bezier(0.22, 1, 0.36, 1)" },
  { id: "drawer", label: "Drawer", value: "cubic-bezier(0.32, 0.72, 0, 1)" },
  { id: "out-expo", label: "Out expo", value: "cubic-bezier(0.16, 1, 0.3, 1)" },
  { id: "in-out-cubic", label: "In-out cubic", value: "cubic-bezier(0.65, 0, 0.35, 1)" },
  { id: "overshoot", label: "Overshoot", value: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
  { id: "ease", label: "Ease", value: "ease" },
  { id: "linear", label: "Linear", value: "linear" },
]

const round2 = (n: number) => Math.round(n * 100) / 100

export function toVars(t: Tuning): Record<string, string> {
  const factor = t.slow ? 5 : 1
  const duration = Math.round(t.duration * factor)
  const exit = Math.round(t.duration * 0.75 * factor)
  const easing = EASINGS.find((item) => item.id === t.easing)?.value ?? EASINGS[0].value

  const d = t.shadow / 100
  const shadow = [
    `0 0 0 1px oklch(0 0 0 / ${round2(0.06 + 0.04 * d)})`,
    `0 ${round2(1 + 3 * d)}px ${round2(2 + 6 * d)}px oklch(0 0 0 / ${round2(0.04 + 0.08 * d)})`,
    `0 ${round2(4 + 20 * d)}px ${round2(8 + 40 * d)}px -${round2(4 + 8 * d)}px oklch(0 0 0 / ${round2(
      0.06 + 0.22 * d,
    )})`,
  ].join(", ")

  const shadowDark = [
    `0 0 0 1px oklch(1 0 0 / ${round2(0.08 + 0.08 * d)})`,
    `0 ${round2(4 + 20 * d)}px ${round2(8 + 40 * d)}px -${round2(4 + 8 * d)}px oklch(0 0 0 / ${round2(
      0.3 + 0.4 * d,
    )})`,
  ].join(", ")

  return {
    "--lab-duration": `${duration}ms`,
    "--lab-exit": `${exit}ms`,
    "--lab-ease": easing,
    "--lab-scale": String(t.scale),
    "--lab-radius": `${t.radius}px`,
    "--lab-radius-inner": `${Math.max(0, t.radius - 6)}px`,
    "--lab-hue": String(t.hue),
    "--lab-shadow": shadow,
    "--lab-shadow-dark": shadowDark,
  }
}

export function toCss(t: Tuning): string {
  const vars = toVars(t)
  const rootBlock = Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n")
  const origin =
    t.origin === "trigger"
      ? "var(--transform-origin)"
      : t.origin === "center"
        ? "center"
        : "top center"

  return `:root {
  --lab-accent: oklch(0.62 0.17 var(--lab-hue));
  --lab-accent-soft: oklch(0.95 0.04 var(--lab-hue));
  --lab-accent-ink: oklch(0.45 0.18 var(--lab-hue));
  --lab-accent-fg: oklch(0.99 0 0);
  --z-bar: 10;
  --z-popup: 20;
  --z-toast: 30;
  --z-labels: 40;
${rootBlock}
}

:root.dark {
  --lab-accent: oklch(0.7 0.15 var(--lab-hue));
  --lab-accent-soft: oklch(0.3 0.08 var(--lab-hue));
  --lab-accent-ink: oklch(0.85 0.1 var(--lab-hue));
  --lab-accent-fg: oklch(0.18 0 0);
}

.popup {
  background: var(--popover);
  color: var(--popover-foreground);
  border-radius: var(--lab-radius);
  box-shadow: var(--lab-shadow);
  padding: 6px;
  transform-origin: ${origin};
  transition-property: transform, opacity;
  transition-duration: var(--lab-duration);
  transition-timing-function: var(--lab-ease);
}

.popup[data-starting-style],
.popup[data-ending-style] {
  opacity: 0;
  transform: scale(var(--lab-scale));
}

.popup[data-ending-style] {
  transition-duration: var(--lab-exit);
}

.dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  width: min(420px, calc(100vw - 32px));
  padding: 24px;
  border-radius: calc(var(--lab-radius) + 6px);
  background: var(--popover);
  color: var(--popover-foreground);
  box-shadow: var(--lab-shadow);
  transform: translate(-50%, -50%) scale(1);
  transform-origin: center;
  transition-property: transform, opacity;
  transition-duration: var(--lab-duration);
  transition-timing-function: var(--lab-ease);
}

.dialog[data-starting-style],
.dialog[data-ending-style] {
  opacity: 0;
  transform: translate(-50%, -50%) scale(var(--lab-scale));
}

.dialog[data-ending-style] {
  transition-duration: var(--lab-exit);
}

.backdrop {
  position: fixed;
  inset: 0;
  background: oklch(0 0 0 / 0.35);
  backdrop-filter: blur(4px);
  transition-property: opacity;
  transition-duration: var(--lab-duration);
  transition-timing-function: var(--lab-ease);
}

.backdrop[data-starting-style],
.backdrop[data-ending-style] {
  opacity: 0;
}

.toast-viewport {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: var(--z-toast);
  width: 320px;
  isolation: isolate;
}

.toast {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  padding: 12px 14px;
  border-radius: var(--lab-radius);
  background: var(--popover);
  color: var(--popover-foreground);
  box-shadow: var(--lab-shadow);
  transform-origin: bottom center;
  transform: translateY(calc(var(--toast-index, 0) * -10px)) scale(calc(1 - var(--toast-index, 0) * 0.05));
  z-index: calc(10 - var(--toast-index, 0));
  transition-property: transform, opacity;
  transition-duration: var(--lab-duration);
  transition-timing-function: var(--lab-ease);
}

.toast[data-starting-style] {
  opacity: 0;
  transform: translateY(120%);
}

.toast[data-ending-style] {
  opacity: 0;
  transform: translateX(110%);
}

.tab-indicator {
  position: absolute;
  left: 0;
  top: var(--active-tab-top, 0px);
  translate: var(--active-tab-left, 0px) 0;
  width: var(--active-tab-width, 0px);
  height: var(--active-tab-height, 0px);
  border-radius: var(--lab-radius-inner);
  background: var(--background);
  box-shadow: var(--lab-shadow);
  z-index: 0;
  /* Exception to "transform/opacity only": the tab indicator has to travel
     between tabs, which is a layout offset, so left/width are animated. */
  transition-property: translate, width;
  transition-duration: var(--lab-duration);
  transition-timing-function: var(--lab-ease);
}

.dark .popup,
.dark .dialog,
.dark .toast,
.dark .tab-indicator {
  box-shadow: var(--lab-shadow-dark);
}
`
}
