import type { ComponentType } from "react"

export type Category = "Essential" | "Text" | "Effect"

export interface DemoProps {
  /** Incremented by the card's replay button (and "Replay all"). */
  trigger: number
}

export interface TransitionDef {
  id: string
  title: string
  description: string
  category: Category
  /** Label for the card's trigger button. */
  action: string
  Demo: ComponentType<DemoProps>
  /** The exact CSS that powers the demo (imported with ?raw). */
  css: string
  /** Minimal React usage for the snippet. */
  jsx: string
}
