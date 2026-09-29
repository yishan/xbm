import { techReadme } from "./tech-readme"
import { apiNotes } from "./api-notes"
import { architecture } from "./architecture"

export type SampleDoc = {
  id: string
  title: string
  subtitle: string
  filename: string
  markdown: string
}

export const DOCS: SampleDoc[] = [techReadme, apiNotes, architecture]

export function getDoc(id: string): SampleDoc {
  return DOCS.find((d) => d.id === id) ?? DOCS[0]!
}
