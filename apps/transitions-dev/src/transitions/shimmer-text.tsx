import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useTrigger } from "@/lib/motion"
import type { DemoProps } from "./types"
import "./shimmer-text.css"

const STATES = ["Planning next moves", "Reading 12 files", "Drafting the patch", "Running the tests"]

export function ShimmerText({ trigger }: DemoProps) {
  const [i, setI] = useState(0)
  useTrigger(trigger, () => setI((n) => (n + 1) % STATES.length))

  return (
    <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 shadow-sm">
      <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
      <span key={i} className="t-shimmer-swap" role="status">
        <span className="t-shimmer text-sm font-medium">{STATES[i]}…</span>
      </span>
    </div>
  )
}

export const shimmerTextJsx = `<span key={status} className="t-shimmer-swap" role="status">
  <span className="t-shimmer">{status}…</span>
</span>`
