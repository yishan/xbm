import { useState } from "react"
import { HoldToConfirm } from "@/blocks/hold-to-confirm"

export function HoldToConfirmDemo() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <HoldToConfirm onConfirm={() => setCount((c) => c + 1)} />
      <p className="text-xs text-zinc-500">Confirmed {count} {count === 1 ? "time" : "times"}</p>
    </div>
  )
}
