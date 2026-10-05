// Showcase inspired by shadcn-labs/pdfcn (MIT). https://github.com/shadcn-labs/pdfcn

export type PdfThemeId =
  | "professional"
  | "modern"
  | "minimal"
  | "executive"
  | "forest"
  | "blueprint"

export type PdfTheme = {
  id: PdfThemeId
  name: string
  description: string
}

export const PDF_THEMES: PdfTheme[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Refined zinc/slate neutrals with a calm accent",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Cool slate neutrals with a subtle violet accent",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Black and white with monospace headings",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Deep navy palette with serif headings",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Deep greens and warm paper tones",
  },
  {
    id: "blueprint",
    name: "Blueprint",
    description: "Slate with cyan accent, technical precision",
  },
]

export const DEFAULT_PDF_THEME: PdfThemeId = "professional"
