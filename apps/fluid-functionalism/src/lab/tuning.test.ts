import { expect, test } from "bun:test"
import { spring } from "@/lib/springs"
import {
  DEFAULT_TUNING,
  PUBLISHED,
  accentCss,
  applySpringScale,
  effectiveScale,
  toSnippet,
} from "./tuning"

test("published springs match the upstream tokens", () => {
  expect(PUBLISHED.fast.duration).toBe(0.08)
  expect(PUBLISHED.fast.exit).toBe(0.06)
  expect(PUBLISHED.moderate.duration).toBe(0.16)
  expect(PUBLISHED.moderate.bounce).toBe(0)
  expect(PUBLISHED.slow.duration).toBe(0.24)
  expect(PUBLISHED.slow.bounce).toBe(0.12)
  expect(PUBLISHED.slow.exit).toBe(0.16)
})

test("reduced motion zeros the scale even when slow motion is on", () => {
  expect(effectiveScale("soft", true, true)).toBe(0)
  expect(effectiveScale("snappy", false, false)).toBe(0.55)
  expect(effectiveScale("standard", true, false)).toBe(5)
  expect(effectiveScale("soft", false, false)).toBe(1.75)
})

test("applySpringScale writes the shared module and can reset", () => {
  applySpringScale(2)
  expect(spring.fast.duration).toBe(0.16)
  expect(spring.slow.exit.duration).toBe(0.32)
  expect(spring.slow.bounce).toBe(0.12)
  applySpringScale(0)
  expect(spring.fast.duration).toBe(0)
  applySpringScale(1)
  expect(spring.moderate.duration).toBe(PUBLISHED.moderate.duration)
})

test("accent and snippet use the upstream accent variable", () => {
  expect(accentCss(258)).toBe("light-dark(oklch(0.55 0.16 258), oklch(0.78 0.14 258))")
  const snippet = toSnippet({ ...DEFAULT_TUNING, hue: 20, proximity: 12 }, false)
  expect(snippet).toContain("--fluid-accent: light-dark(oklch(0.55 0.16 20), oklch(0.78 0.14 20));")
  expect(snippet).toContain("proximity: 12px")
  expect(snippet).toContain("fast 0.08s")
  const reduced = toSnippet(DEFAULT_TUNING, true)
  expect(reduced).toContain("fast 0.00s")
  expect(reduced).toContain("prefers-reduced-motion")
})
