import { useState } from "react"
import { cn } from "@/lib/utils"
import { GooeyLoader } from "@/blocks/gooey-loader"

export function GooeyLoaderDemo() {
  const [speed, setSpeed] = useState(1)

  const speeds = [
    { label: "Slow", value: 0.5, testId: "gooey-speed-slow" },
    { label: "Normal", value: 1, testId: "gooey-speed-normal" },
    { label: "Fast", value: 2, testId: "gooey-speed-fast" },
  ]

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div key={speed}>
        <GooeyLoader speed={speed} />
      </div>
      <div className="flex items-center gap-1.5">
        {speeds.map((item) => (
          <button
            key={item.label}
            type="button"
            data-testid={item.testId}
            onClick={() => setSpeed(item.value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              speed === item.value ? "bg-white/10 text-white" : "text-zinc-500"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-zinc-500">Syncing agents…</p>
    </div>
  )
}
