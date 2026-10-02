export type TemplateCategory =
  | "list"
  | "sequence"
  | "hierarchy"
  | "compare"
  | "chart"
  | "relation"

export type TemplateSample = {
  id: string
  name: string
  category: TemplateCategory
  description: string
  /** AntV Infographic DSL (first line: `infographic <template-name>`) */
  syntax: string
}
