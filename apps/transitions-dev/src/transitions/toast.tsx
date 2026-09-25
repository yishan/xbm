import { useState } from "react"
import { CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTimeouts, useTrigger } from "@/lib/motion"
import type { DemoProps } from "./types"
import "./toast.css"

type State = "closed" | "open" | "closing"

export function Toast({ trigger }: DemoProps) {
  const [state, setState] = useState<State>("closed")
  const timers = useTimeouts()

  const open = () => {
    timers.clear()
    setState("open")
    timers.set(() => setState((s) => (s === "open" ? "closing" : s)), 2600)
  }
  const close = () => {
    timers.clear()
    setState((s) => (s === "open" ? "closing" : s))
  }
  const toggle = () => (state === "open" ? close() : open())

  useTrigger(trigger, toggle)

  return (
    <div className="relative flex h-full w-full items-start justify-center pt-8">
      <Button variant="outline" size="sm" onClick={toggle}>
        Save changes
      </Button>
      {state !== "closed" && (
        <div
          role="status"
          data-state={state}
          onAnimationEnd={() => state === "closing" && setState("closed")}
          className="t-toast absolute bottom-5 left-1/2 flex w-[250px] -translate-x-1/2 items-center gap-2.5 rounded-xl border bg-popover px-3 py-2.5 text-sm shadow-lg shadow-black/5"
        >
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <div className="min-w-0 flex-1">
            <p className="font-medium leading-tight">Changes saved</p>
            <p className="truncate text-xs text-muted-foreground">Your profile is up to date.</p>
          </div>
          <button
            aria-label="Dismiss"
            onClick={close}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

export const toastJsx = `const [state, setState] = useState<"closed" | "open" | "closing">("closed")

{state !== "closed" && (
  <div
    role="status"
    className="t-toast"
    data-state={state}
    onAnimationEnd={() => state === "closing" && setState("closed")}
  >
    Changes saved
  </div>
)}`
