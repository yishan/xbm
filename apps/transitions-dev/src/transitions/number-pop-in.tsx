import { useState } from "react"
import { useTrigger } from "@/lib/motion"
import type { DemoProps } from "./types"
import "./number-pop-in.css"

const VALUES = ["$1,248.50", "$1,392.07", "$12,480.64", "$9,806.21", "$865.40"]

/** Characters keyed by position-from-the-right so unchanged digits don't remount. */
function toChars(value: string, prev: string) {
  let stagger = 0
  const out: { key: string; ch: string; i: number | null }[] = []
  for (let idx = 0; idx < value.length; idx++) {
    const fromRight = value.length - idx
    const ch = value[idx]
    const prevCh = prev[prev.length - fromRight]
    const changed = prevCh !== ch
    out.push({ key: `${fromRight}-${ch}`, ch, i: changed ? stagger++ : null })
  }
  return out
}

export function NumberPopIn({ trigger }: DemoProps) {
  const [{ index, prev }, setState] = useState({ index: 0, prev: "" })
  const value = VALUES[index]
  const chars = toChars(value, prev)

  useTrigger(trigger, () =>
    setState((s) => ({ index: (s.index + 1) % VALUES.length, prev: VALUES[s.index] })),
  )

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Balance
      </span>
      <span className="t-num text-4xl font-semibold" aria-live="polite" aria-label={value}>
        {chars.map((c) =>
          c.i === null ? (
            <span key={c.key} aria-hidden>
              {c.ch}
            </span>
          ) : (
            <span
              key={c.key}
              aria-hidden
              className="t-num-char"
              style={{ "--i": c.i } as React.CSSProperties}
            >
              {c.ch}
            </span>
          ),
        )}
      </span>
      <span className="text-xs text-emerald-600">+4.2% this week</span>
    </div>
  )
}

export const numberPopInJsx = `const chars = [...value].map((ch, idx) => ({
  ch,
  // key by position-from-right: only changed digits remount (and animate)
  key: \`\${value.length - idx}-\${ch}\`,
}))

<span className="t-num" aria-label={value}>
  {chars.map((c, i) => (
    <span key={c.key} className="t-num-char" style={{ "--i": i }}>
      {c.ch}
    </span>
  ))}
</span>`
