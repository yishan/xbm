// Sticky top bar for the TanStack Charts dashboard: logo + title, external
// links, and the light/dark theme toggle.
import { BookOpen, Bookmark, ChartColumnBig, Code, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="grid size-7 place-items-center rounded-md bg-foreground text-background">
            <ChartColumnBig size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">TanStack Charts</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              xbm nightly demo · 2026-10-07
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://github.com/TanStack/charts"
              target="_blank"
              rel="noreferrer"
              aria-label="TanStack Charts on GitHub"
            >
              <Code />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://tanstack.com/charts"
              target="_blank"
              rel="noreferrer"
              aria-label="TanStack Charts documentation"
            >
              <BookOpen />
              <span className="hidden sm:inline">Docs</span>
            </a>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://x.com/tan_stack/status/2107141729111736483"
              target="_blank"
              rel="noreferrer"
              aria-label="TanStack Charts announcement on X"
            >
              <Bookmark />
              <span className="hidden sm:inline">Bookmark</span>
            </a>
          </Button>

          <Button
            variant="outline"
            size="icon-sm"
            data-testid="theme-toggle"
            aria-label="Toggle dark mode"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? <Sun /> : <Moon />}
          </Button>
        </div>
      </div>
    </header>
  )
}
