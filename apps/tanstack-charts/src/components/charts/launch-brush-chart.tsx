import { useMemo, useState } from "react"
import { barY, defineChart, lineY, text } from "@tanstack/charts"
import { brushX, type BrushRange, type BrushXChange } from "@tanstack/charts/interaction/brush"
import { controlledSignal } from "@tanstack/charts/interaction/signal"
import { scaleBand } from "@tanstack/charts/scales/band"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { Chart } from "@tanstack/charts/react"
import { tooltip } from "@tanstack/charts/tooltip"

import { ChartCard } from "@/components/chart-card"
import { Button } from "@/components/ui/button"
import { SOURCES } from "@/data/sources"
import launches from "@/data/xbm-launches.json"

type Launch = { slug: string; title: string; built: string }
const ROWS = launches.rows as Launch[]

/** Every calendar day from the first to the last launch, so gaps show on the axis. */
function allDays(first: string, last: string): string[] {
  const out: string[] = []
  for (let d = new Date(first + "T00:00:00Z"); d.toISOString().slice(0, 10) <= last; d.setUTCDate(d.getUTCDate() + 1)) out.push(d.toISOString().slice(0, 10))
  return out
}
const DAYS = allDays(ROWS[0].built, ROWS[ROWS.length - 1].built)
const PER_DAY = DAYS.map((day) => {
  const items = ROWS.filter((r) => r.built === day)
  return { day, label: day.slice(5), count: items.length, slugs: items.map((r) => r.slug).join(", ") }
})
let running = 0
const CUMULATIVE = PER_DAY.map((r) => ({ ...r, total: (running += r.count) }))
const Y_MAX = Math.max(...PER_DAY.map((r) => r.count)) + 1.2
const INITIAL: BrushRange<string> = { start: DAYS.includes("2026-10-01") ? "2026-10-01" : DAYS[0], end: DAYS[DAYS.length - 1] }

export function LaunchBrushChart({ className }: { className?: string }) {
  const [range, setRange] = useState<BrushRange<string>>(INITIAL)
  const [preview, setPreview] = useState<BrushRange<string> | null>(null)
  const shown = preview ?? range
  const inRange = ROWS.filter((r) => r.built >= shown.start && r.built <= shown.end)

  const definition = useMemo(() => {
    const close = DAYS.indexOf(range.end) - DAYS.indexOf(range.start) < 6
    const handles = [
      { id: "start", day: range.start, y: Y_MAX - 0.75, label: `Start ${range.start}`, anchor: "start" as const },
      { id: "end", day: range.end, y: Y_MAX - (close ? 1.05 : 0.75), label: `End ${range.end}`, anchor: close ? ("start" as const) : ("end" as const) },
    ]
    return defineChart({
      marks: [
        barY(PER_DAY.map((r) => ({ ...r, inside: r.day >= range.start && r.day <= range.end })), {
          x: "day",
          y: "count",
          radius: 3,
          inset: 1,
          fill: (r) => (r.inside ? "var(--ts-chart-1)" : "color-mix(in srgb, currentColor 22%, transparent)"),
        }),
        lineY(CUMULATIVE.map((r) => ({ ...r, scaled: (r.total / ROWS.length) * (Y_MAX - 1.2) })), {
          x: "day",
          y: "scaled",
          stroke: "var(--ts-chart-3)",
          strokeWidth: 1.5,
          strokeDasharray: "4 3",
        }),
        text(handles, {
          x: "day",
          y: "y",
          text: "label",
          anchor: (h) => h.anchor,
          dx: (h) => (h.anchor === "start" ? 4 : -10),
          key: "id",
          fontSize: 11,
          fontWeight: 600,
          fill: "var(--foreground)",
        }),
      ],
      scales: {
        x: {
          scale: scaleBand<string>().domain(DAYS).padding(0.2),
          axis: { label: "First release date (Asia/Shanghai)", tickLabels: { rotate: -45 }, ticks: { format: (d) => String(d).slice(5) } },
        },
        y: {
          scale: scaleLinear().domain([0, Y_MAX]),
          grid: true,
          axis: { label: "Demos launched", ticks: { format: (v) => (Number.isInteger(v) && v < Y_MAX - 1 ? String(v) : "") } },
        },
      },
      controls: [
        brushX({
          range: controlledSignal<BrushRange<string>, BrushXChange<string>>(range, (next, { reason }) => {
            if (reason.type === "preview") setPreview(next)
            else { setPreview(null); if (reason.type === "commit") setRange(next) }
          }),
          values: DAYS,
          format: (day, { handle }) => `${handle === "start" ? "Start" : "End"} ${day}`,
          handleSize: 8,
          ariaLabel: "Launch date range",
          startAriaLabel: "Range start date",
          endAriaLabel: "Range end date",
        }),
      ],
      tooltip: { use: tooltip, format: (p) => { const d = p.datum as { day: string; count?: number; slugs?: string; label: string }; return d.count === undefined ? d.label : `${d.day}: ${d.count} launched${d.slugs ? `\n${d.slugs}` : ""}` } },
    })
  }, [range])

  const isInitial = range.start === INITIAL.start && range.end === INITIAL.end
  return (
    <ChartCard
      id="launches"
      title="Demo launch timeline · brushX"
      description={`${ROWS.length} demos from ${DAYS[0].slice(5)} to ${DAYS[DAYS.length - 1].slice(5)}. Drag on the chart, drag either handle, or use the arrow keys on a focused handle; the start and end dates are drawn at each handle.`}
      source={SOURCES.launches}
      actions={<Button variant="outline" size="sm" disabled={isInitial} onClick={() => setRange(INITIAL)}>Reset range</Button>}
      footer={
        <span data-testid="launch-range">
          <b>{shown.start}</b> → <b>{shown.end}</b> · {inRange.length} demo{inRange.length === 1 ? "" : "s"}: {inRange.map((r) => r.slug).join(", ") || "—"}
        </span>
      }
      className={className}
    >
      <div data-testid="chart-launches">
        <Chart definition={definition} height={300} ariaLabel="Demo launches per day on yishan/xbm with a date range brush" ariaDescription="Bars count demos first released per day; a dashed line shows the running total; a horizontal brush selects a date range and labels its start and end dates." />
      </div>
    </ChartCard>
  )
}
