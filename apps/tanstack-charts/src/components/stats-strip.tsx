import { JEV_LATENCY, PLAN_VALUE } from "@/data/sources"
import { timelineSummary } from "@/lib/timeline"
import { cn } from "@/lib/utils"

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

export function StatsStrip({ className }: { className?: string }) {
  const summary = timelineSummary()

  const jev32 = JEV_LATENCY.find((row) => row.questions === 32)
  const jev1 = JEV_LATENCY.find((row) => row.questions === 1)

  const claude = PLAN_VALUE.find((row) => row.provider === "Anthropic")

  const stats: { label: string; value: string; hint: string }[] = [
    {
      label: "PRs merged into xbm",
      value: `${summary.merged}`,
      hint: `${summary.firstDay.slice(5)} → ${summary.lastDay.slice(5)}`,
    },
    {
      label: "New demos shipped",
      value: `${summary.demos}`,
      hint: `over ${summary.days} days`,
    },
    {
      label: "Jev, 32 questions",
      value: jev32 ? `${jev32.ms} ms` : "—",
      hint: jev32 && jev1 ? `vs ${jev1.ms} ms for 1 question` : "",
    },
    {
      label: "Claude $200 plan value",
      value: claude ? usd.format(claude.usedUsd) : "—",
      hint: claude ? `${(claude.usedUsd / claude.priceUsd).toFixed(1)}× the plan price` : "",
    },
  ]

  return (
    <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4", className)}>
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border bg-card p-4">
          <div className="text-xs text-muted-foreground">{stat.label}</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{stat.value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{stat.hint}</div>
        </div>
      ))}
    </div>
  )
}
