/**
 * Recorded local-run proxy measurements.
 * Primary: grok-bot-jev/examples/chatgpt_pack.json
 * Summary: grok-bot-jev/examples/ab_results.md
 *
 * Single-run lab proxy (2026-09-19) — not a formal benchmark.
 * Do not claim proven token savings. Do not use shadow RTT as main comparison.
 */

export type FigureId = "timing-200k" | "five-task"
export type ChartKind = "bar" | "radar" | "line"

export type AbRow = {
  metric: string
  short: string
  without: number
  with: number
  /** Include in default bar chart (exclude $/token rows that dwarf scales) */
  chartable: boolean
  radar: boolean
  unit?: string
}

export type UsagePoint = {
  phase: string
  percent: number
}

export const SERIES_KEYS = {
  without: "Without Jev",
  with: "With Jev",
} as const

export const SERIES_COLORS = ["#4C72B0", "#DD8452", "#55A868"] as const

export const PAGE_TITLE = "Jev usage router — A/B (recorded local run)"

export const PAGE_SUBTITLE =
  "Single-user showcase of Without vs With Jev side by side as paper-style figures. Numbers from a recorded local-run proxy (2026-09-19), not a formal benchmark."

export const FIGURE_ORDER: FigureId[] = ["timing-200k", "five-task"]

export const FIGURE_LABELS: Record<FigureId, string> = {
  "timing-200k": "Main · 200k timing",
  "five-task": "Secondary · Five-task proxies",
}

export const FIGURE_TITLES: Record<FigureId, string> = {
  "timing-200k":
    "Figure 1 (main). Sample B — 24-candidate ≥200k filter. Wall time 53.803 s vs 4.125 s (13.0× with Jev). Shared collection 104.5 s excluded from both arms.",
  "five-task":
    "Figure 2 (secondary). Five-task proxies — retries, skills loaded, model-research pages / searches (Without vs With Jev).",
}

export const META = {
  date: "2026-09-19",
  sourceJson: "grok-bot-jev/examples/chatgpt_pack.json",
  sourceMd: "grok-bot-jev/examples/ab_results.md",
  poolN: 24,
  collectSecondsSharedExcluded: 104.5,
  reportedSpeedupX: 13.0,
  recordedJevCostUsd: 0.000175,
  timingJevUsd: 0.000405,
  timingJevInputTokens: 9647,
} as const

/** MAIN — timing_comparison from chatgpt_pack.json */
export const TIMING_200K_ROWS: AbRow[] = [
  {
    metric: "Wall time (s)",
    short: "Wall time (s)",
    without: 53.803,
    with: 4.125,
    chartable: true,
    radar: false,
    unit: "s",
  },
  {
    metric: "Pages fetched",
    short: "Pages fetched",
    without: 14,
    with: 5,
    chartable: true,
    radar: true,
  },
  {
    metric: "Web searches",
    short: "Web searches",
    without: 2,
    with: 0,
    chartable: true,
    radar: true,
  },
  {
    metric: "Jev calls",
    short: "Jev calls",
    without: 0,
    with: 2,
    chartable: true,
    radar: true,
  },
  {
    metric: "Hits ≥200k",
    short: "Hits ≥200k",
    without: 10,
    with: 5,
    chartable: true,
    radar: true,
  },
  {
    metric: "Jev input tokens",
    short: "Jev tokens",
    without: 0,
    with: 9647,
    chartable: false,
    radar: false,
  },
  {
    metric: "Jev estimated cost ($)",
    short: "Jev est. ($)",
    without: 0,
    with: 0.000405,
    chartable: false,
    radar: false,
    unit: "$",
  },
]

/**
 * SECONDARY — five-task proxies focused on researcher picks:
 * retries 3→0, skills 6→3, model-research pages 10→4 / searches 5→2
 * plus remaining recorded proxies from ab_results.md / tasks[]
 */
export const FIVE_TASK_ROWS: AbRow[] = [
  {
    metric: "Same failing approach attempts",
    short: "Fail retries",
    without: 3,
    with: 0,
    chartable: true,
    radar: true,
  },
  {
    metric: "Flight-prep skills loaded",
    short: "Skills loaded",
    without: 6,
    with: 3,
    chartable: true,
    radar: true,
  },
  {
    metric: "Model-research pages fetched",
    short: "Pages fetched",
    without: 10,
    with: 4,
    chartable: true,
    radar: true,
  },
  {
    metric: "Model-research web searches",
    short: "Web searches",
    without: 5,
    with: 2,
    chartable: true,
    radar: true,
  },
  {
    metric: "Google Flights browser opens",
    short: "Flights opens",
    without: 1,
    with: 0,
    chartable: true,
    radar: true,
  },
  {
    metric: "News triage Jev calls",
    short: "News Jev calls",
    without: 0,
    with: 1,
    chartable: true,
    radar: true,
  },
  {
    metric: "Jev calls (recorded tasks)",
    short: "Jev calls",
    without: 0,
    with: 1,
    chartable: true,
    radar: true,
  },
  {
    metric: "Recorded Jev estimate ($)",
    short: "Jev est. ($)",
    without: 0,
    with: 0.000175,
    chartable: false,
    radar: false,
    unit: "$",
  },
]

/** Weekly usage meter — does NOT prove token savings */
export const USAGE_METER: UsagePoint[] = [
  { phase: "Baseline", percent: 37 },
  { phase: "After phase 1", percent: 38 },
  { phase: "After phase 2", percent: 39 },
]

export const USAGE_LINE_TITLE =
  "Weekly included-usage meter (%). Includes surrounding chat overhead — does not establish token savings."

export const FOOTNOTES = [
  "Single-run lab proxy dated 2026-09-19 — recorded local measurements, not a formal benchmark.",
  "With-Jev 200k arm fetched only the ranked top 5 by design; 5 vs 10 hits is not evidence that posts disappeared.",
  "Flight comparison with Jev reused an existing cache (not a cold second search).",
  "Weekly usage meter 37% → 38% → 39% includes surrounding chat overhead and is NOT proof of token savings.",
  "Shared collection step (104.5 s) was excluded from both 200k arms; reported wall-time ratio is 13.0× with Jev.",
  "Jev calls without returned usage were estimated at roughly 500 input tokens each in the source notes.",
] as const

export function rowsFor(figure: FigureId): AbRow[] {
  return figure === "timing-200k" ? TIMING_200K_ROWS : FIVE_TASK_ROWS
}

export function chartRows(rows: AbRow[]): AbRow[] {
  return rows.filter((r) => r.chartable)
}

export function radarRows(rows: AbRow[]): AbRow[] {
  return rows.filter((r) => r.radar)
}

export function toGroupedBarData(rows: AbRow[]) {
  return rows.map((r) => ({
    metric: r.short,
    [SERIES_KEYS.without]: r.without,
    [SERIES_KEYS.with]: r.with,
  }))
}

export function toRadarData(rows: AbRow[]) {
  return rows.map((r) => ({
    metric: r.short,
    [SERIES_KEYS.without]: r.without,
    [SERIES_KEYS.with]: r.with,
  }))
}

export function formatCell(value: number, unit?: string): string {
  if (unit === "$") {
    if (value === 0) return "0"
    return value.toFixed(6).replace(/0+$/, "").replace(/\.$/, "")
  }
  if (Number.isInteger(value)) return String(value)
  return String(value)
}
