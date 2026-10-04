// Showcase inspired by shadcn-labs/pdfcn (MIT). https://github.com/shadcn-labs/pdfcn
import { InvoiceBlock } from "@/components/blocks/invoice"
import { ReceiptBlock } from "@/components/blocks/receipt"
import { ReportCoverBlock } from "@/components/blocks/report-cover"
import { ResumeBlock } from "@/components/blocks/resume"
import { PdfPage } from "@/components/pdf-page"
import type { BlockId } from "@/lib/blocks"
import type { PdfThemeId } from "@/lib/pdf-themes"

type PreviewPaneProps = {
  blockId: BlockId
  pdfThemeId: PdfThemeId
}

function renderBlock(blockId: BlockId) {
  switch (blockId) {
    case "invoice":
      return <InvoiceBlock />
    case "resume":
      return <ResumeBlock />
    case "report-cover":
      return <ReportCoverBlock />
    case "receipt":
      return <ReceiptBlock />
  }
}

export function PreviewPane({ blockId, pdfThemeId }: PreviewPaneProps) {
  return (
    <div
      className="flex flex-1 items-start justify-center overflow-auto bg-muted/40 p-4 md:p-8"
      data-testid="preview-pane"
    >
      <div className="w-full max-w-[794px]">
        <PdfPage themeId={pdfThemeId}>{renderBlock(blockId)}</PdfPage>
      </div>
    </div>
  )
}
