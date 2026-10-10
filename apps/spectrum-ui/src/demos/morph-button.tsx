import { useState } from "react"
import { MorphButton } from "@/blocks/morph-button"

export function MorphButtonDemo() {
  const [fail, setFail] = useState(false)

  return (
    <div className="flex flex-col items-center gap-4">
      <MorphButton
        onClick={async () => {
          await new Promise<void>((resolve, reject) => {
            window.setTimeout(() => {
              if (fail) reject(new Error("Simulated failure"))
              else resolve()
            }, 1400)
          })
        }}
      />

      <button
        type="button"
        onClick={() => setFail((f) => !f)}
        data-testid="morph-fail"
        aria-pressed={fail}
        className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <span
          className={`h-3 w-3 rounded-full border transition-colors ${
            fail ? "border-rose-500 bg-rose-500" : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
          }`}
        />
        Simulate failure
      </button>
    </div>
  )
}
