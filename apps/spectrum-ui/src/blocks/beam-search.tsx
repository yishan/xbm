import { useState } from "react"
import { motion, useReducedMotionConfig } from "motion/react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

// A search input with a traveling beam along its bottom edge while focused.
// Inspired by Spectrum UI (ui.spectrumhq.in). Re-implemented from scratch.

interface BeamSearchProps {
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function BeamSearch({ value, onChange, className }: BeamSearchProps) {
  const [internalValue, setInternalValue] = useState("")
  const currentValue = value ?? internalValue
  const [focused, setFocused] = useState(false)
  const reducedMotion = useReducedMotionConfig()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setInternalValue(next)
    onChange?.(next)
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-shadow",
          focused && "ring-2 ring-sky-200 dark:ring-sky-800"
        )}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
        <input
          type="text"
          value={currentValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Ask the agent anything…"
          data-testid="beam-search"
          className="h-full w-full rounded-xl bg-transparent pl-9 pr-12 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
          ⌘K
        </kbd>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[6px] overflow-hidden rounded-b-xl">
        {focused ? (
          reducedMotion ? (
            <>
              <div className="absolute inset-x-0 bottom-0 h-[6px] bg-gradient-to-r from-transparent via-sky-500 to-violet-500 opacity-80 blur-sm" />
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-sky-500 to-violet-500" />
            </>
          ) : (
            <>
              <motion.div
                className="absolute bottom-0 w-[35%] h-[6px] bg-gradient-to-r from-transparent via-sky-500 to-violet-500 opacity-80 blur-sm"
                initial={false}
                animate={{ left: ["-35%", "100%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute bottom-0 w-[35%] h-[2px] bg-gradient-to-r from-transparent via-sky-500 to-violet-500"
                initial={false}
                animate={{ left: ["-35%", "100%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              />
            </>
          )
        ) : null}
      </div>
    </div>
  )
}
