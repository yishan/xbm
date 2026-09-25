import { useLayoutEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useTrigger } from "@/lib/motion"
import type { DemoProps } from "./types"
import "./tabs-sliding.css"

const TABS = [
  { id: "plan", label: "Plan", body: "Break the task into 4 steps." },
  { id: "build", label: "Build", body: "Editing 3 files in src/." },
  { id: "review", label: "Review", body: "2 suggestions, 0 blockers." },
]

export function TabsSliding({ trigger }: DemoProps) {
  const [active, setActive] = useState(0)
  const [ready, setReady] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  useLayoutEffect(() => {
    const measure = () => {
      const tab = tabRefs.current[active]
      const list = listRef.current
      if (!tab || !list) return
      list.style.setProperty("--x", `${tab.offsetLeft}px`)
      list.style.setProperty("--w", `${tab.offsetWidth}px`)
    }
    measure()
    document.fonts?.ready.then(measure)
    if (!ready) requestAnimationFrame(() => setReady(true))
  }, [active, ready])

  useTrigger(trigger, () => setActive((a) => (a + 1) % TABS.length))

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={listRef}
        role="tablist"
        data-ready={ready ? "" : undefined}
        className="t-tabs bg-muted ring-1 ring-foreground/5"
      >
        <span className="t-tabs-pill bg-background shadow-sm ring-1 ring-foreground/5" aria-hidden />
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={cn(
              "t-tabs-tab rounded-lg px-4 py-1.5 text-sm font-medium",
              active === i ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p key={TABS[active].id} role="tabpanel" className="t-tabs-panel text-sm text-muted-foreground">
        {TABS[active].body}
      </p>
    </div>
  )
}

export const tabsSlidingJsx = `useLayoutEffect(() => {
  const tab = tabRefs.current[active]
  list.style.setProperty("--x", \`\${tab.offsetLeft}px\`)
  list.style.setProperty("--w", \`\${tab.offsetWidth}px\`)
}, [active])

<div ref={listRef} role="tablist" className="t-tabs" data-ready>
  <span className="t-tabs-pill" aria-hidden />
  {tabs.map((t, i) => (
    <button key={t.id} ref={(el) => (tabRefs.current[i] = el)}
      role="tab" className="t-tabs-tab" onClick={() => setActive(i)}>
      {t.label}
    </button>
  ))}
</div>
<p key={active} className="t-tabs-panel">{tabs[active].body}</p>`
