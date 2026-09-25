import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { useReducedMotion, useTrigger } from "@/lib/motion"
import type { DemoProps } from "./types"
import "./streaming-text.css"

const TEXT =
  "Animating a transform composites on the GPU, so it stays smooth even while the main thread is busy. Blur is pricier — keep it small and short-lived, and only on elements that are entering."
const WORDS = TEXT.split(" ")
const WORD_MS = 55

export function StreamingText({ trigger }: DemoProps) {
  const reduced = useReducedMotion()
  const [count, setCount] = useState(0)
  const [run, setRun] = useState(0)

  useEffect(() => {
    let n = 0
    const id = window.setInterval(() => {
      n += 1
      setCount(n)
      if (n >= WORDS.length) window.clearInterval(id)
    }, WORD_MS)
    return () => window.clearInterval(id)
  }, [run])

  useTrigger(trigger, () => {
    setCount(0)
    setRun((r) => r + 1)
  })

  const shown = reduced ? WORDS.length : count
  const streaming = shown < WORDS.length

  return (
    <div className="w-full max-w-[290px] rounded-xl border bg-card p-3.5 shadow-sm">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="size-3.5 text-violet-500" /> Assistant
      </div>
      <p className="min-h-[5.6rem] text-[13px] leading-relaxed" aria-live="polite">
        {WORDS.slice(0, shown).map((w, i) => (
          <span key={`${run}-${i}`} className="t-stream-word">
            {w}{" "}
          </span>
        ))}
        {streaming && <span className="t-stream-caret text-violet-500" aria-hidden />}
      </p>
    </div>
  )
}

export const streamingTextJsx = `// append one word per tick; only new spans mount, so only they animate
<p aria-live="polite">
  {words.slice(0, count).map((w, i) => (
    <span key={i} className="t-stream-word">{w} </span>
  ))}
  {streaming && <span className="t-stream-caret" aria-hidden />}
</p>`
