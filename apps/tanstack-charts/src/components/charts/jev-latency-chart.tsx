import { barX, defineChart, text } from "@tanstack/charts"
import { scaleBand } from "@tanstack/charts/scales/band"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { Chart } from "@tanstack/charts/react"
import { tooltip } from "@tanstack/charts/tooltip"

import { ChartCard } from "@/components/chart-card"
import { JEV_LATENCY, SOURCES } from "@/data/sources"

const jevLatencyDefinition = defineChart({
  marks: [
    barX(JEV_LATENCY, {
      x: "ms",
      y: "label",
      fill: "var(--ts-chart-1)",
      radius: { end: 4 },
      inset: 4,
      maxThickness: 44,
    }),
    text(JEV_LATENCY, {
      x: "ms",
      y: "label",
      text: (d) => `${d.ms} ms`,
      anchor: "end",
      dx: -8,
      fill: "white",
      fontSize: 12,
      fontWeight: 600,
    }),
  ],
  scales: {
    x: {
      scale: scaleLinear().domain([0, 700]),
      grid: true,
      axis: { label: "Latency for the whole call (ms)" },
    },
    y: {
      scale: () => scaleBand<string>().padding(0.3),
      axis: { tickLabels: { fontSize: 12 } },
    },
  },
  svgAnimation: true,
  tooltip: {
    use: tooltip,
    format: (point) =>
      point.datum.questions > 1
        ? `${point.datum.label} in one call: ${point.datum.ms} ms (≈ ${(
            point.datum.ms / point.datum.questions
          ).toFixed(1)} ms per question, derived)`
        : `${point.datum.label} in one call: ${point.datum.ms} ms`,
  },
})

export function JevLatencyChart({ className }: { className?: string }) {
  return (
    <div data-testid="chart-jev-latency" className={className}>
      <ChartCard
        title="Jev: 32 questions cost no extra latency"
        description="One call with 32 parallel questions returned in 566 ms, slightly faster than one question (603 ms)."
        source={SOURCES.jev}
        footer="Per-question time is derived: 566 ms ÷ 32 ≈ 17.7 ms."
      >
        <Chart
          definition={jevLatencyDefinition}
          height={200}
          ariaLabel="Jev latency for 1 vs 32 questions"
        />
      </ChartCard>
    </div>
  )
}
