import { useMemo, useState } from "react"
import { barY, colorLegend, defineChart, lineY } from "@tanstack/charts"
import { scaleBand } from "@tanstack/charts/scales/band"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { scaleOrdinal } from "@tanstack/charts/scales/ordinal"
import { scalePoint } from "@tanstack/charts/scales/point"
import { Chart } from "@tanstack/charts/react"
import { tooltip } from "@tanstack/charts/tooltip"

import { ChartCard } from "@/components/chart-card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { SOURCES } from "@/data/sources"
import {
  cumulativeByKind,
  dailyByKind,
  MERGE_KINDS,
  MERGE_KIND_LABEL,
  timelineSummary,
  type MergeKind,
} from "@/lib/timeline"

/** Fixed paint per kind so colors don't shift when kinds are toggled off. */
const KIND_COLOR: Record<MergeKind, string> = {
  demo: "var(--ts-chart-1)",
  update: "var(--ts-chart-3)",
  fix: "var(--ts-chart-2)",
  infra: "var(--ts-chart-4)",
}

const VIEW_LABEL: Record<"daily" | "cumulative", string> = {
  daily: "Per day",
  cumulative: "Cumulative",
}

/** "2026-09-24" -> "09-24" */
function mmdd(day: string): string {
  return day.slice(5)
}

export function TimelineChart({ className }: { className?: string }) {
  const [view, setView] = useState<"daily" | "cumulative">("daily")
  const [kinds, setKinds] = useState<MergeKind[]>(() => [...MERGE_KINDS])

  const summary = timelineSummary()

  const definition = useMemo(() => {
    const selectedKinds = MERGE_KINDS.filter((kind) => kinds.includes(kind))
    const colorScale = scaleOrdinal<string, string>()
      .domain(selectedKinds.map((kind) => MERGE_KIND_LABEL[kind]))
      .range(selectedKinds.map((kind) => KIND_COLOR[kind]))

    const viewName = VIEW_LABEL[view]

    if (view === "daily") {
      const rows = dailyByKind(kinds).map((row) => ({
        ...row,
        kindLabel: MERGE_KIND_LABEL[row.kind],
      }))

      return defineChart({
        marks: [
          barY(rows, {
            x: "label",
            y: "count",
            color: "kindLabel",
            radius: 3,
            inset: 1,
          }),
        ],
        scales: {
          x: {
            scale: () => scaleBand<string>().padding(0.25),
            axis: {
              label: "Day (Asia/Shanghai)",
              tickLabels: { rotate: -45 },
            },
          },
          y: {
            scale: scaleLinear,
            nice: true,
            grid: true,
            axis: {
              label: "Merged PRs",
              ticks: {
                format: (value) =>
                  Number.isInteger(value) ? String(value) : "",
              },
            },
          },
        },
        color: {
          scale: colorScale,
          legend: colorLegend({ placement: "bottom" }),
        },
        focus: "group-x",
        svgAnimation: true,
        tooltip: {
          use: tooltip,
          formatGroup: (points) => {
            const label = points[0]?.datum.label ?? ""
            return [
              `${label} · ${viewName}`,
              ...points.map((point) => `${point.datum.kindLabel}: ${point.datum.count}`),
            ].join("\n")
          },
        },
      })
    }

    const rows = cumulativeByKind(kinds).map((row) => ({
      ...row,
      kindLabel: MERGE_KIND_LABEL[row.kind],
    }))

    return defineChart({
      marks: [
        lineY(rows, {
          x: "label",
          y: "total",
          z: "kindLabel",
          color: "kindLabel",
          points: true,
          strokeWidth: 2,
        }),
      ],
      scales: {
        x: {
          scale: () => scalePoint<string>().padding(0.3),
          axis: {
            label: "Day (Asia/Shanghai)",
            tickLabels: { rotate: -45 },
          },
        },
        y: {
          scale: scaleLinear,
          nice: true,
          grid: true,
          axis: {
            label: "Merged PRs (running total)",
          },
        },
      },
      color: {
        scale: colorScale,
        legend: colorLegend({ placement: "bottom" }),
      },
      focus: "group-x",
      svgAnimation: true,
      tooltip: {
        use: tooltip,
        formatGroup: (points) => {
          const label = points[0]?.datum.label ?? ""
          return [
            `${label} · ${viewName}`,
            ...points.map((point) => `${point.datum.kindLabel}: ${point.datum.total}`),
          ].join("\n")
        },
      },
    })
  }, [view, kinds])

  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={view}
        onValueChange={(value) => {
          if (value === "daily" || value === "cumulative") setView(value)
        }}
        data-testid="timeline-view-toggle"
      >
        <ToggleGroupItem value="daily" aria-label="Per day">
          Per day
        </ToggleGroupItem>
        <ToggleGroupItem value="cumulative" aria-label="Cumulative">
          Cumulative
        </ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup
        type="multiple"
        variant="outline"
        size="sm"
        value={kinds}
        onValueChange={(next) => {
          if (next.length === 0) return
          setKinds(MERGE_KINDS.filter((kind) => next.includes(kind)))
        }}
        data-testid="timeline-kind-toggle"
      >
        {MERGE_KINDS.map((kind) => (
          <ToggleGroupItem
            key={kind}
            value={kind}
            aria-label={`Show ${MERGE_KIND_LABEL[kind]}`}
            className="gap-1.5"
          >
            <span
              className="size-2 rounded-full"
              style={{ background: KIND_COLOR[kind] }}
            />
            {MERGE_KIND_LABEL[kind]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )

  const description = `${summary.merged} PRs merged into main from ${mmdd(
    summary.firstDay,
  )} to ${mmdd(summary.lastDay)} (${summary.days} days), ${
    summary.demos
  } of them new demos.`

  const footer = `Busiest day: ${mmdd(summary.busiestDay.day)} with ${
    summary.busiestDay.count
  } merges. Click a legend chip above to hide a kind.`

  return (
    <ChartCard
      id="timeline"
      title="xbm gallery timeline"
      description={description}
      source={SOURCES.xbm}
      actions={controls}
      footer={footer}
      className={className}
    >
      <div data-testid="chart-timeline">
        <Chart
          definition={definition}
          height={300}
          ariaLabel="Merged pull requests per day on yishan/xbm"
          ariaDescription="Stacked bars of merged pull requests per calendar day, or a cumulative running total line chart, split by merge kind (new demo, demo update, fix, infra). Use the view toggle to switch between per-day and cumulative, and the kind chips to show or hide kinds."
        />
      </div>
    </ChartCard>
  )
}
