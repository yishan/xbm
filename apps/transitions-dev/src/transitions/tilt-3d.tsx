import { useEffect, useRef, useState } from "react"
import { useReducedMotion, useTrigger } from "@/lib/motion"
import type { DemoProps } from "./types"
import "./tilt-3d.css"

const MAX_DEG = 14

export function Tilt3D({ trigger }: DemoProps) {
  const ref = useRef<HTMLDivElement>(null)
  const raf = useRef<number | null>(null)
  const [active, setActive] = useState(false)
  const reduced = useReducedMotion()

  /** px/py are 0..1 within the card */
  const apply = (px: number, py: number) => {
    const el = ref.current
    if (!el) return
    el.style.setProperty("--rx", `${reduced ? 0 : (0.5 - py) * MAX_DEG * 2}deg`)
    el.style.setProperty("--ry", `${reduced ? 0 : (px - 0.5) * MAX_DEG * 2}deg`)
    el.style.setProperty("--gx", `${px * 100}%`)
    el.style.setProperty("--gy", `${py * 100}%`)
  }
  const reset = () => {
    setActive(false)
    ref.current?.style.setProperty("--rx", "0deg")
    ref.current?.style.setProperty("--ry", "0deg")
  }

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (raf.current) cancelAnimationFrame(raf.current)
    const r = e.currentTarget.getBoundingClientRect()
    setActive(true)
    apply((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height)
  }

  // Replay: sweep a virtual pointer along a figure-eight, then let go.
  useTrigger(trigger, () => {
    if (raf.current) cancelAnimationFrame(raf.current)
    const start = performance.now()
    const DURATION = 2200
    setActive(true)
    const tick = (now: number) => {
      const t = (now - start) / DURATION
      if (t >= 1) return reset()
      const a = t * Math.PI * 2
      apply(0.5 + Math.sin(a) * 0.45, 0.5 + Math.sin(a * 2) * 0.35)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  })

  useEffect(() => () => {
    if (raf.current) cancelAnimationFrame(raf.current)
  }, [])

  return (
    <div
      ref={ref}
      className="t-tilt"
      data-active={active ? "" : undefined}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <div className="t-tilt-card flex h-[140px] w-[228px] flex-col justify-between rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-violet-900 p-4 text-white shadow-xl shadow-violet-950/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium tracking-wide text-white/70">Northwind</span>
          <span className="text-sm font-semibold italic">credit</span>
        </div>
        <div className="h-6 w-8 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 opacity-90" />
        <div className="flex items-end justify-between">
          <span className="font-mono text-[13px] tracking-widest">4242 •••• 1837</span>
          <span className="text-[10px] text-white/70">12/29</span>
        </div>
        <div className="t-tilt-glare" aria-hidden />
      </div>
    </div>
  )
}

export const tilt3dJsx = `const onMove = (e) => {
  const r = e.currentTarget.getBoundingClientRect()
  const px = (e.clientX - r.left) / r.width
  const py = (e.clientY - r.top) / r.height
  el.style.setProperty("--rx", \`\${(0.5 - py) * 28}deg\`)
  el.style.setProperty("--ry", \`\${(px - 0.5) * 28}deg\`)
  el.style.setProperty("--gx", \`\${px * 100}%\`)
  el.style.setProperty("--gy", \`\${py * 100}%\`)
}

<div ref={ref} className="t-tilt" data-active={hovering || undefined}
  onPointerMove={onMove} onPointerLeave={reset}>
  <div className="t-tilt-card">
    …card…
    <div className="t-tilt-glare" aria-hidden />
  </div>
</div>`
