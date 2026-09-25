import { useEffect, useState } from "react"
import { useTimeouts, useTrigger } from "@/lib/motion"
import type { DemoProps } from "./types"
import "./skeleton-reveal.css"

const LOAD_MS = 1500

export function SkeletonReveal({ trigger }: DemoProps) {
  const [loading, setLoading] = useState(true)
  const timers = useTimeouts()

  const load = () => {
    timers.clear()
    setLoading(true)
    timers.set(() => setLoading(false), LOAD_MS)
  }

  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), LOAD_MS)
    return () => window.clearTimeout(id)
  }, [])

  useTrigger(trigger, load)

  return (
    <div
      className="t-skel w-[260px] rounded-xl border bg-card p-4 shadow-sm"
      data-loading={loading}
      aria-busy={loading}
    >
      <div className="t-skel-placeholder flex flex-col gap-3" aria-hidden>
        <div className="flex items-center gap-3">
          <div className="t-skel-bone size-10 rounded-full bg-muted" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="t-skel-bone h-3 w-24 rounded bg-muted" />
            <div className="t-skel-bone h-2.5 w-32 rounded bg-muted" />
          </div>
        </div>
        <div className="t-skel-bone h-2.5 w-full rounded bg-muted" />
        <div className="t-skel-bone h-2.5 w-4/5 rounded bg-muted" />
      </div>
      <div className="t-skel-content flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-sky-400 text-sm font-semibold text-white">
            AP
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-tight">Ada Park</span>
            <span className="text-xs text-muted-foreground">ada@studio.dev</span>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Product designer. Shipping motion that feels calm, quick and intentional.
        </p>
      </div>
    </div>
  )
}

export const skeletonRevealJsx = `<div className="t-skel" data-loading={loading} aria-busy={loading}>
  <div className="t-skel-placeholder" aria-hidden>
    <div className="t-skel-bone avatar" />
    <div className="t-skel-bone line" />
  </div>
  <div className="t-skel-content">
    <Profile user={user} />
  </div>
</div>`
