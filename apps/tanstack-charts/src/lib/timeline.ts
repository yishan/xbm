// Timeline helpers for the xbm merged-PR data. Pure functions only (no React).
// Days are "YYYY-MM-DD" strings that are already in Asia/Shanghai, so all date
// math here goes through UTC (`new Date(day + "T00:00:00Z")`) and days are
// enumerated by adding whole 86_400_000 ms steps. That keeps day boundaries
// identical no matter what timezone the browser is in.

import timeline from "@/data/xbm-timeline.json"

export type MergeKind = "demo" | "update" | "fix" | "infra"

export const MERGE_KINDS: readonly MergeKind[] = ["demo", "update", "fix", "infra"]

export const MERGE_KIND_LABEL: Record<MergeKind, string> = {
  demo: "New demo",
  update: "Demo update",
  fix: "Fix",
  infra: "Infra",
}

export function isMergeKind(value: string): value is MergeKind {
  return (MERGE_KINDS as readonly string[]).includes(value)
}

export type MergeRow = {
  pr: number
  sha: string
  mergedAt: string
  day: string
  branch: string
  kind: MergeKind
  apps: string[]
}

/** Rows from xbm-timeline.json with `kind` validated (unknown kinds become "update"). */
export const MERGES: MergeRow[] = timeline.rows.map((row) => ({
  pr: row.pr,
  sha: row.sha,
  mergedAt: row.mergedAt,
  day: row.day,
  branch: row.branch,
  kind: isMergeKind(row.kind) ? row.kind : "update",
  apps: [...row.apps],
}))

export type DayKindRow = { day: string; label: string; kind: MergeKind; count: number }
export type CumulativeRow = { day: string; label: string; kind: MergeKind; total: number }

const DAY_MS = 86_400_000

/** Every calendar day (inclusive) from the first to the last day in `rows`. */
function enumerateDays(rows: MergeRow[]): string[] {
  if (rows.length === 0) return []

  let first = rows[0].day
  let last = rows[0].day
  for (const row of rows) {
    if (row.day < first) first = row.day
    if (row.day > last) last = row.day
  }

  const days: string[] = []
  const end = new Date(`${last}T00:00:00Z`).getTime()
  for (let t = new Date(`${first}T00:00:00Z`).getTime(); t <= end; t += DAY_MS) {
    days.push(new Date(t).toISOString().slice(0, 10))
  }
  return days
}

/** Merge count keyed by `${day}|${kind}`. */
function countByDayKind(rows: MergeRow[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const key = `${row.day}|${row.kind}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

const DAYS: readonly string[] = enumerateDays(MERGES)
const COUNTS: ReadonlyMap<string, number> = countByDayKind(MERGES)

/** The requested kinds, normalised into MERGE_KINDS order. */
function orderedKinds(kinds: readonly MergeKind[]): MergeKind[] {
  return MERGE_KINDS.filter((kind) => kinds.includes(kind))
}

export function dailyByKind(kinds: readonly MergeKind[]): DayKindRow[] {
  const ordered = orderedKinds(kinds)
  const rows: DayKindRow[] = []
  for (const day of DAYS) {
    for (const kind of ordered) {
      rows.push({ day, label: day.slice(5), kind, count: COUNTS.get(`${day}|${kind}`) ?? 0 })
    }
  }
  return rows
}

export function cumulativeByKind(kinds: readonly MergeKind[]): CumulativeRow[] {
  const ordered = orderedKinds(kinds)
  const running = new Map<MergeKind, number>()
  const rows: CumulativeRow[] = []
  for (const day of DAYS) {
    for (const kind of ordered) {
      const total = (running.get(kind) ?? 0) + (COUNTS.get(`${day}|${kind}`) ?? 0)
      running.set(kind, total)
      rows.push({ day, label: day.slice(5), kind, total })
    }
  }
  return rows
}

export function timelineSummary(): {
  merged: number
  demos: number
  firstDay: string
  lastDay: string
  days: number
  busiestDay: { day: string; count: number }
} {
  const merged = MERGES.length
  const demos = MERGES.filter((row) => row.kind === "demo").length
  const firstDay = DAYS[0] ?? ""
  const lastDay = DAYS[DAYS.length - 1] ?? ""
  const days = DAYS.length

  const perDay = new Map<string, number>()
  for (const row of MERGES) {
    perDay.set(row.day, (perDay.get(row.day) ?? 0) + 1)
  }

  // Walk the days in order and only replace on a strictly larger count,
  // so the first day wins ties.
  let busiestDay = { day: firstDay, count: 0 }
  for (const day of DAYS) {
    const count = perDay.get(day) ?? 0
    if (count > busiestDay.count) busiestDay = { day, count }
  }

  return { merged, demos, firstDay, lastDay, days, busiestDay }
}
