import type { ComponentType } from "react"

export type Category = "Agent" | "Feedback" | "Input" | "Surface"

export interface BlockDef {
  id: string
  title: string
  description: string
  hint: string
  category: Category
  file: string
  Demo: ComponentType
  source: string
}
