import { useState } from "react"
import { useReducedMotionConfig } from "motion/react"
import { LiquidMetalButton } from "@/blocks/liquid-metal-button"

export function LiquidMetalButtonDemo() {
  const [count, setCount] = useState(0)
  const reducedMotion = useReducedMotionConfig() ?? false

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="flex flex-row items-center gap-3">
        <LiquidMetalButton
          data-testid="metal-button"
          reducedMotion={reducedMotion}
          onClick={() => setCount((c) => c + 1)}
        />
        <LiquidMetalButton
          reducedMotion={reducedMotion}
          className="h-10 px-5"
          onClick={() => setCount((c) => c + 1)}
        >
          Upgrade
        </LiquidMetalButton>
      </div>
      <p className="text-xs text-zinc-500">Clicked {count} {count === 1 ? "time" : "times"}</p>
    </div>
  )
}
