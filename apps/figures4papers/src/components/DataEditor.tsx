import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  SERIES_KEYS,
  USAGE_METER,
  formatCell,
  type AbRow,
  type ChartKind,
} from "@/data/jev"

type Props = {
  kind: ChartKind
  rows: AbRow[]
  onRowChange: (
    rowIndex: number,
    key: "metric" | "short" | "without" | "with",
    value: string,
  ) => void
}

export function DataEditor({ kind, rows, onRowChange }: Props) {
  if (kind === "line") {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Weekly usage meter (read-only defaults)
        </Label>
        <p className="text-muted-foreground text-xs">
          37% → 38% → 39%. Does not prove token savings; includes chat overhead.
        </p>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left">
              <tr>
                <th className="px-2 py-2 font-medium">Phase</th>
                <th className="px-2 py-2 font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {USAGE_METER.map((row) => (
                <tr key={row.phase} className="border-t">
                  <td className="px-2 py-2">{row.phase}</td>
                  <td className="px-2 py-2">{row.percent}</td>
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
      <Label className="text-sm font-medium">
        Without / With Jev (editable; defaults match chatgpt_pack.json)
      </Label>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[420px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-2 py-2 font-medium">Metric</th>
              <th className="px-2 py-2 font-medium">{SERIES_KEYS.without}</th>
              <th className="px-2 py-2 font-medium">{SERIES_KEYS.with}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.metric} className="border-t">
                <td className="p-1 align-middle">
                  <Input
                    className="h-8 min-w-[140px]"
                    value={row.short}
                    title={row.metric}
                    onChange={(e) => onRowChange(i, "short", e.target.value)}
                  />
                </td>
                <td className="p-1">
                  <Input
                    type="number"
                    step="any"
                    className="h-8"
                    value={row.without}
                    onChange={(e) => onRowChange(i, "without", e.target.value)}
                  />
                </td>
                <td className="p-1">
                  <Input
                    type="number"
                    step="any"
                    className="h-8"
                    value={
                      row.unit === "$" && row.with !== 0
                        ? formatCell(row.with, "$")
                        : row.with
                    }
                    onChange={(e) => onRowChange(i, "with", e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {kind === "radar" && (
        <p className="text-muted-foreground text-xs">
          Radar uses overlapping count metrics only (excludes wall time, $,
          tokens).
        </p>
      )}
      {kind === "bar" && (
        <p className="text-muted-foreground text-xs">
          Bar chart omits tiny $ / token rows so count and time scales stay
          readable; full values remain in the table.
        </p>
      )}
    </div>
  )
}
