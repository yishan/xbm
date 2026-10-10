// Async button that morphs between idle, loading, success and error.
// Inspired by Spectrum UI (ui.spectrumhq.in). Re-implemented from scratch.

import { useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotionConfig,
} from "motion/react"
import { AlertCircle, Check, Loader2, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

type Status = "idle" | "loading" | "success" | "error"

export type MorphButtonLabels = {
  idle?: string
  loading?: string
  success?: string
  error?: string
}

export type MorphButtonProps = {
  onClick: () => Promise<unknown>
  labels?: MorphButtonLabels
  className?: string
}

const defaultLabels: Required<MorphButtonLabels> = {
  idle: "Deploy agent",
  loading: "Deploying…",
  success: "Deployed",
  error: "Failed — retry",
}

export function MorphButton({ onClick, labels, className }: MorphButtonProps) {
  const [status, setStatus] = useState<Status>("idle")
  const controls = useAnimationControls()
  const reducedMotion = useReducedMotionConfig()
  const timeoutRef = useRef<number | null>(null)
  const mountedRef = useRef(true)

  const mergedLabels = { ...defaultLabels, ...labels }

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleClick = async () => {
    if (status !== "idle") return

    setStatus("loading")
    try {
      await onClick()
      if (!mountedRef.current) return
      setStatus("success")
    } catch {
      if (!mountedRef.current) return
      setStatus("error")
      if (!reducedMotion) {
        void controls.start({
          x: [0, -6, 6, -4, 4, 0],
          transition: { duration: 0.4 },
        })
      }
    }

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = window.setTimeout(() => {
      if (mountedRef.current) {
        setStatus("idle")
      }
    }, 1800)
  }

  const content = {
    idle: (
      <>
        <Rocket className="h-4 w-4" />
        <span>{mergedLabels.idle}</span>
      </>
    ),
    loading: (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{mergedLabels.loading}</span>
      </>
    ),
    success: (
      <>
        <Check className="h-4 w-4" />
        <span>{mergedLabels.success}</span>
      </>
    ),
    error: (
      <>
        <AlertCircle className="h-4 w-4" />
        <span>{mergedLabels.error}</span>
      </>
    ),
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={status === "loading"}
      animate={controls}
      data-testid="morph-button"
      className={cn(
        "relative inline-flex h-10 min-w-[128px] items-center justify-center gap-2 overflow-hidden rounded-full border px-4 text-sm font-medium shadow-sm transition-colors",
        status === "idle" && "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-950",
        status === "loading" && "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400",
        status === "success" && "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
        status === "error" && "border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
        className
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={status}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6, filter: "blur(4px)" }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ duration: reducedMotion ? 0.15 : 0.2, ease: "easeOut" }}
          className="inline-flex items-center gap-2"
        >
          {content[status]}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
