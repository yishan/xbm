// Split Showcase — interactive partner cards with a dotted divider that reacts to hover/focus.
// Inspired by ObsidianUI (obsidianui.dev, MIT). Re-implemented from scratch.

import { useState } from "react"
import { motion, useReducedMotionConfig } from "motion/react"
import { ArrowUpRight, Activity, Cloud } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type SplitShowcaseItem = {
  id: string
  eyebrow: string
  name: string
  description: string
  cta: string
  accent: string
  icon: LucideIcon
}

export type SplitShowcaseProps = {
  items?: [SplitShowcaseItem, SplitShowcaseItem]
  className?: string
}

const defaultItems: [SplitShowcaseItem, SplitShowcaseItem] = [
  {
    id: "basalt",
    eyebrow: "Hosting partner",
    name: "Basalt Cloud",
    description: "Edge deployments that feel instant, from preview to production.",
    cta: "Visit Basalt",
    accent: "from-violet-500/30 to-fuchsia-500/10",
    icon: Cloud,
  },
  {
    id: "tracer",
    eyebrow: "Analytics partner",
    name: "Tracer",
    description: "Privacy-first product analytics with zero-config dashboards.",
    cta: "Explore Tracer",
    accent: "from-sky-500/30 to-cyan-500/10",
    icon: Activity,
  },
]

function PartnerCard({
  item,
  side,
  activeSide,
  reducedMotion,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  testId,
}: {
  item: SplitShowcaseItem
  side: "left" | "right"
  activeSide: "left" | "right" | null
  reducedMotion: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onFocus: () => void
  onBlur: () => void
  testId: string
}) {
  const Icon = item.icon
  const isActive = activeSide === side
  const isDimmed = activeSide !== null && !isActive

  const x = reducedMotion ? 0 : isActive ? (side === "left" ? -14 : 14) : 0
  const scale = reducedMotion ? 1 : isActive ? 1.02 : isDimmed ? 0.98 : 1
  const borderRadius = isActive ? 40 : 20
  const opacity = isActive ? 1 : isDimmed ? 0.55 : 1

  const transition = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 260, damping: 26 }

  return (
    <motion.a
      href="#"
      onClick={(e) => e.preventDefault()}
      data-testid={testId}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-white/10 bg-zinc-900/80 p-6 text-left",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
      )}
      initial={false}
      animate={{ x, scale, borderRadius, opacity }}
      transition={transition}
    >
      <div
        className={cn(
          "pointer-events-none absolute -inset-1 bg-gradient-to-br blur-2xl",
          item.accent,
        )}
        style={{
          opacity: isActive ? 1 : 0,
          transition: reducedMotion ? "none" : "opacity 0.5s ease",
        }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-100">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          {item.eyebrow}
        </span>
      </div>
      <div className="relative mt-8">
        <h3 className="text-2xl font-semibold tracking-tight text-zinc-100">{item.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.description}</p>
        <div className="mt-5 flex items-center gap-2 text-sm font-medium text-zinc-200">
          <span>{item.cta}</span>
          <motion.span
            initial={false}
            animate={
              reducedMotion
                ? { x: 0, y: 0 }
                : isActive
                  ? { x: 3, y: -3 }
                  : { x: 0, y: 0 }
            }
            transition={transition}
          >
            <ArrowUpRight className="h-4 w-4" />
          </motion.span>
        </div>
      </div>
    </motion.a>
  )
}

function Divider({
  activeSide,
  reducedMotion,
}: {
  activeSide: "left" | "right" | null
  reducedMotion: boolean
}) {
  const dots = Array.from({ length: 14 }, (_, i) => i)

  return (
    <div
      aria-hidden="true"
      className="flex flex-row items-center justify-center gap-2 px-0 py-2 sm:flex-col sm:px-4 sm:py-0"
    >
      {dots.map((i) => {
        const nearLeft = activeSide === "left" && i < 7
        const nearRight = activeSide === "right" && i >= 7
        const brightened = nearLeft || nearRight

        const scale = reducedMotion ? 1 : brightened ? 1.25 : activeSide ? 0.9 : 1
        const opacity = !activeSide ? 0.5 : brightened ? 1 : 0.35
        const delay = reducedMotion
          ? 0
          : brightened
            ? (activeSide === "left" ? (7 - i) * 0.03 : (i - 6) * 0.03)
            : (activeSide === "left" ? i * 0.02 : (13 - i) * 0.02)

        return (
          <motion.span
            key={i}
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              brightened ? "bg-zinc-200" : activeSide ? "bg-zinc-600" : "bg-zinc-700",
            )}
            initial={false}
            animate={{ scale, opacity }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { type: "spring" as const, stiffness: 260, damping: 26, delay }
            }
          />
        )
      })}
    </div>
  )
}

export function SplitShowcase({ items = defaultItems, className }: SplitShowcaseProps) {
  const reducedMotion = useReducedMotionConfig() ?? false
  const [activeSide, setActiveSide] = useState<"left" | "right" | null>(null)
  const [left, right] = items

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:gap-0">
        <PartnerCard
          item={left}
          side="left"
          activeSide={activeSide}
          reducedMotion={reducedMotion}
          onMouseEnter={() => setActiveSide("left")}
          onMouseLeave={() => setActiveSide((current) => (current === "left" ? null : current))}
          onFocus={() => setActiveSide("left")}
          onBlur={() => setActiveSide((current) => (current === "left" ? null : current))}
          testId="split-left"
        />
        <Divider activeSide={activeSide} reducedMotion={reducedMotion} />
        <PartnerCard
          item={right}
          side="right"
          activeSide={activeSide}
          reducedMotion={reducedMotion}
          onMouseEnter={() => setActiveSide("right")}
          onMouseLeave={() => setActiveSide((current) => (current === "right" ? null : current))}
          onFocus={() => setActiveSide("right")}
          onBlur={() => setActiveSide((current) => (current === "right" ? null : current))}
          testId="split-right"
        />
      </div>
    </div>
  )
}
