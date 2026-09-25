import { useState } from "react"
import { Check, Copy, Moon, Pause, Play, Sun, type LucideIcon } from "lucide-react"
import { useTrigger } from "@/lib/motion"
import type { DemoProps } from "./types"
import "./icon-swap.css"

const PAIRS: { a: LucideIcon; b: LucideIcon; label: [string, string] }[] = [
  { a: Copy, b: Check, label: ["Copy", "Copied"] },
  { a: Play, b: Pause, label: ["Play", "Pause"] },
  { a: Sun, b: Moon, label: ["Light", "Dark"] },
]

export function IconSwap({ trigger }: DemoProps) {
  const [on, setOn] = useState([false, false, false])

  useTrigger(trigger, () => setOn((s) => s.map((v) => !v)))

  return (
    <div className="flex items-center gap-3">
      {PAIRS.map(({ a: A, b: B, label }, i) => (
        <button
          key={label[0]}
          onClick={() => setOn((s) => s.map((v, j) => (j === i ? !v : v)))}
          aria-label={on[i] ? label[1] : label[0]}
          className="t-swap size-12 rounded-xl border bg-card shadow-sm transition-colors hover:bg-muted"
          style={{ "--delay": `${i * 70}ms` } as React.CSSProperties}
        >
          <A data-shown={!on[i]} className="size-5" aria-hidden />
          <B
            data-shown={on[i]}
            className={i === 0 ? "size-5 text-emerald-600" : "size-5"}
            aria-hidden
          />
        </button>
      ))}
    </div>
  )
}

export const iconSwapJsx = `<button className="t-swap" onClick={() => setCopied(!copied)}
  aria-label={copied ? "Copied" : "Copy"}>
  <CopyIcon data-shown={!copied} aria-hidden />
  <CheckIcon data-shown={copied} aria-hidden />
</button>`
