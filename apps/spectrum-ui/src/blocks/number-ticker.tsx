import { useEffect, useRef } from "react"
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
  previousDigit: number | undefined
  place: number
  reducedMotion: boolean
}

function getDigitMap(intString: string): Record<number, number> {
  const map: Record<number, number> = {}

  for (let i = 0; i < intString.length; i++) {
    const place = intString.length - 1 - i
    map[place] = Number(intString[i])
  }

  return map
}

function DigitRoll({
  digit,
  previousDigit,
  place,
  reducedMotion,
}: DigitRollProps) {
  const previous = previousDigit !== undefined ? previousDigit : 0
  const targetY = `-${digit}em`
  const previousY = `-${previous}em`
  const delay = reducedMotion ? 0 : place * 0.04

  return (
    <span
      className="relative inline-block overflow-hidden"
      style={{ width: "0.7ch", height: "1em", lineHeight: 1 }}
      aria-hidden
    >
      <motion.span
        className="flex flex-col"
        style={reducedMotion ? { y: targetY } : undefined}
        initial={reducedMotion ? false : { y: previousY, filter: "blur(3px)" }}
        animate={reducedMotion ? undefined : { y: targetY, filter: "blur(0px)" }}
        transition={
          reducedMotion
            ? undefined
            : { type: "spring", stiffness: 320, damping: 32, delay }
        }
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block" style={{ height: "1em", lineHeight: 1 }}>
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
  const prevIntStringRef = useRef(intString)
  const previousDigitMap = getDigitMap(prevIntStringRef.current)
  const totalPlaces = intString.length

  useEffect(() => {
    prevIntStringRef.current = intString
  }, [intString])

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
      const previousDigit = previousDigitMap[place]

      parts.push(
        <DigitRoll
          key={`digit-${place}`}
          digit={digit}
          previousDigit={previousDigit}
          place={place}
          reducedMotion={reducedMotion}
        />
      )
    }

    if (g < groups.length - 1) {
      parts.push(
        <span key={`sep-${g}`} className="select-none">
          ,
        </span>
      )
    }
  }

  return (
    <div
      data-testid="number-ticker"
      className={cn("inline-flex items-baseline tabular-nums", className)}
    >
      {prefix && <span className="mr-1">{prefix}</span>}
      {parts}
      {suffix && <span className="ml-1">{suffix}</span>}
    </div>
  )
}
