// Bell button that swings on new notifications, with a rolling unread-count badge.
// Inspired by Spectrum UI (ui.spectrumhq.in). Re-implemented from scratch.

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotionConfig } from "motion/react"
import { Bell } from "lucide-react"

type NotificationBellProps = {
  count: number
  onClick?: () => void
  className?: string
}

export function NotificationBell({ count, onClick, className }: NotificationBellProps) {
  const reducedMotion = useReducedMotionConfig()
  const [swing, setSwing] = useState(false)
  const prevCountRef = useRef(count)

  useEffect(() => {
    if (count > prevCountRef.current && !reducedMotion) {
      setSwing(true)
      const timer = window.setTimeout(() => setSwing(false), 700)
      return () => window.clearTimeout(timer)
    }
    prevCountRef.current = count
  }, [count, reducedMotion])

  const display = count > 9 ? "9+" : count > 0 ? String(count) : null

  return (
    <motion.button
      type="button"
      onClick={onClick}
      data-testid="notification-bell"
      aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
      animate={swing ? { rotate: [0, -18, 14, -10, 6, 0] } : { rotate: 0 }}
      transition={swing ? { duration: 0.7, ease: "easeInOut" } : { duration: 0.2 }}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-950 ${className ?? ""}`}
    >
      <Bell className="h-5 w-5" />

      <AnimatePresence initial={false}>
        {display !== null && (
          <motion.span
            key="badge"
            initial={reducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            transition={reducedMotion ? { duration: 0.15 } : { type: "spring", stiffness: 500, damping: 30 }}
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {display.split("").map((char, index) => (
                <motion.span
                  key={`${index}-${char}`}
                  initial={reducedMotion ? { opacity: 0 } : { y: "100%", opacity: 0 }}
                  animate={reducedMotion ? { opacity: 1 } : { y: "0%", opacity: 1 }}
                  exit={reducedMotion ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
                  transition={reducedMotion ? { duration: 0.15 } : { duration: 0.2, ease: "easeOut" }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </AnimatePresence>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
