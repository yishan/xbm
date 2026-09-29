// Showcase UI inspired by docu.md (https://docu.md/). Re-implemented with a permissive stack.
// Do not vendor GPLv3 engines from markdown-viewer.
import { BookOpen, Code, Columns2, FileDown, FileText, Moon, Sun } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

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

const EXPORT_FORMATS = ["DOCX", "PDF", "HTML", "EPUB"] as const

export function Toolbar({ viewMode, onViewMode, theme, onTheme, docTitle }: ToolbarProps) {
  const { label: themeLabel, icon: ThemeIcon } = THEME_META[theme]

  const cycleTheme = () => {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length]
    onTheme(next)
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
        {EXPORT_FORMATS.map((format) => (
          <Button
            key={format}
            size="sm"
            variant="outline"
            onClick={() => toast.success(`${format} export mocked — demo only`)}
            data-testid={`export-${format.toLowerCase()}`}
            title={`Export ${format} (mock)`}
          >
            <FileDown />
            <span className="hidden md:inline">{format}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
