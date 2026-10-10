// Inline pill with countdown ring after a destructive action.
// Inspired by Spectrum UI (ui.spectrumhq.in). Re-implemented from scratch.

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotionConfig } from "motion/react"
import { cn } from "@/lib/utils"

export type UndoPillProps = {
  message?: string
  duration?: number
  onUndo?: () => void
  onExpire?: () => void
  className?: string
}

export function UndoPill({
  message = "Email archived",
  duration = 5,
  onUndo,
  onExpire,
  className,
}: UndoPillProps) {
  const reducedMotion = useReducedMotionConfig()
  const [visible, setVisible] = useState(true)
  const [remaining, setRemaining] = useState(duration)
  const [paused, setPaused] = useState(false)

  const durationRef = useRef(duration)
  const totalElapsedRef = useRef(0)
  const lastTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const onUndoRef = useRef(onUndo)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onUndoRef.current = onUndo
  }, [onUndo])

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  const stop = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTimeRef.current = null
    }
  }

  const tick = (now: number) => {
    if (lastTimeRef.current !== null) {
      totalElapsedRef.current += now - lastTimeRef.current
      const left = Math.max(0, durationRef.current - totalElapsedRef.current / 1000)
      setRemaining(left)

      if (left <= 0) {
        setVisible(false)
        onExpireRef.current?.()
        return
      }
    }
    lastTimeRef.current = now
    rafRef.current = requestAnimationFrame(tick)
  }

  const start = () => {
    if (rafRef.current !== null) return
    lastTimeRef.current = performance.now()
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    if (visible && !paused) {
      start()
    } else {
      stop()
    }
    return () => stop()
  }, [visible, paused])

  const handleUndo = () => {
    stop()
    setVisible(false)
    onUndoRef.current?.()
  }

  const circumference = 94.2

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 8, filter: "blur(4px)" }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -8, filter: "blur(4px)" }}
          transition={{ duration: reducedMotion ? 0.15 : 0.25, ease: "easeOut" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          data-testid="undo-pill"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 shadow-sm",
            className
          )}
        >
          <span className="text-sm text-zinc-700 dark:text-zinc-300">{message}</span>
          <button
            type="button"
            onClick={handleUndo}
            className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:hover:text-sky-300"
          >
            Undo
          </button>
          <span className="relative flex h-6 w-6 items-center justify-center">
            <svg viewBox="0 0 36 36" className="h-6 w-6 -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.15}
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(remaining / duration) * circumference} ${circumference}`}
                className="text-sky-600"
              />
            </svg>
            <span className="absolute text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
              {Math.ceil(remaining)}
            </span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
