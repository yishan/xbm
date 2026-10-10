import { useState } from "react"
import { AnimatePresence, motion, useReducedMotionConfig } from "motion/react"
import { SwipeToDelete } from "@/blocks/swipe-to-delete"

type Row = {
  id: number
  title: string
  subtitle: string
  time: string
  gradient: string
}

const initialRows: Row[] = [
  {
    id: 1,
    title: "Market research",
    subtitle: "Agent thread",
    time: "2m",
    gradient: "from-violet-500 to-sky-400",
  },
  {
    id: 2,
    title: "Refactor auth module",
    subtitle: "Agent thread",
    time: "14m",
    gradient: "from-emerald-500 to-lime-400",
  },
  {
    id: 3,
    title: "Plan offsite",
    subtitle: "Agent thread",
    time: "1h",
    gradient: "from-rose-500 to-orange-400",
  },
]

export function SwipeToDeleteDemo() {
  const [rows, setRows] = useState(initialRows)
  const reducedMotion = useReducedMotionConfig()

  const removeRow = (id: number) => {
    setRows((current) => current.filter((row) => row.id !== id))
  }

  const reset = () => {
    setRows(initialRows)
  }

  return (
    <div className="flex h-full flex-col justify-center gap-3 p-4">
      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {rows.map((row) => (
            <motion.div
              key={row.id}
              layout
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={
                reducedMotion
                  ? { duration: 0.2 }
                  : { type: "spring", stiffness: 400, damping: 34 }
              }
            >
              <SwipeToDelete onDelete={() => removeRow(row.id)}>
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`h-9 w-9 shrink-0 rounded-full bg-gradient-to-br ${row.gradient}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{row.title}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{row.subtitle}</p>
                  </div>
                  <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">{row.time}</span>
                </div>
              </SwipeToDelete>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {rows.length < initialRows.length && (
        <button
          type="button"
          onClick={reset}
          className="self-center text-xs font-medium text-zinc-600 dark:text-zinc-400 underline-offset-2 hover:underline"
        >
          Reset
        </button>
      )}
    </div>
  )
}
