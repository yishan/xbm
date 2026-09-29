import type { ComponentType } from "react"

export type Category = "WebGL" | "Canvas" | "GSAP" | "Motion"

/** "section" = full-width hero-scale preview; "card" = grid card (~360x256 preview). */
export type Layout = "section" | "card"

export interface BlockDef {
  id: string
  title: string
  description: string
  hint: string
  category: Category
  /** Short tech badges, e.g. ["WebGL", "GLSL"] */
  tech: string[]
  layout: Layout
  file: string
  Demo: ComponentType
  source: string
}
