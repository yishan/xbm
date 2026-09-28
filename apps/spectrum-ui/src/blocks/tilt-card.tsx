// 3D card that tilts toward the pointer with parallax depth layers and a moving glare.
// Inspired by Spectrum UI (ui.spectrumhq.in). Re-implemented from scratch.

import { useRef, useState } from "react"
import type { HTMLAttributes, MouseEvent, ReactNode } from "react"
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotionConfig,
  useSpring,
} from "motion/react"
import { cn } from "@/lib/utils"

export type TiltCardProps = {
  title?: string
  subtitle?: string
  children?: ReactNode
  className?: string
  maxTilt?: number
} & Omit<HTMLAttributes<HTMLDivElement>, "children" | "title" | "className">

export function TiltCard({
  title = "Research agent",
  subtitle = "Online · 3 tasks queued",
  children,
  className,
  maxTilt = 14,
  ...divProps
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotionConfig()
  const [hovered, setHovered] = useState(false)

  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springRotateX = useSpring(rotateX, { stiffness: 260, damping: 22 })
  const springRotateY = useSpring(rotateY, { stiffness: 260, damping: 22 })

  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)
  const springGlareX = useSpring(glareX, { stiffness: 200, damping: 22 })
  const springGlareY = useSpring(glareY, { stiffness: 200, damping: 22 })

  const glareOpacity = useMotionValue(0)
  const springGlareOpacity = useSpring(glareOpacity, { stiffness: 160, damping: 24 })

  const glareBackground = useMotionTemplate`radial-gradient(circle at ${springGlareX}% ${springGlareY}%, rgba(255,255,255,0.55), rgba(125,211,252,0.18) 35%, transparent 65%)`

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    glareOpacity.set(1)
    setHovered(true)

    if (reducedMotion || !ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5

    rotateX.set(-y * maxTilt)
    rotateY.set(x * maxTilt)
    glareX.set(((event.clientX - rect.left) / rect.width) * 100)
    glareY.set(((event.clientY - rect.top) / rect.height) * 100)
  }

  const handleReset = () => {
    rotateX.set(0)
    rotateY.set(0)
    glareX.set(50)
    glareY.set(50)
  }

  const handleMouseEnter = () => {
    setHovered(true)
    glareOpacity.set(1)
  }

  const handleMouseLeave = () => {
    setHovered(false)
    glareOpacity.set(0)
    handleReset()
  }

  const shadow = hovered
    ? "0 24px 48px -12px rgba(24, 24, 27, 0.25)"
    : "0 6px 16px -12px rgba(24, 24, 27, 0.10)"

  return (
    <div
      ref={ref}
      {...divProps}
      data-testid="tilt-card"
      style={{ perspective: 800, boxShadow: shadow }}
      className={cn("relative rounded-2xl", className)}
    >
      <motion.div
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: reducedMotion ? 0 : springRotateX,
          rotateY: reducedMotion ? 0 : springRotateY,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className="relative h-[170px] w-[260px] rounded-2xl border border-zinc-200 bg-white"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl"
        >
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              backgroundImage: reducedMotion ? undefined : glareBackground,
              opacity: springGlareOpacity,
            }}
          />
        </div>

        <div className="relative flex h-full flex-col justify-between p-4">
          <div className="flex items-center gap-3" style={{ transform: "translateZ(40px)" }}>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-sky-400" />
            <div>
              <p className="text-sm font-semibold text-zinc-900">{title}</p>
              <p className="text-xs text-zinc-500">{subtitle}</p>
            </div>
          </div>

          {children ? (
            <div style={{ transform: "translateZ(24px)" }}>{children}</div>
          ) : (
            <div className="flex gap-2" style={{ transform: "translateZ(24px)" }}>
              <div className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-600">
                3 tasks
              </div>
              <div className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-600">
                2h left
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
