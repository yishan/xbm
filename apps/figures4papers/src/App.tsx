import { useMemo, useRef, useState } from "react"
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
  FIVE_TASK_ROWS,
  FOOTNOTES,
  FIGURE_LABELS,
  FIGURE_ORDER,
  META,
  PAGE_SUBTITLE,
  PAGE_TITLE,
  TIMING_200K_ROWS,
  type AbRow,
  type ChartKind,
  type FigureId,
} from "@/data/jev"

function parseNumber(raw: string, fallback: number) {
  const n = Number(raw)
  return Number.isFinite(n) ? n : fallback
}

function cloneRows(rows: AbRow[]): AbRow[] {
  return rows.map((r) => ({ ...r }))
}

export default function App() {
  const [figure, setFigure] = useState<FigureId>("timing-200k")
  const [kind, setKind] = useState<ChartKind>("bar")
  const [timingRows, setTimingRows] = useState(() => cloneRows(TIMING_200K_ROWS))
  const [fiveTaskRows, setFiveTaskRows] = useState(() =>
    cloneRows(FIVE_TASK_ROWS),
  )
  const [exporting, setExporting] = useState(false)
  const figureRef = useRef<HTMLDivElement>(null)

  const rows = figure === "timing-200k" ? timingRows : fiveTaskRows
  const setRows =
    figure === "timing-200k" ? setTimingRows : setFiveTaskRows

  const nonChartNotes = useMemo(() => {
    return rows
      .filter((r) => !r.chartable)
      .map((r) => `${r.metric}: ${r.without} | ${r.with}`)
  }, [rows])

  function onRowChange(
    rowIndex: number,
    key: "metric" | "short" | "without" | "with",
    value: string,
  ) {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== rowIndex) return row
        if (key === "metric" || key === "short") return { ...row, [key]: value }
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
      link.download = `jev-ab-${figure}-${kind}.png`
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
          <h1 className="text-2xl font-semibold tracking-tight">{PAGE_TITLE}</h1>
          <p className="text-muted-foreground text-sm">{PAGE_SUBTITLE}</p>
          <p className="text-muted-foreground text-xs">
            Source: {META.sourceJson} · summary {META.sourceMd} · date{" "}
            {META.date}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
              <CardDescription>
                Main figure is 200k timing; secondary is five-task proxies.
                Export the white figure canvas as PNG.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-medium">Figure</p>
                <Tabs
                  value={figure}
                  onValueChange={(v) => setFigure(v as FigureId)}
                >
                  <TabsList className="grid h-auto w-full grid-cols-1 gap-1 sm:grid-cols-2">
                    {FIGURE_ORDER.map((id) => (
                      <TabsTrigger key={id} value={id} className="text-xs">
                        {FIGURE_LABELS[id]}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Chart type</p>
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
                <p className="text-muted-foreground text-xs">
                  Bar = grouped Without/With. Radar = count metrics. Line =
                  weekly usage meter (not savings proof).
                </p>
              </div>

              <DataEditor kind={kind} rows={rows} onRowChange={onRowChange} />

              {nonChartNotes.length > 0 && kind !== "line" && (
                <div className="rounded-lg border bg-muted/30 p-3 text-xs leading-relaxed">
                  <p className="mb-1 font-medium">Table-only values</p>
                  <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
                    {nonChartNotes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}

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

          <div className="space-y-4">
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
                  className="h-[520px] overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm"
                >
                  <FigureChart figure={figure} kind={kind} rows={rows} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Caveats & footnotes</CardTitle>
                <CardDescription>
                  Copied from chatgpt_pack.json / ab_results.md — do not omit
                  when sharing figures.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
                  {FOOTNOTES.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
