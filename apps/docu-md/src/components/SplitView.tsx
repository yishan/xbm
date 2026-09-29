// Showcase UI inspired by docu.md (https://docu.md/). Re-implemented with a permissive stack.
// Do not vendor GPLv3 engines from markdown-viewer.
import { SourcePane } from "@/components/SourcePane"
import { PreviewPane } from "@/components/PreviewPane"

type SplitViewProps = {
  mode: "split" | "source" | "preview"
  source: string
  filename: string
}

export function SplitView({ mode, source, filename }: SplitViewProps) {
  if (mode === "source") {
    return (
      <div
        data-testid="split-view"
        className="flex h-full min-h-0 w-full flex-col overflow-hidden"
      >
        <SourcePane source={source} filename={filename} />
      </div>
    )
  }

  if (mode === "preview") {
    return (
      <div
        data-testid="split-view"
        className="flex h-full min-h-0 w-full flex-col overflow-hidden"
      >
        <PreviewPane source={source} />
      </div>
    )
  }

  return (
    <div data-testid="split-view" className="grid h-full min-h-0 w-full grid-cols-2">
      <div className="flex min-h-0 flex-col overflow-hidden">
        <SourcePane source={source} filename={filename} />
      </div>
      <div className="flex min-h-0 flex-col overflow-hidden border-l border-border">
        <PreviewPane source={source} />
      </div>
    </div>
  )
}
