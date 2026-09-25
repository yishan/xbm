import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTrigger } from "@/lib/motion"
import type { DemoProps } from "./types"
import "./error-shake.css"

const valid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export function ErrorShake({ trigger }: DemoProps) {
  const [value, setValue] = useState("ada@studio")
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(0)

  const submit = () => {
    if (valid(value)) {
      setError(false)
      return
    }
    setError(true)
    setShake((s) => s + 1) // new key -> animation restarts
  }

  useTrigger(trigger, () => {
    if (valid(value)) setValue("ada@studio")
    setError(true)
    setShake((s) => s + 1)
  })

  return (
    <form
      className="flex w-[260px] flex-col"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <div
        key={shake}
        data-shake={shake > 0 ? "" : undefined}
        className="t-shake flex gap-2"
      >
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (error && valid(e.target.value)) setError(false)
          }}
          aria-invalid={error}
          aria-describedby="shake-msg"
          aria-label="Email"
          className={cn(
            "h-8 min-w-0 flex-1 rounded-lg border bg-background px-2.5 text-sm outline-none transition-[border-color,box-shadow] focus-visible:ring-3 focus-visible:ring-ring/40",
            error && "border-destructive ring-3 ring-destructive/15",
          )}
        />
        <Button type="submit" size="default">
          Notify me
        </Button>
      </div>
      <div className="t-shake-msg" data-show={error} id="shake-msg" role="alert">
        <p className="pt-1.5 text-xs text-destructive">Please enter a valid email.</p>
      </div>
    </form>
  )
}

export const errorShakeJsx = `// bump \`shake\` on every failed submit so the keyframes restart
<div key={shake} className="t-shake" data-shake={shake > 0 || undefined}>
  <input aria-invalid={error} aria-describedby="email-error" />
  <button type="submit">Notify me</button>
</div>
<div className="t-shake-msg" data-show={error} id="email-error" role="alert">
  <p>Please enter a valid email.</p>
</div>`
