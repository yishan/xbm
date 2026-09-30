// Showcase UI inspired by docu.md (https://docu.md/). Re-implemented with a permissive stack.
// Do not vendor GPLv3 engines from markdown-viewer.
import { useState } from "react"
import {
  BookOpen,
  Code,
  Columns2,
  FileDown,
  FileText,
  Loader2,
  Moon,
  Sun,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { exportHtml, exportPdf } from "@/lib/export"

export type ViewMode = "split" | "source" | "preview"
export type ThemeMode = "light" | "dark" | "reading"

type ToolbarProps = {
  viewMode: ViewMode
  onViewMode: (m: ViewMode) => void
  theme: ThemeMode
  onTheme: (t: ThemeMode) => void
  docTitle: string
}

const VIEW_MODES: { mode: ViewMode; label: string; icon: typeof Columns2; testId: string }[] = [
  { mode: "split", label: "Split", icon: Columns2, testId: "view-split" },
  { mode: "source", label: "Source", icon: Code, testId: "view-source" },
  { mode: "preview", label: "Preview", icon: FileText, testId: "view-preview" },
]

const THEME_CYCLE: ThemeMode[] = ["light", "dark", "reading"]

const THEME_META: Record<ThemeMode, { label: string; icon: typeof Sun }> = {
  light: { label: "Light", icon: Sun },
  dark: { label: "Dark", icon: Moon },
  reading: { label: "Reading", icon: BookOpen },
}

const EXPORT_FORMATS = [
  { id: "pdf", label: "PDF", real: true },
  { id: "html", label: "HTML", real: true },
  { id: "docx", label: "DOCX", real: false },
  { id: "epub", label: "EPUB", real: false },
] as const

export function Toolbar({ viewMode, onViewMode, theme, onTheme, docTitle }: ToolbarProps) {
  const { label: themeLabel, icon: ThemeIcon } = THEME_META[theme]
  const [pdfBusy, setPdfBusy] = useState(false)

  const cycleTheme = () => {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length]
    onTheme(next)
  }

  const handleHtmlExport = async () => {
    try {
      await exportHtml(docTitle)
      toast.success("HTML downloaded")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "HTML export failed")
    }
  }

  const handlePdfExport = async () => {
    if (pdfBusy) return
    setPdfBusy(true)
    const id = toast.loading("Rendering PDF on Cloudflare…")
    try {
      await exportPdf(docTitle, undefined, (msg) => toast.loading(msg, { id }))
      toast.success("PDF downloaded", { id })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PDF export failed", { id })
    } finally {
      setPdfBusy(false)
    }
  }

  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b bg-background/80 px-3 text-sm backdrop-blur">
      <span className="min-w-0 flex-1 truncate font-medium" title={docTitle}>
        {docTitle}
      </span>

      <div
        className="flex items-center gap-1 rounded-lg border p-0.5"
        role="group"
        aria-label="View mode"
      >
        {VIEW_MODES.map(({ mode, label, icon: Icon, testId }) => (
          <Button
            key={mode}
            size="sm"
            variant={viewMode === mode ? "default" : "ghost"}
            onClick={() => onViewMode(mode)}
            data-testid={testId}
            title={`${label} view`}
            aria-pressed={viewMode === mode}
          >
            <Icon />
            <span className="hidden sm:inline">{label}</span>
          </Button>
        ))}
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={cycleTheme}
        data-testid="theme-toggle"
        title={`Theme: ${themeLabel}`}
      >
        <ThemeIcon />
        <span className="hidden sm:inline">{themeLabel}</span>
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="flex items-center gap-1">
        {EXPORT_FORMATS.map(({ id, label, real }) => {
          const busy = id === "pdf" && pdfBusy

          const onExport = () => {
            if (id === "pdf") {
              void handlePdfExport()
            } else if (id === "html") {
              void handleHtmlExport()
            } else {
              toast.info(`${label} export is mocked in this demo`)
            }
          }

          return (
            <Button
              key={id}
              size="sm"
              variant={real ? "outline" : "ghost"}
              onClick={onExport}
              disabled={busy}
              aria-busy={id === "pdf" ? pdfBusy : undefined}
              data-state={id === "pdf" ? (pdfBusy ? "loading" : "idle") : undefined}
              data-testid={`export-${id}`}
              title={
                real
                  ? `Export ${label}`
                  : `Export ${label} (mock — not implemented in this demo)`
              }
            >
              {busy ? <Loader2 className="animate-spin" /> : <FileDown />}
              <span className="hidden md:inline">{label}</span>
              {real ? null : (
                <span className="hidden text-[10px] text-muted-foreground md:inline">mock</span>
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
