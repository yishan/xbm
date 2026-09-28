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

interface ToastStackProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
  className?: string
}

const TOAST_WIDTH = 300
const COLLAPSED_HEIGHT = 76
const EXPANDED_ITEM_HEIGHT = 84

export function ToastStack({ toasts, onDismiss, className }: ToastStackProps) {
  const [hovered, setHovered] = useState(false)
  const reducedMotion = useReducedMotionConfig()

  const visibleToasts = toasts.slice(-3).reverse()

  useEffect(() => {
    if (hovered) return

    const timers = toasts.map((toast) =>
      window.setTimeout(() => onDismiss(toast.id), 5000)
    )

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [toasts, hovered, onDismiss])

  const stackHeight =
    visibleToasts.length === 0
      ? 0
      : hovered
        ? visibleToasts.length * EXPANDED_ITEM_HEIGHT
        : COLLAPSED_HEIGHT

  return (
    <div
      className={cn("relative mx-auto w-[320px]", className)}
      style={{ height: stackHeight }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence>
        {visibleToasts.map((toast, depth) => {
          const y = hovered ? -depth * EXPANDED_ITEM_HEIGHT : -depth * 10
          const scale = hovered ? 1 : 1 - depth * 0.05
          const opacity = hovered ? 1 : Math.max(0.25, 1 - depth * 0.25)

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
              style={{ width: TOAST_WIDTH }}
            >
              <div className="flex items-start gap-3 p-3">
                <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
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
                          className={cn("h-4 w-4 text-sky-500", !reducedMotion && "animate-spin")}
                        />
                      ) : toast.status === "success" ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : toast.status === "error" ? (
                        <X className="h-4 w-4 text-rose-500" />
                      ) : (
                        <Info className="h-4 w-4 text-zinc-500" />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-zinc-900">{toast.title}</p>
                    <button
                      type="button"
                      aria-label="Dismiss toast"
                      onClick={() => onDismiss(toast.id)}
                      className="rounded p-0.5 text-zinc-400 transition-colors hover:text-zinc-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {toast.description ? (
                    <p className="mt-0.5 text-xs text-zinc-500">{toast.description}</p>
                  ) : null}
                  {toast.action ? (
                    <button
                      type="button"
                      onClick={toast.action.onClick}
                      className="mt-2 rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-700 transition-colors hover:bg-zinc-200"
                    >
                      {toast.action.label}
                    </button>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export function useToastStack() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const push = useCallback(
    (toast: Omit<ToastItem, "id"> & { id?: string }) => {
      const id = toast.id ?? `toast-${++idRef.current}`
      setToasts((prev) => [...prev, { ...toast, id }])
      return id
    },
    []
  )

  const update = useCallback((id: string, patch: Partial<Omit<ToastItem, "id">>) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, push, update, dismiss }
}
