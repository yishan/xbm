// Showcase inspired by shadcn-labs/pdfcn (MIT). https://github.com/shadcn-labs/pdfcn
import { useState } from "react"
import { toast } from "sonner"

import { AppHeader } from "@/components/app-header"
import { BlockSidebar } from "@/components/block-sidebar"
import { PreviewPane } from "@/components/preview-pane"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DEFAULT_BLOCK, type BlockId } from "@/lib/blocks"
import { DEFAULT_PDF_THEME, type PdfThemeId } from "@/lib/pdf-themes"

export function App() {
  const [blockId, setBlockId] = useState<BlockId>(DEFAULT_BLOCK)
  const [pdfThemeId, setPdfThemeId] = useState<PdfThemeId>(DEFAULT_PDF_THEME)

  const onExport = () => {
    toast.success("Export is a preview-only mock — no PDF file is generated.")
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-svh w-full" data-testid="app-root">
        <BlockSidebar activeId={blockId} onSelect={setBlockId} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            pdfThemeId={pdfThemeId}
            onPdfThemeChange={setPdfThemeId}
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
