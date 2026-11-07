import { spring } from "@/lib/springs"

export const SPEED_PRESETS = ["snappy", "standard", "soft"] as const
export type SpeedPreset = (typeof SPEED_PRESETS)[number]

export const SHAPES = ["sharp", "rounded", "pill"] as const
export type ShapeName = (typeof SHAPES)[number]

export const DENSITIES = ["default", "compact"] as const
export type Density = (typeof DENSITIES)[number]

export type Tuning = {
  speed: SpeedPreset
  slow: boolean
  hue: number
  density: Density
  shape: ShapeName
  surface: number
  proximity: number
}

export const DEFAULT_TUNING: Tuning = {
  speed: "standard",
  slow: false,
  hue: 258,
  density: "default",
  shape: "rounded",
  surface: 3,
  proximity: 24,
}

/** Published spring tokens, captured before the lab scales them. */
export const PUBLISHED = {
  fast: {
    duration: spring.fast.duration,
    bounce: spring.fast.bounce,
    exit: spring.fast.exit.duration,
  },
  moderate: {
    duration: spring.moderate.duration,
    bounce: spring.moderate.bounce,
    exit: spring.moderate.exit.duration,
  },
  slow: {
    duration: spring.slow.duration,
    bounce: spring.slow.bounce,
    exit: spring.slow.exit.duration,
  },
} as const

const SPEED_SCALE: Record<SpeedPreset, number> = {
  snappy: 0.55,
  standard: 1,
  soft: 1.75,
}

export const SLOW_FACTOR = 5

export function effectiveScale(speed: SpeedPreset, slow: boolean, reduced: boolean): number {
  if (reduced) return 0
  return SPEED_SCALE[speed] * (slow ? SLOW_FACTOR : 1)
}

type MutableTier = { duration: number; bounce: number; exit: { duration: number } }

/** Writes the scale into the shared spring module so every component reads it. */
export function applySpringScale(scale: number) {
  const live = spring as unknown as Record<keyof typeof PUBLISHED, MutableTier>
  const keys = Object.keys(PUBLISHED) as (keyof typeof PUBLISHED)[]
  for (const key of keys) {
    live[key].duration = round3(PUBLISHED[key].duration * scale)
    live[key].exit.duration = round3(PUBLISHED[key].exit * scale)
    live[key].bounce = PUBLISHED[key].bounce
  }
}

export function springReadout(scale: number): Record<keyof typeof PUBLISHED, string> {
  return {
    fast: formatSeconds(PUBLISHED.fast.duration * scale),
    moderate: formatSeconds(PUBLISHED.moderate.duration * scale),
    slow: formatSeconds(PUBLISHED.slow.duration * scale),
  }
}

export function accentCss(hue: number): string {
  const h = clamp(Math.round(hue), 0, 360)
  return `light-dark(oklch(0.55 0.16 ${h}), oklch(0.78 0.14 ${h}))`
}

export function toSnippet(tuning: Tuning, reduced: boolean): string {
  const scale = effectiveScale(tuning.speed, tuning.slow, reduced)
  const read = springReadout(scale)
  const reducedNote = reduced
    ? "prefers-reduced-motion 生效，弹簧时长为 0，慢动作不覆盖该设置。\n"
    : ""
  return `/* Fluid Functionalism
   ${reducedNote}shape: ${tuning.shape}
   size: ${tuning.density}
   surface: ${tuning.surface}
   proximity: ${tuning.proximity}px
   spring scale: ${scale.toFixed(2)}
   fast ${read.fast} / moderate ${read.moderate} / slow ${read.slow}
*/
:root {
  --fluid-accent: ${accentCss(tuning.hue)};
  --focus-ring: var(--fluid-accent);
}
`
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000
}

function formatSeconds(n: number): string {
  return `${round3(n).toFixed(2)}s`
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
