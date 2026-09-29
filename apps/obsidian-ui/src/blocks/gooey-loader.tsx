// Gooey Loader — 4 blobs that orbit, stretch and merge like liquid through an SVG goo filter.
// Inspired by ObsidianUI (obsidianui.dev, MIT). Re-implemented from scratch.

import { useId, useMemo } from "react"
import { motion, useReducedMotionConfig } from "motion/react"
import { cn } from "@/lib/utils"

const DEFAULT_COLORS = ["#8b5cf6", "#d946ef", "#0ea5e9", "#f59e0b"]

export interface GooeyLoaderProps {
  size?: number
  className?: string
  colors?: string[]
  speed?: number
  label?: string
}

export function GooeyLoader({
  size = 120,
  className,
  colors = DEFAULT_COLORS,
  speed = 1,
  label = "Loading",
}: GooeyLoaderProps) {
  const rawId = useId()
  const filterId = `gooey-${rawId.replace(/:/g, "")}`
  const shouldReduceMotion = useReducedMotionConfig() ?? false

  const palette = colors.length >= 4 ? colors : DEFAULT_COLORS
  const blobSize = Math.max(18, size * 0.3)
  const outerRadius = size * 0.3
  const mergedRadius = size * 0.07

  const satelliteMotion = useMemo(() => {
    const points = 12
    const configs = [
      { offset: 0, outerScale: 0.85, duration: 2.4 / speed },
      { offset: (2 * Math.PI) / 3, outerScale: 1, duration: 2.8 / speed },
      { offset: (4 * Math.PI) / 3, outerScale: 0.7, duration: 3.2 / speed },
    ]
    return configs.map((cfg) => {
      const x: number[] = []
      const y: number[] = []
      const outer = outerRadius * cfg.outerScale
      for (let i = 0; i < points; i++) {
        const progress = i / (points - 1)
        const angle = cfg.offset + progress * 2 * Math.PI
        const r =
          mergedRadius + (outer - mergedRadius) * (0.5 + 0.5 * Math.cos(progress * 2 * Math.PI))
        x.push(r * Math.cos(angle))
        y.push(r * Math.sin(angle))
      }
      return { x, y, duration: cfg.duration }
    })
  }, [outerRadius, mergedRadius, speed])

  const mergedOffsets = useMemo(() => {
    const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]
    return angles.map((angle) => ({
      x: mergedRadius * Math.cos(angle),
      y: mergedRadius * Math.sin(angle),
    }))
  }, [mergedRadius])

  return (
    <div
      role="status"
      aria-label={label}
      className={cn("relative overflow-hidden", className)}
      style={{ width: size, height: size, filter: `url(#${filterId})` }}
    >
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>

      <motion.div
        className="absolute rounded-full"
        style={{
          left: "50%",
          top: "50%",
          marginLeft: -blobSize / 2,
          marginTop: -blobSize / 2,
          width: blobSize,
          height: blobSize,
          background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`,
        }}
        animate={shouldReduceMotion ? { scale: 1 } : { scale: [1, 1.25, 1] }}
        transition={
          shouldReduceMotion
            ? undefined
            : { duration: 2.4 / speed, ease: "easeInOut", repeat: Infinity }
        }
      />

      {satelliteMotion.map((sat, index) => {
        const colorA = palette[(index + 1) % palette.length]
        const colorB = palette[(index + 2) % palette.length]
        return (
          <motion.div
            key={index}
            className="absolute rounded-full"
            style={{
              left: "50%",
              top: "50%",
              marginLeft: -blobSize / 2,
              marginTop: -blobSize / 2,
              width: blobSize,
              height: blobSize,
              background: `linear-gradient(135deg, ${colorA}, ${colorB})`,
            }}
            animate={
              shouldReduceMotion
                ? { x: mergedOffsets[index].x, y: mergedOffsets[index].y }
                : { x: sat.x, y: sat.y }
            }
            transition={
              shouldReduceMotion
                ? undefined
                : { duration: sat.duration, ease: "easeInOut", repeat: Infinity }
            }
          />
        )
      })}
    </div>
  )
}
