import { useState } from "react"
import { useTrigger } from "@/lib/motion"
import type { DemoProps } from "./types"
import "./success-check.css"

export function SuccessCheck({ trigger }: DemoProps) {
  const [run, setRun] = useState(0)
  useTrigger(trigger, () => setRun((r) => r + 1))

  return (
    <div key={run} className="flex flex-col items-center gap-3" role="status">
      <div className="t-check-badge grid size-14 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
        <svg viewBox="0 0 24 24" className="size-7" fill="none" aria-hidden>
          <path
            className="t-check-path"
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="t-check-label text-center">
        <p className="text-sm font-medium">Payment sent</p>
        <p className="text-xs text-muted-foreground">$240.00 to Ada Park</p>
      </div>
    </div>
  )
}

export const successCheckJsx = `// remount (key) to replay
<div key={run} role="status">
  <div className="t-check-badge">
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path className="t-check-path" d="M5 12.5l4.5 4.5L19 7.5"
        stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  </div>
  <p className="t-check-label">Payment sent</p>
</div>`
