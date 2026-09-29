// Hover Image — a row list that reveals a gradient thumbnail following the pointer.
// Inspired by ObsidianUI (obsidianui.dev, MIT). Re-implemented from scratch.

import { useCallback, useEffect, useRef, useState } from "react"
import type { FocusEvent as ReactFocusEvent, PointerEvent as ReactPointerEvent } from "react"
import gsap from "gsap"
import { cn } from "@/lib/utils"

export interface HoverProject {
  title: string
  label: string
  from: string
  to: string
}

export interface HoverImageProps {
  projects?: HoverProject[]
  className?: string
  reducedMotion?: boolean
}

const DEFAULT_PROJECTS: HoverProject[] = [
  { title: "Obsidian", label: "Brand system", from: "#7c3aed", to: "#d946ef" },
  { title: "Aurora", label: "Motion study", from: "#0d9488", to: "#38bdf8" },
  { title: "Monolith", label: "Architecture", from: "#71717a", to: "#d6d3d1" },
  { title: "Solstice", label: "Editorial", from: "#f59e0b", to: "#f43f5e" },
]

export function HoverImage({
  projects = DEFAULT_PROJECTS,
  className,
  reducedMotion = false,
}: HoverImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])

  const quickToX = useRef<((value: number) => void) | null>(null)
  const quickToY = useRef<((value: number) => void) | null>(null)
  const rotateTween = useRef<ReturnType<typeof gsap.to> | null>(null)
  const lastX = useRef<number | null>(null)
  const lastTime = useRef<number | null>(null)

  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1)

  const setThumbFromRow = useCallback(
    (index: number) => {
      const container = containerRef.current
      const thumb = thumbRef.current
      const row = rowRefs.current[index]

      if (!container || !thumb || !row) return

      const containerRect = container.getBoundingClientRect()
      const rowRect = row.getBoundingClientRect()
      const thumbW = thumb.offsetWidth || 132

      const x = rowRect.right - containerRect.left - thumbW / 2
      const y = rowRect.top + rowRect.height / 2 - containerRect.top

      if (reducedMotion) {
        gsap.set(thumb, { x, y, scale: 1 })
      } else {
        gsap.set(thumb, { x, y })
      }
    },
    [reducedMotion],
  )

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (reducedMotion || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (quickToX.current && quickToY.current) {
        quickToX.current(x)
        quickToY.current(y)
      }

      const now = performance.now()
      const prevX = lastX.current
      const prevTime = lastTime.current
      lastX.current = x
      lastTime.current = now

      if (prevX !== null && prevTime !== null && now - prevTime > 0) {
        const velocity = (x - prevX) / (now - prevTime)
        const targetRotation = Math.max(-6, Math.min(6, velocity * 8))

        if (thumbRef.current) {
          if (rotateTween.current) rotateTween.current.kill()
          rotateTween.current = gsap.to(thumbRef.current, {
            rotation: targetRotation,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          })
        }
      }
    },
    [reducedMotion],
  )

  const handleRowEnter = useCallback(
    (index: number, e: ReactPointerEvent<HTMLDivElement>) => {
      setActiveIndex(index)
      setHoveredIndex(index)

      if (thumbRef.current) {
        gsap.to(thumbRef.current, {
          scale: 1,
          duration: reducedMotion ? 0 : 0.35,
          ease: "power2.out",
          overwrite: "auto",
        })
      }

      if (reducedMotion) {
        setThumbFromRow(index)
      } else if (containerRef.current && thumbRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        if (quickToX.current && quickToY.current) {
          quickToX.current(x)
          quickToY.current(y)
        }
      }
    },
    [reducedMotion, setThumbFromRow],
  )

  const handleRowFocus = useCallback(
    (index: number) => {
      setActiveIndex(index)
      setHoveredIndex(-1)

      if (thumbRef.current) {
        gsap.to(thumbRef.current, {
          scale: 1,
          duration: reducedMotion ? 0 : 0.35,
          ease: "power2.out",
          overwrite: "auto",
        })
      }

      setThumbFromRow(index)
    },
    [reducedMotion, setThumbFromRow],
  )

  const handleContainerLeave = useCallback(() => {
    setActiveIndex(-1)
    setHoveredIndex(-1)

    if (thumbRef.current) {
      gsap.to(thumbRef.current, {
        scale: 0,
        duration: reducedMotion ? 0 : 0.35,
        ease: "power2.out",
        overwrite: "auto",
      })
    }

    if (rotateTween.current) rotateTween.current.kill()
    lastX.current = null
    lastTime.current = null
  }, [reducedMotion])

  const handleContainerBlur = useCallback(
    (e: ReactFocusEvent<HTMLDivElement>) => {
      if (!containerRef.current) return

      if (!containerRef.current.contains(e.relatedTarget as Node)) {
        setActiveIndex(-1)
        setHoveredIndex(-1)

        if (thumbRef.current) {
          gsap.to(thumbRef.current, {
            scale: 0,
            duration: reducedMotion ? 0 : 0.35,
            ease: "power2.out",
            overwrite: "auto",
          })
        }
      }
    },
    [reducedMotion],
  )

  useEffect(() => {
    if (!containerRef.current || !thumbRef.current || !stripRef.current) return

    const ctx = gsap.context(() => {
      if (thumbRef.current) {
        gsap.set(thumbRef.current, { xPercent: -50, yPercent: -50, scale: 0 })

        if (!reducedMotion) {
          quickToX.current = gsap.quickTo(thumbRef.current, "x", {
            duration: 0.5,
            ease: "power3",
          })
          quickToY.current = gsap.quickTo(thumbRef.current, "y", {
            duration: 0.5,
            ease: "power3",
          })
        } else {
          quickToX.current = null
          quickToY.current = null
        }
      }
    }, containerRef)

    return () => {
      ctx.revert()
      quickToX.current = null
      quickToY.current = null
    }
  }, [reducedMotion])

  useEffect(() => {
    if (!stripRef.current || activeIndex < 0) return

    const y = -activeIndex * 92

    gsap.to(stripRef.current, {
      y,
      duration: reducedMotion ? 0 : 0.45,
      ease: "power3.out",
      overwrite: "auto",
    })
  }, [activeIndex, reducedMotion, projects.length])

  const rowClassName = (index: number) => {
    const isHovered = index === hoveredIndex
    const isActive = index === activeIndex
    const shouldDim = hoveredIndex !== -1 && !isHovered && !isActive

    return cn(
      "group flex items-center justify-between border-b border-white/10 py-2",
      "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
      isHovered ? "text-white" : "",
      shouldDim ? "text-zinc-600" : "text-zinc-200",
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handleContainerLeave}
      onBlur={handleContainerBlur}
      data-testid="hover-image"
    >
      <div className="w-full">
        {projects.map((project, index) => (
          <div
            key={project.title}
            ref={(el) => {
              rowRefs.current[index] = el
            }}
            className={rowClassName(index)}
            tabIndex={0}
            role="button"
            aria-label={`${project.title} — ${project.label}`}
            onPointerEnter={(e) => handleRowEnter(index, e)}
            onFocus={() => handleRowFocus(index)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleRowFocus(index)
              }
            }}
          >
            <span className="text-lg font-medium">{project.title}</span>
            <span className="text-xs text-zinc-500">{project.label}</span>
          </div>
        ))}
      </div>

      <div
        ref={thumbRef}
        className="pointer-events-none absolute left-0 top-0 z-10 h-[92px] w-[132px] overflow-hidden rounded-xl shadow-lg"
        style={{ willChange: "transform" }}
      >
        <div
          ref={stripRef}
          className="flex flex-col"
          style={{ height: `${projects.length * 92}px` }}
        >
          {projects.map((project) => (
            <div
              key={project.title}
              className="relative flex h-[92px] w-full items-end justify-start p-2 text-left text-[10px] font-medium text-white/90"
              style={{
                background: `linear-gradient(135deg, ${project.from}, ${project.to})`,
              }}
            >
              <span className="absolute bottom-1 left-1.5">{project.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
