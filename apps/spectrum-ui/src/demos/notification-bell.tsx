import { useState } from "react"
import { NotificationBell } from "@/blocks/notification-bell"

const MESSAGES = [
  "Nova finished research",
  "Deploy succeeded",
  "Agent paused review",
  "New dataset uploaded",
]

export function NotificationBellDemo() {
  const [count, setCount] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)

  const addAlert = () => {
    setCount((c) => c + 1)
    setMessageIndex((i) => (i + 1) % MESSAGES.length)
  }

  const clear = () => {
    setCount(0)
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
      <NotificationBell count={count} onClick={clear} />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={addAlert}
          data-testid="bell-add"
          className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-950"
        >
          New alert
        </button>
        <button
          type="button"
          onClick={clear}
          data-testid="bell-clear"
          className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-950"
        >
          Mark read
        </button>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">{MESSAGES[messageIndex]}</p>
    </div>
  )
}
