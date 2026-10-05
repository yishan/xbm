// Showcase inspired by shadcn-labs/pdfcn (MIT). https://github.com/shadcn-labs/pdfcn
import { Download, ExternalLink, Loader2, Monitor, Moon, RotateCcw, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useTheme, type Theme } from "@/components/theme-provider"
import { PDF_THEMES, type PdfThemeId } from "@/lib/pdf-themes"
import { cn } from "@/lib/utils"

export type ExportState = {
  status: "idle" | "loading" | "error"
  message?: string
}

type AppHeaderProps = {
  pdfThemeId: PdfThemeId
  onPdfThemeChange: (id: PdfThemeId) => void
  exportState: ExportState
  onExport: () => void
}

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

export function AppHeader({
  pdfThemeId,
  onPdfThemeChange,
  exportState,
  onExport,
}: AppHeaderProps) {
  const { theme, setTheme } = useTheme()

  const ActiveIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor

  const exportLabel =
    exportState.status === "loading"
      ? (exportState.message ?? "Exporting…")
      : exportState.status === "error"
        ? "Retry export"
        : "Export PDF"

  return (
    <header className="flex h-14 items-center gap-2 border-b bg-background px-3 md:px-4">
      <SidebarTrigger data-testid="sidebar-trigger" />

      <div className="flex min-w-0 flex-col">
        <span className="truncate font-semibold text-sm">pdfcn</span>
        <span className="hidden truncate text-xs text-muted-foreground sm:inline">
          Document blocks gallery
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-muted-foreground md:inline">Theme</span>
        <Select
          value={pdfThemeId}
          onValueChange={(value) => onPdfThemeChange(value as PdfThemeId)}
        >
          <SelectTrigger
            className="w-[128px]"
            aria-label="Document theme"
            data-testid="pdf-theme-select"
          >
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            {PDF_THEMES.map((pdfTheme) => (
              <SelectItem key={pdfTheme.id} value={pdfTheme.id}>
                {pdfTheme.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        size="sm"
        variant={exportState.status === "error" ? "outline" : "default"}
        onClick={onExport}
        disabled={exportState.status === "loading"}
        aria-busy={exportState.status === "loading"}
        aria-label={exportLabel}
        title={exportState.status === "error" ? exportState.message : undefined}
        data-testid="export-btn"
        data-state={exportState.status}
        className={cn(
          exportState.status === "loading" && "min-w-[8.5rem]",
          exportState.status === "error" &&
            "border-destructive/50 text-destructive hover:text-destructive",
        )}
      >
        {exportState.status === "loading" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : exportState.status === "error" ? (
          <RotateCcw className="size-4" />
        ) : (
          <Download className="size-4" />
        )}
        <span className="hidden max-w-[16rem] truncate sm:inline-block">{exportLabel}</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            data-testid="theme-toggle"
          >
            <ActiveIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {THEME_OPTIONS.map((option) => {
            const OptionIcon = option.icon
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setTheme(option.value)}
                data-testid={`theme-${option.value}`}
              >
                <OptionIcon className="size-4" />
                {option.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="icon" asChild>
        <a
          href="https://github.com/shadcn-labs/pdfcn"
          target="_blank"
          rel="noreferrer"
          aria-label="View the upstream project on GitHub"
          data-testid="upstream-link"
        >
          <ExternalLink className="size-4" />
        </a>
      </Button>
    </header>
  )
}
