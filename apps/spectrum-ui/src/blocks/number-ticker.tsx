// Rolling digit ticker: each digit is a 0–9 strip that springs into place with a per-digit stagger.
// Inspired by Spectrum UI (ui.spectrumhq.in). Re-implemented from scratch.

import type { ReactElement } from "react"
import { motion, useReducedMotionConfig } from "motion/react"
import { cn } from "@/lib/utils"

type NumberTickerProps = {
  value: number
  minDigits?: number
  className?: string
  prefix?: string
  suffix?: string
}

type DigitRollProps = {
  digit: number
  place: number
  reducedMotion: boolean
}

function DigitRoll({
  digit,
  place,
  reducedMotion,
}: DigitRollProps) {
  const targetY = `-${digit}em`
  const delay = reducedMotion ? 0 : place * 0.04

  return (
    <span
      className="inline-block h-[1em] w-[0.62em] overflow-hidden leading-none text-center"
      aria-hidden
    >
      <motion.span
        className="flex flex-col"
        style={reducedMotion ? { y: targetY } : undefined}
        initial={reducedMotion ? false : { y: "0em" }}
        animate={reducedMotion ? undefined : { y: targetY }}
        transition={
          reducedMotion
            ? undefined
            : { type: "spring", stiffness: 320, damping: 32, delay }
        }
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[1em] leading-none">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

export function NumberTicker({
  value,
  minDigits = 1,
  className,
  prefix,
  suffix,
}: NumberTickerProps) {
  const reducedMotion = useReducedMotionConfig() ?? false
  const intString = Math.trunc(Math.abs(value)).toString().padStart(minDigits, "0")
  const totalPlaces = intString.length


  const groups: string[] = []
  let remaining = intString

  while (remaining.length > 3) {
    groups.unshift(remaining.slice(-3))
    remaining = remaining.slice(0, -3)
  }

  groups.unshift(remaining)

  let globalIndex = 0
  const parts: ReactElement[] = []

  for (let g = 0; g < groups.length; g++) {
    const group = groups[g]

    for (let j = 0; j < group.length; j++) {
      const char = group[j]
      const place = totalPlaces - 1 - globalIndex
      globalIndex++

      const digit = Number(char)

      parts.push(
        <DigitRoll
          key={`digit-${place}`}
          digit={digit}
          place={place}
          reducedMotion={reducedMotion}
        />
      )
    }

    if (g < groups.length - 1) {
      parts.push(
        <span key={`sep-${g}`} className="select-none h-[1em] leading-none">
          ,
        </span>
      )
    }
  }

  return (
    <div
      data-testid="number-ticker"
      role="img"
      aria-label={`${prefix ?? ""}${value.toLocaleString("en-US")}${suffix ?? ""}`}
      className={cn("inline-flex items-start leading-none tabular-nums", className)}
    >
      {prefix && <span className="mr-1 h-[1em] leading-none">{prefix}</span>}
      {parts}
      {suffix && <span className="ml-1 h-[1em] leading-none">{suffix}</span>}
    </div>
  )
}
