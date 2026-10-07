import { useEffect, useRef, useState } from "react"
import type { DemoPage, ThemeId, ModeId } from "@/data/pages"
import { pageUrl, draftUrl } from "@/data/pages"

export function PageViewer({
  page,
  theme,
  mode,
  view,
}: {
  page: DemoPage
  theme: ThemeId
  mode: ModeId
  view: "page" | "split"
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [draft, setDraft] = useState<string | null>(null)

  function apply() {
    const doc = iframeRef.current?.contentDocument
    if (!doc?.documentElement) return
    doc.documentElement.setAttribute("data-theme", theme)
    doc.documentElement.setAttribute("data-mode", mode)
    for (const name of ["theme", "mode"] as const) {
      const select = doc.querySelector(
        `select[data-am="${name}"]`
      ) as HTMLSelectElement | null
      if (!select) continue
      select.value = name === "theme" ? theme : mode
    }
  }

  useEffect(() => {
    apply()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, mode, page.id])

  useEffect(() => {
    let cancelled = false
    setDraft(null)
    fetch(draftUrl(page.id))
      .then((res) => res.text())
      .then((text) => {
        if (!cancelled) setDraft(text)
      })
      .catch(() => {
        if (!cancelled) setDraft("")
      })
    return () => {
      cancelled = true
    }
  }, [page.id])

  const frame = (
    <div className="min-w-0">
      <iframe
        ref={iframeRef}
        title={page.title}
        data-testid="page-frame"
        src={pageUrl(page.id)}
        onLoad={apply}
        className="h-[70vh] min-h-[480px] w-full rounded-lg border bg-white"
      />
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <a
          href={pageUrl(page.id)}
          target="_blank"
          rel="noreferrer"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          新窗口打开
        </a>
        <a
          href={draftUrl(page.id)}
          download=""
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          下载草稿 .md
        </a>
      </div>
    </div>
  )

  if (view === "page") {
    return frame
  }

  const bytes = draft ? new Blob([draft]).size : 0
  const lines = draft ? draft.split("\n").length : 0

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="min-w-0">
        <h3 className="text-sm font-medium text-foreground">Markdown 草稿</h3>
        <div className="mt-1 mb-2 text-xs text-muted-foreground">
          {bytes} bytes · {lines} 行
        </div>
        {draft === null ? (
          <div className="flex h-[70vh] min-h-[480px] items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
            加载中…
          </div>
        ) : (
          <pre
            data-testid="draft-source"
            className="h-[70vh] min-h-[480px] overflow-auto rounded-lg border bg-muted p-4 text-xs leading-relaxed whitespace-pre-wrap break-words"
          >
            {draft}
          </pre>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="mb-2 text-sm font-medium text-foreground">
          渲染结果 (am render)
        </h3>
        {frame}
      </div>
    </div>
  )
}
