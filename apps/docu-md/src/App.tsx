// Showcase UI inspired by docu.md (https://docu.md/). Re-implemented with a permissive stack.
// Do not vendor GPLv3 engines from markdown-viewer.

import { useEffect, useMemo, useState } from "react"
import { ExternalLink } from "lucide-react"

import { DOCS, getDoc } from "@/docs"
import { DocSidebar } from "@/components/DocSidebar"
import { SplitView } from "@/components/SplitView"
import { Toolbar, type ThemeMode, type ViewMode } from "@/components/Toolbar"
import { Badge } from "@/components/ui/badge"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

const DOCU_MD_URL = "https://docu.md"
const BOOKMARK_URL = "https://x.com/kiwiflysky/status/2075195594797453646"

export default function App() {
  const [activeId, setActiveId] = useState<string>(DOCS[0]!.id)
  const [viewMode, setViewMode] = useState<ViewMode>("split")
  const [theme, setTheme] = useState<ThemeMode>("light")

  const activeDoc = useMemo(() => getDoc(activeId), [activeId])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("dark", "reading")

    if (theme === "dark") {
      root.classList.add("dark")
      root.removeAttribute("data-theme")
      root.style.colorScheme = "dark"
    } else if (theme === "reading") {
      root.classList.add("reading")
      root.setAttribute("data-theme", "reading")
      root.style.colorScheme = "light"
    } else {
      root.removeAttribute("data-theme")
      root.style.colorScheme = "light"
    }
  }, [theme])

  return (
    <TooltipProvider>
      <div
        data-testid="app-shell"
        className="flex min-h-svh flex-col bg-background text-foreground"
      >
        <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-3">
          <Badge variant="secondary" data-testid="demo-badge">
            xbm demo
          </Badge>
          <h1 className="text-sm font-semibold tracking-tight">docu.md showcase</h1>
          <nav className="flex items-center gap-3 text-xs text-muted-foreground">
            <a
              className="inline-flex items-center gap-1 hover:text-foreground"
              href={DOCU_MD_URL}
              target="_blank"
              rel="noreferrer noopener"
              data-testid="link-docu-md"
            >
              docu.md
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
            <a
              className="inline-flex items-center gap-1 hover:text-foreground"
              href={BOOKMARK_URL}
              target="_blank"
              rel="noreferrer noopener"
              data-testid="link-bookmark"
            >
              X bookmark
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </nav>
          <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
            Inspired by docu.md · permissive demo stack (no GPL engine)
          </span>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[15rem_1fr]">
          <aside className="min-h-0 w-60 border-r">
            <DocSidebar docs={DOCS} activeId={activeId} onSelect={setActiveId} />
          </aside>

          <main className="flex min-h-0 flex-col">
            <Toolbar
              viewMode={viewMode}
              onViewMode={setViewMode}
              theme={theme}
              onTheme={setTheme}
              docTitle={activeDoc.title}
            />
            <div className="min-h-0 flex-1">
              <SplitView
                mode={viewMode}
                source={activeDoc.markdown}
                filename={activeDoc.filename}
              />
            </div>
          </main>
        </div>

        <footer className="border-t px-4 py-2 text-xs text-muted-foreground">
          Showcase UI inspired by docu.md (https://docu.md/). Re-implemented with a
          permissive stack — not affiliated with the markdown-viewer project, whose
          engines are GPLv3.
        </footer>
      </div>
      <Toaster />
    </TooltipProvider>
  )
}
