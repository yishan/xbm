// Showcase inspired by shadcn-labs/pdfcn (MIT). https://github.com/shadcn-labs/pdfcn

export type BlockId = "invoice" | "resume" | "report-cover" | "receipt"

export type BlockMeta = {
  id: BlockId
  name: string
  description: string
  category: "Finance" | "HR" | "Reports" | "Commerce"
}

export const BLOCKS: BlockMeta[] = [
  {
    id: "invoice",
    name: "Invoice",
    description: "Line items, totals, and payment terms",
    category: "Finance",
  },
  {
    id: "resume",
    name: "Resume",
    description: "Experience, skills, and education layout",
    category: "HR",
  },
  {
    id: "report-cover",
    name: "Report Cover",
    description: "Title page with meta and accent band",
    category: "Reports",
  },
  {
    id: "receipt",
    name: "Receipt",
    description: "Compact purchase summary with tax",
    category: "Commerce",
  },
]

export const DEFAULT_BLOCK: BlockId = "invoice"
