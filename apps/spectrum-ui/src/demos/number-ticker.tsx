import { useEffect, useState } from "react"
import { NumberTicker } from "@/blocks/number-ticker"

export function NumberTickerDemo() {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => setValue(128406), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const bump = () => {
    setValue((current) => current + Math.floor(Math.random() * 89001) + 1000)
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
      <div className="text-center">
        <NumberTicker value={value} className="text-5xl font-semibold text-zinc-900 dark:text-zinc-100" />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">tokens processed</p>
      </div>

      <button
        type="button"
        onClick={bump}
        data-testid="ticker-bump"
        className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-950"
      >
        Run batch
      </button>
    </div>
  )
}
