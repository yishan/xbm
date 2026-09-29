// Showcase UI inspired by docu.md (https://docu.md/). Re-implemented with a permissive stack.
// Do not vendor GPLv3 engines from markdown-viewer.
import { useEffect, useId, useRef, useState } from "react"

type RenderState =
  | { status: "loading" }
  | { status: "ok" }
  | { status: "error"; message: string }

type MermaidBlockProps = {
  code: string
  id?: string
}

function useHtmlThemeKey() {
  const [key, setKey] = useState(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "default",
  )

  useEffect(() => {
    const root = document.documentElement
    const sync = () =>
      setKey(root.classList.contains("dark") ? "dark" : "default")
    sync()
    const obs = new MutationObserver(sync)
    obs.observe(root, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])

  return key
}

export function MermaidBlock({ code, id }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<RenderState>({ status: "loading" })
  const themeKey = useHtmlThemeKey()
  const reactId = useId().replace(/:/g, "")

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!code.trim()) {
        if (containerRef.current) containerRef.current.innerHTML = ""
        setState({ status: "ok" })
        return
      }

      setState({ status: "loading" })

      try {
        const mermaid = (await import("mermaid")).default
        if (cancelled) return

        mermaid.initialize({
          startOnLoad: false,
          theme: themeKey === "dark" ? "dark" : "default",
          securityLevel: "loose",
        })

        const renderId = `mermaid-${id ?? reactId}-${Math.random().toString(36).slice(2, 10)}`
        const { svg } = await mermaid.render(renderId, code)
        if (cancelled) return

        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }
        setState({ status: "ok" })
      } catch (err) {
        if (cancelled) return
        setState({
          status: "error",
          message: err instanceof Error ? err.message : String(err),
        })
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [code, id, themeKey, reactId])

  return (
    <div
      className="my-4 overflow-x-auto rounded-xl border border-border bg-muted/30 p-4 [&_svg]:mx-auto"
      data-testid="mermaid-block"
    >
      <div ref={containerRef} hidden={state.status !== "ok"} />

      {state.status === "loading" && (
        <p className="m-0 text-center text-sm text-muted-foreground">
          Rendering diagram…
        </p>
      )}

      {state.status === "error" && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <p className="m-0 font-medium">Could not render diagram</p>
          <p className="m-0 mt-1 break-words font-mono text-xs">{state.message}</p>
        </div>
      )}
    </div>
  )
}
