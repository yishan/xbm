import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotionConfig } from "motion/react"
import { Check, Info, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Toast stack with hover-expand, swipe dismiss, auto-dismiss, and status morphing.
// Inspired by Spectrum UI (ui.spectrumhq.in). Re-implemented from scratch.

export type ToastStatus = "loading" | "success" | "error" | "info"

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastItem {
  id: string
  status: ToastStatus
  title: string
  description?: string
  action?: ToastAction
}

type ToastInput = Omit<ToastItem, "id"> & { id?: string }

interface ToastStackProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
  className?: string
}

const TOAST_WIDTH = 300
const TOAST_HEIGHT = 52
const TOAST_GAP = 8
const COLLAPSED_STAGGER = 8
const COLLAPSED_SCALE_STEP = 0.05
const COLLAPSED_OPACITIES = [1, 0.7, 0.45]

export function ToastStack({ toasts, onDismiss, className }: ToastStackProps) {
  const [hovered, setHovered] = useState(false)
  const reducedMotion = useReducedMotionConfig()

  const onDismissRef = useRef(onDismiss)
  useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  const timersRef = useRef(new Map<string, number>())
  const statusRef = useRef(new Map<string, ToastStatus>())

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
      timers.clear()
    }
  }, [])

  const visibleToasts = toasts.slice(-3).reverse()

  useEffect(() => {
    if (hovered) {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      timersRef.current.clear()
      return
    }

    const timers = timersRef.current
    const statuses = statusRef.current
    const currentIds = new Set(visibleToasts.map((toast) => toast.id))

    for (const id of Array.from(timers.keys())) {
      if (!currentIds.has(id)) {
        const timer = timers.get(id)
        if (timer !== undefined) window.clearTimeout(timer)
        timers.delete(id)
        statuses.delete(id)
      }
    }

    for (const toast of visibleToasts) {
      if (toast.status === "loading") {
        const timer = timers.get(toast.id)
        if (timer !== undefined) {
          window.clearTimeout(timer)
          timers.delete(toast.id)
        }
        statuses.delete(toast.id)
        continue
      }

      const existing = timers.get(toast.id)
      const previousStatus = statuses.get(toast.id)

      if (existing === undefined || previousStatus !== toast.status) {
        if (existing !== undefined) window.clearTimeout(existing)
        const timer = window.setTimeout(() => onDismissRef.current(toast.id), 5000)
        timers.set(toast.id, timer)
        statuses.set(toast.id, toast.status)
      }
    }
  }, [visibleToasts, hovered])

  const stackHeight =
    visibleToasts.length === 0
      ? 0
      : hovered
        ? visibleToasts.length * TOAST_HEIGHT + (visibleToasts.length - 1) * TOAST_GAP
        : TOAST_HEIGHT

  return (
    <div
      className={cn("w-[320px]", className)}
      style={{ height: stackHeight }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence>
        {visibleToasts.map((toast, depth) => {
          const isCollapsed = !hovered
          const collapsedY = -depth * COLLAPSED_STAGGER
          const collapsedScale = 1 - depth * COLLAPSED_SCALE_STEP
          const collapsedOpacity = COLLAPSED_OPACITIES[depth] ?? 0.45
          const expandedY = -depth * (TOAST_HEIGHT + TOAST_GAP)

          const y = hovered ? expandedY : collapsedY
          const scale = hovered ? 1 : collapsedScale
          const opacity = hovered ? 1 : collapsedOpacity
          const zIndex = visibleToasts.length - depth

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity, y, scale }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 320, damping: 30 }
              }
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x > 80 || info.velocity.x > 500) {
                  onDismiss(toast.id)
                }
              }}
              className="absolute bottom-0 left-0 right-0 mx-auto overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
              style={{ width: TOAST_WIDTH, height: TOAST_HEIGHT, zIndex }}
            >
              <div
                className="flex h-full items-center gap-2 p-2"
                style={{ opacity: isCollapsed && depth > 0 ? 0 : 1 }}
              >
                <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={toast.status}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.15 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {toast.status === "loading" ? (
                        <Loader2
                          className={cn(
                            "h-3.5 w-3.5 text-sky-500",
                            !reducedMotion && "animate-spin"
                          )}
                        />
                      ) : toast.status === "success" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : toast.status === "error" ? (
                        <X className="h-3.5 w-3.5 text-rose-500" />
                      ) : (
                        <Info className="h-3.5 w-3.5 text-zinc-500" />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <p className="max-w-[65%] shrink-0 truncate text-xs font-semibold text-zinc-900">
                      {toast.title}
                    </p>
                    {toast.description ? (
                      <p className="min-w-0 truncate text-xs text-zinc-500">{toast.description}</p>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {toast.action ? (
                    <button
                      type="button"
                      onClick={toast.action.onClick}
                      className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 transition-colors hover:bg-zinc-200"
                    >
                      {toast.action.label}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    aria-label="Dismiss toast"
                    onClick={() => onDismiss(toast.id)}
                    className="rounded p-0.5 text-zinc-400 transition-colors hover:text-zinc-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

let toastId = 0

export function useToastStack(initial?: ToastInput[]) {

  const [toasts, setToasts] = useState<ToastItem[]>(() => {
    if (!initial) return []
    return initial.map((toast) => ({
      ...toast,
      id: toast.id ?? `toast-${++toastId}`,
    }))
  })

  const push = useCallback((toast: ToastInput) => {
    const id = toast.id ?? `toast-${++toastId}`
    setToasts((prev) => [...prev, { ...toast, id }])
    return id
  }, [])

  const update = useCallback((id: string, patch: Partial<Omit<ToastItem, "id">>) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, push, update, dismiss }
}
