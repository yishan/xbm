// Showcase inspired by shadcn-labs/pdfcn (MIT). https://github.com/shadcn-labs/pdfcn
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { AppHeader, type ExportState } from "@/components/app-header"
import { BlockSidebar } from "@/components/block-sidebar"
import { PreviewPane } from "@/components/preview-pane"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DEFAULT_BLOCK, type BlockId } from "@/lib/blocks"
import { exportPdf, findPdfPage } from "@/lib/pdf-export"
import { DEFAULT_PDF_THEME, type PdfThemeId } from "@/lib/pdf-themes"

export function App() {
  const [blockId, setBlockId] = useState<BlockId>(DEFAULT_BLOCK)
  const [pdfThemeId, setPdfThemeId] = useState<PdfThemeId>(DEFAULT_PDF_THEME)
  const [exportState, setExportState] = useState<ExportState>({ status: "idle" })
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    setExportState((current) => (current.status === "error" ? { status: "idle" } : current))
  }, [blockId, pdfThemeId])

  const onExport = async () => {
    if (exportState.status === "loading") {
      return
    }

    const pageEl = findPdfPage()
    if (!pageEl) {
      setExportState({ status: "error", message: "Preview not ready" })
      return
    }

    const controller = new AbortController()
    abortRef.current = controller

    setExportState({ status: "loading", message: "Exporting…" })

    try {
      const filename = await exportPdf({
        pageEl,
        blockId,
        themeId: pdfThemeId,
        signal: controller.signal,
        onStatus: (message) => setExportState({ status: "loading", message }),
      })

      setExportState({ status: "idle" })
      toast.success(`Downloaded ${filename}`)
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return
      }

      const message = error instanceof Error ? error.message : "PDF export failed"
      setExportState({ status: "error", message })
      toast.error(message, {
        id: "pdf-export",
        duration: 10000,
        action: { label: "Retry", onClick: () => void onExport() },
      })
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
      }
    }
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-svh w-full" data-testid="app-root">
        <BlockSidebar activeId={blockId} onSelect={setBlockId} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            pdfThemeId={pdfThemeId}
            onPdfThemeChange={setPdfThemeId}
            exportState={exportState}
            onExport={onExport}
          />
          <PreviewPane blockId={blockId} pdfThemeId={pdfThemeId} />
          <footer className="border-t px-4 py-2 text-center text-xs text-muted-foreground">
            MIT · inspired by{" "}
            <a
              href="https://pdfcn.dev"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-2 hover:underline"
            >
              pdfcn.dev
            </a>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  )
}
