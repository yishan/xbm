import { barY, colorLegend, defineChart, text } from "@tanstack/charts"
import { scaleBand } from "@tanstack/charts/scales/band"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { scaleOrdinal } from "@tanstack/charts/scales/ordinal"
import { tooltip } from "@tanstack/charts/tooltip"
import { Chart } from "@tanstack/charts/react"

import { ChartCard } from "@/components/chart-card"
import { JEV_COMPLIANCE, JEV_COST_PER_ITEM_USD, SOURCES } from "@/data/sources"

type Segment = {
  label: string
  part: "Followed" | "Not followed"
  runs: number
}

// 100% stacked vertical bars: two segments per compliance row.
const SEGMENTS: Segment[] = JEV_COMPLIANCE.flatMap((row) => [
  { label: row.label, part: "Followed" as const, runs: row.followed },
  { label: row.label, part: "Not followed" as const, runs: row.total - row.followed },
])

const definition = defineChart({
  marks: [
    barY(SEGMENTS, {
      x: "label",
      y: "runs",
      color: "part",
      radius: 3,
      inset: 2,
      maxThickness: 72,
    }),
    text(JEV_COMPLIANCE, {
      x: "label",
      y: "followed",
      text: (d) => `${d.followed}/${d.total}`,
      dy: -12,
      fontSize: 13,
      fontWeight: 600,
    }),
  ],
  scales: {
    x: { scale: () => scaleBand<string>().padding(0.35) },
    y: {
      scale: scaleLinear().domain([0, 24]),
      grid: true,
      axis: { label: "Runs (out of 24)", ticks: { values: [0, 6, 12, 18, 24] } },
    },
  },
  color: {
    scale: scaleOrdinal<string, string>()
      .domain(["Followed", "Not followed"])
      .range(["var(--ts-chart-3)", "var(--ts-chart-6)"]),
    legend: colorLegend({ placement: "bottom" }),
  },
  focus: "group-x",
  tooltip: {
    use: tooltip,
    formatGroup: (points) => {
      const label = points[0]?.datum.label ?? ""
      const row = JEV_COMPLIANCE.find((r) => r.label === label)
      const followed = row?.followed ?? 0
      const total = row?.total ?? 0
      const rate = total > 0 ? Math.round((followed / total) * 100) : 0
      return [
        label,
        `Followed: ${followed}`,
        `Not followed: ${total - followed}`,
        `Rate: ${rate}%`,
      ].join("\n")
    },
  },
})

export function JevComplianceChart({ className }: { className?: string }) {
  return (
    <div data-testid="chart-jev-compliance" className={className}>
      <ChartCard
        title="Jev: writing the rule into the prompt"
        description="With the internal rule in the prompt Jev followed it in 24 of 24 runs; without it, 5 of 24."
        source={SOURCES.jev}
        footer={`Moderation cost in the same article: about $${JEV_COST_PER_ITEM_USD.toFixed(5)} per item.`}
      >
        <Chart
          definition={definition}
          height={240}
          ariaLabel="Jev rule compliance with and without the rule in the prompt"
        />
      </ChartCard>
    </div>
  )
}
