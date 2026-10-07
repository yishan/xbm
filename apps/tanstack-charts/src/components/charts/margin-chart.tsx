import { useMemo, useState } from "react"
import {
  barY,
  colorLegend,
  defineChart,
  group,
  ruleY,
  text,
} from "@tanstack/charts"
import { Chart } from "@tanstack/charts/react"
import { scaleBand } from "@tanstack/charts/scales/band"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { scaleOrdinal } from "@tanstack/charts/scales/ordinal"
import { tooltip } from "@tanstack/charts/tooltip"

import { ChartCard } from "@/components/chart-card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { MARGINS, SOURCES } from "@/data/sources"
import { cn } from "@/lib/utils"

type Utilization = "100%" | "20%"
type UtilFilter = "both" | Utilization

const MODELS: readonly ("Opus 5.5" | "Fable 5.1")[] = ["Opus 5.5", "Fable 5.1"]
const UTILIZATIONS: readonly Utilization[] = ["100%", "20%"]
const UTIL_LABEL: Record<Utilization, string> = {
  "100%": "100% utilization",
  "20%": "20% utilization",
}

/** All four quoted numbers for the table, taken straight from MARGINS. */
function tableCell(model: (typeof MODELS)[number], utilization: Utilization) {
  const row = MARGINS.find(
    (m) => m.model === model && m.utilization === utilization,
  )
  return {
    text: row ? `${row.approx ? "~" : ""}${row.marginPct}%` : "—",
    negative: row ? row.marginPct < 0 : false,
  }
}

const TABLE_ROWS = MODELS.map((model) => ({
  model,
  cells: UTILIZATIONS.map((utilization) => tableCell(model, utilization)),
}))

export function MarginChart({ className }: { className?: string }) {
  const [util, setUtil] = useState<UtilFilter>("both")

  const rows = useMemo(
    () =>
      MARGINS.filter((r) => util === "both" || r.utilization === util).map(
        (r) => ({
          ...r,
          utilLabel: UTIL_LABEL[r.utilization],
        }),
      ),
    [util],
  )

  const definition = useMemo(() => {
    // Both utilization groups are still on screen -> labels need an x offset
    // because the text mark has no group layout of its own.
    const showBoth = new Set(rows.map((r) => r.utilization)).size > 1

    return defineChart({
      marks: [
        barY(rows, {
          x: "model",
          y: "marginPct",
          color: "utilLabel",
          layout: group({ padding: 0.12 }),
          radius: { end: 4 },
          inset: 2,
        }),
        ruleY([0], { stroke: "currentColor", strokeOpacity: 0.6 }),
        text(rows, {
          x: "model",
          y: "marginPct",
          text: (d) => `${d.approx ? "~" : ""}${d.marginPct}%`,
          dy: (d) => (d.marginPct < 0 ? 12 : -10),
          dx: (d) => (showBoth ? (d.utilization === "100%" ? -22 : 22) : 0),
          fontSize: 12,
          fontWeight: 600,
        }),
      ],
      scales: {
        x: {
          scale: () => scaleBand<string>().domain(MODELS).padding(0.3),
        },
        y: {
          scale: scaleLinear().domain([-450, 120]),
          grid: true,
          axis: {
            label: "Gross margin (%)",
            ticks: { format: (v) => `${v}%` },
          },
        },
      },
      color: {
        scale: scaleOrdinal<string, string>()
          .domain(["100% utilization", "20% utilization"])
          .range(["var(--ts-chart-5)", "var(--ts-chart-3)"]),
        legend: colorLegend({ placement: "bottom" }),
      },
      svgAnimation: true,
      focus: "group-x",
      tooltip: {
        use: tooltip,
        formatGroup: (points) =>
          [
            String(points[0]?.datum.model ?? ""),
            ...points.map(
              (p) =>
                `${p.datum.utilLabel}: ${p.datum.approx ? "~" : ""}${p.datum.marginPct}%`,
            ),
          ].join("\n"),
      },
    })
  }, [rows])

  return (
    <div data-testid="chart-margin" className={className}>
      <ChartCard
        id="margin"
        title="Subscription margin by model"
        description="Heavier use of the pricier model turns the subscription deeply unprofitable; at 20% use both models are profitable."
        source={SOURCES.semi}
        actions={
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={util}
            onValueChange={(value: string) => {
              if (value === "both" || value === "100%" || value === "20%") {
                setUtil(value)
              }
            }}
            className="flex-wrap"
            data-testid="margin-util-toggle"
          >
            <ToggleGroupItem value="both">Both</ToggleGroupItem>
            <ToggleGroupItem value="100%">100% use</ToggleGroupItem>
            <ToggleGroupItem value="20%">20% use</ToggleGroupItem>
          </ToggleGroup>
        }
      >
        <Chart
          definition={definition}
          height={280}
          ariaLabel="Subscription gross margin by model and utilization"
          ariaDescription="Grouped bars of subscription gross margin for Opus 5.5 and Fable 5.1 at 100% and 20% utilization. Opus 5.5 is deeply negative at full use, while all other combinations are small and positive."
        />

        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead className="text-right">100% utilization</TableHead>
              <TableHead className="text-right">20% utilization</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TABLE_ROWS.map((row) => (
              <TableRow key={row.model}>
                <TableCell className="font-medium">{row.model}</TableCell>
                {row.cells.map((cell, i) => (
                  <TableCell
                    key={UTILIZATIONS[i]}
                    className={cn(
                      "text-right tabular-nums",
                      cell.negative && "text-destructive",
                    )}
                  >
                    {cell.text}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableCaption>
            Subscription gross margin at full and 20% use, as quoted from
            SemiAnalysis.
          </TableCaption>
        </Table>
      </ChartCard>
    </div>
  )
}
