import { useState } from "react"
import { ExpandableActionBar } from "@/blocks/expandable-action-bar"

export function ExpandableActionBarDemo() {
  const [lastAction, setLastAction] = useState("None")

  return (
    <div className="flex flex-col items-center gap-3">
      <ExpandableActionBar
        onActionClick={(_, label) => setLastAction(label)}
      />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">Last: {lastAction}</p>
    </div>
  )
}
