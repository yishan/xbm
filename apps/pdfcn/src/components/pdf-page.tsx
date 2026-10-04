// Showcase inspired by shadcn-labs/pdfcn (MIT). https://github.com/shadcn-labs/pdfcn
import type { ReactNode } from "react"

import type { PdfThemeId } from "@/lib/pdf-themes"
import { cn } from "@/lib/utils"

type PdfPageProps = {
  themeId: PdfThemeId
  children: ReactNode
  className?: string
}

export function PdfPage({ themeId, children, className }: PdfPageProps) {
  return (
    <div
      data-testid="pdf-page"
      className={cn(
        "pdf-page",
        `pdf-theme-${themeId}`,
        "relative w-full max-w-[794px] min-h-[calc(794px*297/210)]",
        "shadow-lg border border-black/5 rounded-sm",
        className,
      )}
    >
      <div className="p-8 md:p-10">{children}</div>
    </div>
  )
}
