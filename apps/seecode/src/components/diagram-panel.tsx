import { useCallback, useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { DiagramInfo } from "@/data/diagrams"
import { cn } from "@/lib/utils"

const DEFAULT_HEIGHT = 560
const MIN_HEIGHT = 420
const MAX_HEIGHT = 900

function clampHeight(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_HEIGHT
  return Math.min(Math.max(value, MIN_HEIGHT), MAX_HEIGHT)
}

function queryNode(doc: Document, id: string): Element | null {
  try {
    return doc.querySelector(`[data-sc-node="${CSS.escape(id)}"]`)
  } catch {
    return null
  }
}

// Push the page theme into the embedded SeeCode viewer (it reads data-theme) and keep its own switch in sync.
function applyTheme(doc: Document, mode: "light" | "dark") {
  doc.documentElement.setAttribute("data-theme", mode)
  doc.querySelector('[data-sc-action="theme"]')?.setAttribute("aria-checked", String(mode === "dark"))
}

function ariaLabelOf(doc: Document, id: string): string | null {
  // SeeCode's aria-label is "label, sub"; the chip only needs the label.
  const label = queryNode(doc, id)?.getAttribute("aria-label")?.split(", ")[0]?.trim()
  return label ? label : null
}

export function DiagramPanel({
  diagram,
  mode,
}: {
  diagram: DiagramInfo
  mode: "light" | "dark"
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const modeRef = useRef<"light" | "dark">(mode)
  const cleanupRef = useRef<(() => void) | null>(null)
  const [height, setHeight] = useState(DEFAULT_HEIGHT)
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [labels, setLabels] = useState<Record<string, string>>({})

  const details = diagram.details
  const detailKeys = Object.keys(details)

  useEffect(() => {
    modeRef.current = mode
    const doc = iframeRef.current?.contentDocument
    if (doc) applyTheme(doc, mode)
  }, [mode])

  useEffect(() => {
    return () => {
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [])

  const rememberLabel = useCallback((doc: Document, id: string) => {
    const label = ariaLabelOf(doc, id)
    if (!label) return
    setLabels((prev) => (prev[id] === label ? prev : { ...prev, [id]: label }))
  }, [])

  const handleLoad = () => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!iframe || !doc) return

    cleanupRef.current?.()
    applyTheme(doc, modeRef.current)
    // The root build injects the "← XG Experiments" pill into every built HTML file;
    // keep it only on the page itself, not inside each embedded diagram.
    doc.getElementById("xbm-home-link")?.remove()
    setHeight(clampHeight(doc.documentElement.scrollHeight + 8))

    const initialLabels: Record<string, string> = {}
    for (const key of Object.keys(diagram.details)) {
      initialLabels[key] = ariaLabelOf(doc, key) ?? key
    }
    setLabels(initialLabels)

    const readNodeId = (target: EventTarget | null): string | null => {
      const el = target as Element | null
      if (!el || typeof el.closest !== "function") return null
      const node = el.closest("[data-sc-node]")
      return node?.getAttribute("data-sc-node") ?? null
    }

    const pick = (target: EventTarget | null) => {
      const id = readNodeId(target)
      if (!id) return
      setSelected(id)
      rememberLabel(doc, id)
    }

    const onClick = (event: Event) => pick(event.target)
    const onKeyDown = (event: Event) => {
      if ((event as KeyboardEvent).key !== "Enter") return
      pick(event.target)
    }

    // Capture phase: SeeCode's viewer handles node clicks itself and may stop propagation.
    doc.addEventListener("click", onClick, true)
    doc.addEventListener("keydown", onKeyDown, true)
    cleanupRef.current = () => {
      doc.removeEventListener("click", onClick, true)
      doc.removeEventListener("keydown", onKeyDown, true)
    }
  }

  const triggerAction = (action: "prev" | "next" | "replay") => {
    const doc = iframeRef.current?.contentDocument
    if (doc) {
      const el = doc.querySelector(
        `[data-sc-action="${action}"]`
      ) as HTMLElement | null
      el?.click()
    }
    setStep((prev) =>
      action === "replay" ? 0 : action === "prev" ? Math.max(0, prev - 1) : prev + 1
    )
  }

  const focusNode = (id: string) => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    const el = queryNode(doc, id) as HTMLElement | null
    if (!el) return
    const MouseEventCtor = doc.defaultView?.MouseEvent ?? MouseEvent
    el.dispatchEvent(new MouseEventCtor("click", { bubbles: true }))
  }

  const selectChip = (key: string) => {
    setSelected(key)
    focusNode(key)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          aria-label="上一步"
          onClick={() => triggerAction("prev")}
        >
          上一步
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-label="下一步"
          onClick={() => triggerAction("next")}
        >
          下一步
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-label="重播"
          onClick={() => triggerAction("replay")}
        >
          重播
        </Button>
        <span role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {step === 0 ? "逐步演示：点「下一步」开始" : `第 ${step} 步`}
        </span>
        {diagram.sample ? <Badge variant="secondary">示例数据</Badge> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <iframe
          ref={iframeRef}
          title={`${diagram.title}（交互图）`}
          src={`${import.meta.env.BASE_URL}diagrams/${diagram.id}.html`}
          className="w-full rounded-lg border bg-card"
          style={{ height }}
          onLoad={handleLoad}
        />

        <aside className="rounded-lg border bg-card p-4 text-sm">
          <h3 className="font-medium">节点说明</h3>
          <div className="mt-2 leading-relaxed text-muted-foreground">
            {selected ? (
              <>
                <p className="font-medium text-foreground">
                  {labels[selected] ?? selected}
                </p>
                <p className="mt-1">
                  {details[selected] ??
                    "这个节点没有额外说明，可在图内面板查看连接关系。"}
                </p>
              </>
            ) : (
              <p>点击图中的节点查看说明；悬停可高亮相连的路径。</p>
            )}
          </div>

          {detailKeys.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {detailKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={selected === key}
                  className={cn(
                    "rounded-full border px-2 py-1 text-xs transition-colors hover:bg-muted",
                    selected === key && "bg-muted text-foreground"
                  )}
                  onClick={() => selectChip(key)}
                >
                  {labels[key] ?? key}
                </button>
              ))}
            </div>
          ) : null}
        </aside>
      </div>

      <details>
        <summary className="cursor-pointer text-sm font-medium">查看 JSON 规格</summary>
        <pre className="mt-2 max-h-80 overflow-auto rounded-md bg-muted p-3 text-xs">
          {JSON.stringify(diagram.spec, null, 2)}
        </pre>
      </details>
    </div>
  )
}
