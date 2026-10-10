import { useEffect, useState } from "react"
import { motion, useReducedMotionConfig } from "motion/react"
import { Brain, BookOpen, CheckCircle2, Globe, PenLine, type LucideIcon } from "lucide-react"
import { TextStates } from "@/blocks/text-states"

type StatusItem = {
  label: string
  Icon: LucideIcon
  color: string
}

const STATUSES: StatusItem[] = [
  { label: "Thinking…", Icon: Brain, color: "#0ea5e9" },
  { label: "Searching the web…", Icon: Globe, color: "#0ea5e9" },
  { label: "Reading 12 sources…", Icon: BookOpen, color: "#f59e0b" },
  { label: "Writing answer…", Icon: PenLine, color: "#8b5cf6" },
  { label: "Done", Icon: CheckCircle2, color: "#10b981" },
]

export function TextStatesDemo() {
  const reducedMotion = useReducedMotionConfig()
  const [index, setIndex] = useState(0)
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (!auto) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % STATUSES.length)
    }, 1600)
    return () => window.clearInterval(id)
  }, [auto])

  const status = STATUSES[index]
  const Icon = status.Icon

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        data-testid="text-states"
        className="flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 shadow-sm"
      >
        <motion.span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: status.color }}
          initial={false}
          animate={{ backgroundColor: status.color }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
        />
        <TextStates
          text={status.label}
          icon={<Icon className="h-4 w-4" aria-hidden />}
          className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-1">
        <button
          type="button"
          onClick={() => setAuto(true)}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            auto ? "bg-zinc-900 dark:bg-zinc-700 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          }`}
        >
          Auto
        </button>
        {STATUSES.map((state, idx) => (
          <button
            key={state.label}
            type="button"
            onClick={() => {
              setIndex(idx)
              setAuto(false)
            }}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              !auto && idx === index
                ? "bg-zinc-900 dark:bg-zinc-700 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            {state.label}
          </button>
        ))}
      </div>
    </div>
  )
}
