// Animated text state with enter/exit transitions + AgentStatus preset.
// Inspired by Spectrum UI (ui.spectrumhq.in). Re-implemented from scratch.

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotionConfig } from "motion/react"
import { Brain, BookOpen, CheckCircle2, Globe, PenLine, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type TextStatesProps = {
  text: string
  className?: string
  icon?: ReactNode
  iconClassName?: string
}

export function TextStates({ text, className, icon, iconClassName }: TextStatesProps) {
  const reducedMotion = useReducedMotionConfig()

  const enterInitial = reducedMotion ? { opacity: 0 } : { y: 8, filter: "blur(4px)", opacity: 0 }
  const enterAnimate = reducedMotion ? { opacity: 1 } : { y: 0, filter: "blur(0px)", opacity: 1 }
  const exitState = reducedMotion ? { opacity: 0 } : { y: -8, filter: "blur(4px)", opacity: 0 }

  return (
    <motion.span layout className={cn("relative inline-flex items-center gap-2", className)}>
      {icon ? <span className={cn("relative z-10 shrink-0", iconClassName)}>{icon}</span> : null}
      <span className="relative">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            initial={enterInitial}
            animate={enterAnimate}
            exit={exitState}
            transition={{ duration: reducedMotion ? 0.15 : 0.25, ease: "easeOut" }}
            className="inline-block whitespace-nowrap"
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.span>
  )
}

type StatusItem = {
  label: string
  Icon: LucideIcon
}

const STATUSES: StatusItem[] = [
  { label: "Thinking…", Icon: Brain },
  { label: "Searching the web…", Icon: Globe },
  { label: "Reading 12 sources…", Icon: BookOpen },
  { label: "Writing answer…", Icon: PenLine },
  { label: "Done", Icon: CheckCircle2 },
]

export type AgentStatusProps = {
  auto?: boolean
  className?: string
}

export function AgentStatus({ auto = true, className }: AgentStatusProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!auto) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % STATUSES.length), 1600)
    return () => window.clearInterval(id)
  }, [auto])

  const status = STATUSES[index]
  const Icon = status.Icon

  return (
    <div className={cn("flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 shadow-sm", className)}>
      <TextStates
        text={status.label}
        icon={<Icon className="h-4 w-4" aria-hidden />}
        className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
      />
    </div>
  )
}
