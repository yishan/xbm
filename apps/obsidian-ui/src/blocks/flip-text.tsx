import { useCallback, useEffect, useRef, useState } from "react"
import { motion, useAnimationControls, useReducedMotionConfig } from "motion/react"
import { cn } from "@/lib/utils"

interface FlipCharProps {
  char: string
  axis: "x" | "y"
  duration: number
  reducedMotion: boolean
  allTrigger: number
  singleTrigger: number
  delay: number
  onHover: () => void
}

function FlipChar({
  char,
  axis,
  duration,
  reducedMotion,
  allTrigger,
  singleTrigger,
  delay,
  onHover,
}: FlipCharProps) {
  const controls = useAnimationControls()

  useEffect(() => {
    if (reducedMotion) {
      controls.start({
        opacity: [1, 0.4, 1],
        transition: {
          duration: duration * 0.25,
          ease: "easeInOut",
          delay: 0,
        },
      })
    } else {
      const rotate = axis === "x"
        ? { rotateX: [0, 180, 360] }
        : { rotateY: [0, 180, 360] }

      controls.start({
        ...rotate,
        y: [0, -6, 0],
        transition: {
          duration,
          ease: [0.22, 1, 0.36, 1],
          times: [0, 0.5, 1],
          delay,
        },
      })
    }
  }, [allTrigger, singleTrigger, controls, reducedMotion, axis, duration, delay])

  return (
    <motion.span
      className="inline-block"
      initial={{ rotateX: 0, rotateY: 0, y: 0, opacity: 1 }}
      animate={controls}
      onMouseEnter={onHover}
      aria-hidden="true"
    >
      {char}
    </motion.span>
  )
}

export interface FlipTextProps {
  children?: string
  className?: string
  axis?: "x" | "y"
  stagger?: number
  duration?: number
  /** Imperative trigger: when this number changes, the full flip runs. */
  trigger?: number
  dataTestId?: string
}

export function FlipText({
  children = "ObsidianUI",
  className,
  axis = "x",
  stagger = 0.035,
  duration = 0.6,
  trigger,
  dataTestId,
}: FlipTextProps) {
  const reducedMotion = useReducedMotionConfig() ?? false
  const [allFlipCount, setAllFlipCount] = useState(0)
  const [singleFlipCount, setSingleFlipCount] = useState<Record<number, number>>({})
  const [lastFlipMode, setLastFlipMode] = useState<"all" | "single">("all")
  const didMount = useRef(false)

  const text = children
  const chars = Array.from(text)

  const handleWholeFlip = useCallback(() => {
    setLastFlipMode("all")
    setAllFlipCount((count) => count + 1)
  }, [])

  const handleSingleFlip = useCallback((index: number) => {
    setLastFlipMode("single")
    setSingleFlipCount((prev) => ({
      ...prev,
      [index]: (prev[index] ?? 0) + 1,
    }))
  }, [])

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }

    if (trigger !== undefined) {
      handleWholeFlip()
    }
  }, [trigger, handleWholeFlip])

  return (
    <span
      className={cn(
        "inline-block cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
        className,
      )}
      style={{ perspective: "600px" }}
      tabIndex={0}
      role="button"
      aria-label={text}
      data-testid={dataTestId}
      onMouseEnter={(event) => {
        if (event.target === event.currentTarget) {
          handleWholeFlip()
        }
      }}
      onFocus={() => handleWholeFlip()}
      onClick={() => handleWholeFlip()}
    >
      {chars.map((char, index) => {
        const isSpace = char === " "
        const charDelay = lastFlipMode === "all" ? index * stagger : 0

        if (isSpace) {
          return (
            <span
              key={`space-${index}`}
              className="inline-block w-[0.35em]"
              aria-hidden="true"
            >
              {"\u00A0"}
            </span>
          )
        }

        return (
          <FlipChar
            key={`char-${index}`}
            char={char}
            axis={axis}
            duration={duration}
            reducedMotion={reducedMotion}
            allTrigger={allFlipCount}
            singleTrigger={singleFlipCount[index] ?? 0}
            delay={charDelay}
            onHover={() => handleSingleFlip(index)}
          />
        )
      })}
    </span>
  )
}
