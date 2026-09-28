import { useCallback, useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotionConfig,
  useTransform,
} from "motion/react"
import { Check, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Press-and-hold destructive button with a progress ring and background fill.
// Inspired by Spectrum UI (ui.spectrumhq.in). Re-implemented from scratch.

interface HoldToConfirmProps {
  onConfirm?: () => void
  className?: string
}

const RADIUS = 14
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function HoldToConfirm({ onConfirm, className }: HoldToConfirmProps) {
  const [completed, setCompleted] = useState(false)
  const reducedMotion = useReducedMotionConfig()
  const progress = useMotionValue(0)
  const dashOffset = useTransform(progress, (v) => CIRCUMFERENCE * (1 - v))

  const holdAnimation = useRef<ReturnType<typeof animate> | null>(null)
  const resetTimer = useRef<number | null>(null)
  const holdingRef = useRef(false)

  const stopHold = useCallback(() => {
    holdingRef.current = false
    holdAnimation.current?.stop()
    holdAnimation.current = null

    if (reducedMotion) {
      progress.set(0)
    } else {
      animate(progress, 0, { type: "spring", stiffness: 300, damping: 30 })
    }
  }, [progress, reducedMotion])

  const startHold = useCallback(() => {
    if (completed || holdingRef.current) return
    holdingRef.current = true

    holdAnimation.current?.stop()
    holdAnimation.current = animate(progress, 1, {
      duration: 1.5,
      ease: "linear",
      onComplete: () => {
        holdingRef.current = false
        setCompleted(true)
        onConfirm?.()

        resetTimer.current = window.setTimeout(() => {
          setCompleted(false)
          progress.set(0)
          resetTimer.current = null
        }, 2000)
      },
    })
  }, [completed, onConfirm, progress])

  useEffect(() => {
    return () => {
      holdAnimation.current?.stop()
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current)
      }
    }
  }, [])

  const handlePointerDown = () => startHold()
  const handlePointerUp = () => stopHold()
  const handlePointerLeave = () => {
    if (holdingRef.current) stopHold()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
      if (!e.repeat) {
        e.preventDefault()
        startHold()
      }
    }
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      if (holdingRef.current) stopHold()
    }
  }

  return (
    <button
      type="button"
      data-testid="hold-confirm"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      className={cn(
        "relative flex items-center gap-2 overflow-hidden rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 shadow-sm transition-colors",
        className
      )}
    >
      <motion.div
        className="absolute inset-0 origin-left bg-rose-50"
        style={{ scaleX: progress }}
      />

      <span className="relative z-10 flex items-center gap-2">
        <span className="relative flex h-8 w-8 items-center justify-center">
          <svg
            className="absolute inset-0"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="16"
              cy="16"
              r={RADIUS}
              className="stroke-rose-200"
              strokeWidth="2.5"
              fill="none"
            />
            <motion.circle
              cx="16"
              cy="16"
              r={RADIUS}
              className="stroke-rose-500"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              style={{ strokeDashoffset: dashOffset }}
            />
          </svg>

          <AnimatePresence mode="wait" initial={false}>
            {completed ? (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="relative z-10"
              >
                <Check className="h-4 w-4 text-emerald-500" />
              </motion.span>
            ) : (
              <motion.span
                key="trash"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="relative z-10"
              >
                <Trash2 className="h-4 w-4 text-rose-500" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>

        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={completed ? "deleted" : "hold"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {completed ? "Deleted" : "Hold to delete agent"}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  )
}
