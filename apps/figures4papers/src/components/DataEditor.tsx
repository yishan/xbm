import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  LINE_SERIES,
  METRIC_KEYS,
  METRIC_LABELS,
  type ChartKind,
  type LinePoint,
  type LineSeriesKey,
  type MetricKey,
  type MetricRow,
} from "@/data/sample"

type Props = {
  kind: ChartKind
  metrics: MetricRow[]
  lineData: LinePoint[]
  activeMetric: MetricKey
  onActiveMetricChange: (key: MetricKey) => void
  onMetricChange: (rowIndex: number, key: MetricKey | "method", value: string) => void
  onLineChange: (rowIndex: number, key: "epoch" | LineSeriesKey, value: string) => void
}

export function DataEditor({
  kind,
  metrics,
  lineData,
  activeMetric,
  onActiveMetricChange,
  onMetricChange,
  onLineChange,
}: Props) {
  if (kind === "line") {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">Training curve data</Label>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[420px] text-sm">
            <thead className="bg-muted/60 text-left">
              <tr>
                <th className="px-2 py-2 font-medium">Epoch</th>
                {LINE_SERIES.map((s) => (
                  <th key={s} className="px-2 py-2 font-medium">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineData.map((row, i) => (
                <tr key={i} className="border-t">
                  <td className="p-1">
                    <Input
                      type="number"
                      className="h-8"
                      value={row.epoch}
                      onChange={(e) => onLineChange(i, "epoch", e.target.value)}
                    />
                  </td>
                  {LINE_SERIES.map((s) => (
                    <td key={s} className="p-1">
                      <Input
                        type="number"
                        step="0.1"
                        className="h-8"
                        value={row[s]}
                        onChange={(e) => onLineChange(i, s, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {kind === "bar" && (
        <div className="space-y-1.5">
          <Label htmlFor="metric-select">Bar metric</Label>
          <select
            id="metric-select"
            className="border-input bg-background h-8 w-full rounded-lg border px-2 text-sm"
            value={activeMetric}
            onChange={(e) => onActiveMetricChange(e.target.value as MetricKey)}
          >
            {METRIC_KEYS.map((key) => (
              <option key={key} value={key}>
                {METRIC_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      )}
      <Label className="text-sm font-medium">Method metrics</Label>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-2 py-2 font-medium">Method</th>
              {METRIC_KEYS.map((key) => (
                <th key={key} className="px-2 py-2 font-medium">
                  {METRIC_LABELS[key]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((row, i) => (
              <tr key={i} className="border-t">
                <td className="p-1">
                  <Input
                    className="h-8"
                    value={row.method}
                    onChange={(e) => onMetricChange(i, "method", e.target.value)}
                  />
                </td>
                {METRIC_KEYS.map((key) => (
                  <td key={key} className="p-1">
                    <Input
                      type="number"
                      step="0.1"
                      className="h-8"
                      value={row[key]}
                      onChange={(e) => onMetricChange(i, key, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
