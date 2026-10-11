import { useEffect, useState } from "react"
import { ArrowDownRight, ArrowUpRight, BarChart3, LineChart } from "lucide-react"
import type { MetricChartProps } from "./types"
import { cn } from "@/lib/utils"

export function MetricChart({ title, unit, series, deltaPct }: MetricChartProps) {
  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState<"bar" | "line">("bar")
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const n = series.length
  const max = Math.max(...series.map((d) => d.value), 1)
  const up = deltaPct >= 0

  const points = series
    .map((d, i) => {
      const x = n > 1 ? (i / (n - 1)) * 100 : 50
      const y = 100 - (d.value / max) * 100
      return `${x},${y}`
    })
    .join(" ")

  const dotX = (i: number) => (n > 1 ? (i / (n - 1)) * 100 : 50)
  const dotY = (d: { value: number }) => 100 - (d.value / max) * 100

  return (
    <div className="w-full rounded-xl border border-neutral-200 bg-white p-4 text-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-sm font-medium text-neutral-900">{title}</h3>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
              up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600",
            )}
          >
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {up ? "+" : "-"}
            {Math.abs(deltaPct)}%
          </span>
        </div>
        <button
          type="button"
          data-testid="chart-mode"
          onClick={() => setMode((m) => (m === "bar" ? "line" : "bar"))}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-600 transition-colors hover:bg-neutral-50"
        >
          {mode === "bar" ? <BarChart3 className="h-3.5 w-3.5" /> : <LineChart className="h-3.5 w-3.5" />}
          {mode === "bar" ? "柱状图" : "折线图"}
        </button>
      </div>

      <div className="h-40 w-full">
        {mode === "bar" ? (
          <div className="flex h-full w-full items-end gap-1.5">
            {series.map((d, i) => (
              <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col items-center gap-1.5">
                <div className="relative flex w-full flex-1 items-end justify-center">
                  <div
                    className="relative w-full max-w-[44px] transition-[height] duration-700 ease-out"
                    style={{ height: `${mounted ? (d.value / max) * 100 : 0}%` }}
                  >
                    <button
                      type="button"
                      data-testid={`metric-bar-${i}`}
                      aria-label={`${d.label} ${d.value}${unit}`}
                      onMouseEnter={() => setActive(i)}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(i)}
                      onBlur={() => setActive(null)}
                      className={cn(
                        "h-full w-full rounded-t-md bg-neutral-800 transition-colors",
                        active === i && "bg-neutral-900",
                      )}
                    />
                    {active === i && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-[10px] font-medium text-white shadow-sm">
                        {d.value}
                        {unit}
                      </div>
                    )}
                  </div>
                </div>
                <span className="w-full truncate text-center text-[10px] text-neutral-500">{d.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full w-full px-1.5 py-1.5">
            <div className="relative h-full w-full">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className={cn("h-full w-full transition-opacity duration-700", mounted ? "opacity-100" : "opacity-0")}
              >
                <polyline
                  points={points}
                  fill="none"
                  stroke="#262626"
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {series.map((d, i) => (
                <div key={d.label} className="absolute" style={{ left: `${dotX(i)}%`, top: `${dotY(d)}%` }}>
                  <button
                    type="button"
                    data-testid={`metric-point-${i}`}
                    aria-label={`${d.label} ${d.value}${unit}`}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    className={cn(
                      "h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white transition-colors",
                      active === i ? "border-neutral-900" : "border-neutral-700",
                    )}
                  />
                  {active === i && (
                    <div className="pointer-events-none absolute bottom-1 left-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-[10px] font-medium text-white shadow-sm">
                      {d.value}
                      {unit}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
