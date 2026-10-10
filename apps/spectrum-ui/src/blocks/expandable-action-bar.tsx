// Compact toolbar with expanding actions and a shared highlight pill.
// Inspired by Spectrum UI (ui.spectrumhq.in). Re-implemented from scratch.

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotionConfig } from "motion/react"
import { Check, Languages, Share2, Sparkles, Wand2, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type ActionItem = {
  id: string
  label: string
  icon: LucideIcon
}

export type ExpandableActionBarProps = {
  actions?: ActionItem[]
  className?: string
  onActionClick?: (id: string, label: string) => void
}

const DEFAULT_ACTIONS: ActionItem[] = [
  { id: "summarize", label: "Summarize", icon: Sparkles },
  { id: "translate", label: "Translate", icon: Languages },
  { id: "rewrite", label: "Rewrite", icon: Wand2 },
  { id: "share", label: "Share", icon: Share2 },
]

export function ExpandableActionBar({
  actions = DEFAULT_ACTIONS,
  className,
  onActionClick,
}: ExpandableActionBarProps) {
  const [active, setActive] = useState<string | null>(null)
  const [clicked, setClicked] = useState<string | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const reducedMotion = useReducedMotionConfig()

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleActionClick = (item: ActionItem) => {
    setClicked(item.id)
    onActionClick?.(item.id, item.label)

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = window.setTimeout(() => setClicked(null), 1000)
  }

  return (
    <div
      data-testid="action-bar"
      onMouseLeave={() => setActive(null)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setActive(null)
        }
      }}
      className={cn(
        "flex w-fit items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 shadow-sm",
        className
      )}
    >
      {actions.map((item) => {
        const Icon = item.icon
        const isActive = active === item.id
        const isClicked = clicked === item.id

        return (
          <motion.button
            key={item.id}
            type="button"
            layout
            onMouseEnter={() => setActive(item.id)}
            onFocus={() => setActive(item.id)}
            onClick={() => handleActionClick(item)}
            className={cn(
              "relative flex h-9 items-center rounded-full px-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700",
              isActive ? "text-zinc-900 dark:text-zinc-100" : "hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            {isActive && (
              <motion.span
                layoutId={reducedMotion ? undefined : "action-bar-highlight"}
                className="absolute inset-0 rounded-full bg-zinc-100 dark:bg-zinc-800"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                aria-hidden
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {isClicked ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.span
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -6 }}
                    animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -6 }}
                    transition={{ duration: reducedMotion ? 0.1 : 0.2, ease: "easeOut" }}
                    className="inline-block whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
