import { useState } from "react"
import { FlipText } from "@/blocks/flip-text"

export function FlipTextDemo() {
  const [flipTrigger, setFlipTrigger] = useState(0)

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 overflow-hidden p-4">
      <FlipText
        dataTestId="flip-text"
        className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
        trigger={flipTrigger}
      >
        ObsidianUI
      </FlipText>

      <FlipText
        axis="y"
        className="text-lg text-zinc-600 dark:text-zinc-400"
        trigger={flipTrigger}
      >
        Hover me
      </FlipText>

      <button
        type="button"
        data-testid="flip-all"
        onClick={() => setFlipTrigger((count) => count + 1)}
        className="rounded-full border border-zinc-900/10 dark:border-white/10 bg-zinc-900/[0.04] dark:bg-white/5 px-3 py-1 text-xs text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-900/10 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        Flip all
      </button>
    </div>
  )
}
