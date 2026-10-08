import type { PieceName } from "ascii.rest"
import piecesJson from "@/data/pieces.json"
import fleetJson from "@/data/fleet.json"

export type Category =
  | "scenes" | "shapes" | "space" | "physics" | "nature" | "creatures" | "objects"
  | "generative" | "effects" | "ui" | "data" | "type" | "logos" | "companies" | "distros"

/** One piece's meta, read from ascii.rest 0.2.1 by scripts/gen-data.ts. */
export type PieceInfo = {
  id: PieceName
  name: string
  category: Category
  note: string
  cols: number
  rows: number
  fps: number
  canvas: boolean
  clock: boolean
  /** Cell height in cell widths on a canvas (1 or 2). */
  cell: number
}

export const PIECES = piecesJson as PieceInfo[]

/** Category order shown in the gallery (ui / data / type first: the pieces a status page uses). */
export const CATEGORIES: Category[] = [
  "ui", "data", "type", "scenes", "shapes", "space", "physics", "nature",
  "creatures", "objects", "generative", "effects", "logos", "companies", "distros",
]

/** "native" keeps each piece's own frame rate; 0 holds the first frame. */
export type FpsChoice = "native" | 24 | 8 | 0

export type Demo = { slug: string; merged: string; commit: string; pr: number | null }
export type Merge = { date: string; pr: number; branch: string }
export type Run = { date: string; slug: string; finished: string | null; at: string | null; result: "done" | "manual" | "stopped" | "running" }
export type Fleet = {
  generated: string
  head: string
  sources: Record<"demos" | "prs" | "runs" | "schedule", string>
  demos: Demo[]
  merges: Merge[]
  perWeek: { labels: string[]; demos: number[]; prs: number[] }
  runs: Run[]
}
export const FLEET = fleetJson as Fleet
