import {
  barY,
  colorLegend,
  defineChart,
  ruleY,
  text,
} from "@tanstack/charts"
import { scaleBand } from "@tanstack/charts/scales/band"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { scaleOrdinal } from "@tanstack/charts/scales/ordinal"
import { tooltip } from "@tanstack/charts/tooltip"
import { Chart } from "@tanstack/charts/react"

import { ChartCard } from "@/components/chart-card"
import { PLAN_VALUE, SOURCES } from "@/data/sources"

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const rows = PLAN_VALUE.map((row) => ({
  ...row,
  axisLabel: row.plan,
}))

const definition = defineChart({
  marks: [
    barY(rows, {
      x: "axisLabel",
      y: "usedUsd",
      color: "provider",
      radius: { end: 4 },
      inset: 2,
      maxThickness: 120,
    }),
    ruleY([200], {
      stroke: "currentColor",
      strokeOpacity: 0.55,
      strokeDasharray: "4 4",
    }),
    text(rows, {
      x: "axisLabel",
      y: "usedUsd",
      text: (d) => usd.format(d.usedUsd),
      dy: -12,
      fontSize: 13,
      fontWeight: 600,
    }),
    text(rows, {
      x: "axisLabel",
      y: "usedUsd",
      text: "model",
      dy: 18,
      fill: "white",
      fontSize: 12,
      fontWeight: 600,
    }),
    text(rows, {
      x: "axisLabel",
      y: "usedUsd",
      text: "quotaNote",
      dy: 34,
      fill: "white",
      fontSize: 10.5,
    }),
  ],
  scales: {
    x: { scale: () => scaleBand<string>().padding(0.2) },
    y: {
      scale: scaleLinear().domain([0, 3200]),
      grid: true,
      axis: {
        label: "API-equivalent value used (USD)",
        ticks: { format: (v) => usd.format(v) },
      },
    },
  },
  color: {
    scale: scaleOrdinal<string, string>()
      .domain(["Anthropic", "OpenAI"])
      .range(["var(--ts-chart-2)", "var(--ts-chart-1)"]),
    legend: colorLegend({ placement: "bottom" }),
  },
  svgAnimation: true,
  tooltip: {
    use: tooltip,
    format: (point) =>
      [
        point.datum.plan,
        `${point.datum.model}: ${usd.format(point.datum.usedUsd)} of API value`,
        `Plan price: ${usd.format(point.datum.priceUsd)} (${(
          point.datum.usedUsd / point.datum.priceUsd
        ).toFixed(1)}× the price)`,
        point.datum.quotaNote,
      ].join("\n"),
  },
})

export function PlanValueChart({ className }: { className?: string }) {
  return (
    <div data-testid="chart-plan-value" className={className}>
      <ChartCard
        title="What a $200 plan buys at API prices"
        description="SemiAnalysis converted measured top-tier usage into API-equivalent value. The dashed line is the $200 plan price."
        source={SOURCES.semi}
        footer="Claude still had 50% of its quota left; OpenAI's quota was empty."
      >
        <Chart
          definition={definition}
          height={260}
          ariaLabel="API-equivalent value used on two $200 plans"
          ariaDescription="Bar chart comparing API-equivalent value used on two $200 subscription plans: $2,485 of Fable 5.1 usage with 50% of the quota left, and $2,897 of GPT-6 Astra usage with the quota used up, against a dashed $200 plan price line."
        />
      </ChartCard>
    </div>
  )
}
