import { useRef, useState } from "react"
import { toPng } from "html-to-image"
import { Download } from "lucide-react"
import { DataEditor } from "@/components/DataEditor"
import { FigureChart } from "@/components/FigureChart"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DEFAULT_LINE,
  DEFAULT_METRICS,
  type ChartKind,
  type LinePoint,
  type LineSeriesKey,
  type MetricKey,
  type MetricRow,
} from "@/data/sample"

function parseNumber(raw: string, fallback: number) {
  const n = Number(raw)
  return Number.isFinite(n) ? n : fallback
}

export default function App() {
  const [kind, setKind] = useState<ChartKind>("bar")
  const [metrics, setMetrics] = useState<MetricRow[]>(DEFAULT_METRICS)
  const [lineData, setLineData] = useState<LinePoint[]>(DEFAULT_LINE)
  const [activeMetric, setActiveMetric] = useState<MetricKey>("accuracy")
  const [exporting, setExporting] = useState(false)
  const figureRef = useRef<HTMLDivElement>(null)

  function onMetricChange(
    rowIndex: number,
    key: MetricKey | "method",
    value: string,
  ) {
    setMetrics((prev) =>
      prev.map((row, i) => {
        if (i !== rowIndex) return row
        if (key === "method") return { ...row, method: value }
        return { ...row, [key]: parseNumber(value, row[key]) }
      }),
    )
  }

  function onLineChange(
    rowIndex: number,
    key: "epoch" | LineSeriesKey,
    value: string,
  ) {
    setLineData((prev) =>
      prev.map((row, i) => {
        if (i !== rowIndex) return row
        return { ...row, [key]: parseNumber(value, row[key]) }
      }),
    )
  }

  async function exportPng() {
    if (!figureRef.current) return
    setExporting(true)
    try {
      const dataUrl = await toPng(figureRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      })
      const link = document.createElement("a")
      link.download = `figure-${kind}.png`
      link.href = dataUrl
      link.click()
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-svh bg-muted/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6 md:p-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            figures4papers
          </h1>
          <p className="text-muted-foreground text-sm">
            Edit sample paper metrics and export publication-style charts as
            PNG. Inspired by{" "}
            <a
              className="underline underline-offset-2"
              href="https://github.com/ChenLiu-1996/figures4papers"
              target="_blank"
              rel="noreferrer"
            >
              ChenLiu-1996/figures4papers
            </a>
            .
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
              <CardDescription>
                Choose a chart type, edit the numbers, then export.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Tabs
                value={kind}
                onValueChange={(v) => setKind(v as ChartKind)}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="bar" className="flex-1">
                    Bar
                  </TabsTrigger>
                  <TabsTrigger value="radar" className="flex-1">
                    Radar
                  </TabsTrigger>
                  <TabsTrigger value="line" className="flex-1">
                    Line
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <DataEditor
                kind={kind}
                metrics={metrics}
                lineData={lineData}
                activeMetric={activeMetric}
                onActiveMetricChange={setActiveMetric}
                onMetricChange={onMetricChange}
                onLineChange={onLineChange}
              />

              <Button
                className="w-full"
                onClick={exportPng}
                disabled={exporting}
              >
                <Download data-icon="inline-start" />
                {exporting ? "Exporting…" : "Export PNG"}
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Paper-style figure canvas (white background).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                ref={figureRef}
                className="h-[480px] overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm"
              >
                <FigureChart
                  kind={kind}
                  metrics={metrics}
                  lineData={lineData}
                  activeMetric={activeMetric}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
