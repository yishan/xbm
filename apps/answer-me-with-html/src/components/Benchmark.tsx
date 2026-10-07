import { BENCH_URL } from '@/data/pages'

const ROWS = [
  { metric: '输出 token', direct: '5,341', skill: '870', diff: '少 6.1×' },
  { metric: '耗时', direct: '33 s', skill: '12 s', diff: '快 2.8×' },
  { metric: '每次成本', direct: '$0.092', skill: '$0.067', diff: '便宜 27%' },
]

// 只有前两行有可比数值，用条形展示比例（宽度 = 较小值 / 较大值）
const BARS = [
  {
    metric: '输出 token',
    directLabel: '直接要 HTML 5,341',
    directValue: 5341,
    skillLabel: 'Answer me with HTML 870',
    skillValue: 870,
  },
  {
    metric: '耗时',
    directLabel: '直接要 HTML 33 s',
    directValue: 33,
    skillLabel: 'Answer me with HTML 12 s',
    skillValue: 12,
  },
]

const formatPct = (value: number) =>
  `${Number.isInteger(value) ? value : value.toFixed(1)}%`

function BenchBar({
  label,
  pct,
  highlight = false,
}: {
  label: string
  pct: number
  highlight?: boolean
}) {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-xs text-muted-foreground">
        <span className="min-w-0 break-words">{label}</span>
        <span className="tabular-nums">{formatPct(pct)}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={
            highlight
              ? 'h-full rounded-full bg-primary'
              : 'h-full rounded-full bg-muted-foreground/40'
          }
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function Benchmark() {
  return (
    <section className="rounded-xl border bg-card p-4 sm:p-6">
      <h2 className="text-base font-semibold text-foreground sm:text-lg">
        上游基准：直接要 HTML vs 用 Answer me with HTML
      </h2>
      <p className="mt-1 text-xs break-words text-muted-foreground">
        Claude Sonnet 5.5，3 个题目 × 3 次运行，取中位数；数据引自上游 README，非本站测得。
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[22rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-2 pr-3 font-medium">指标</th>
              <th className="py-2 pr-3 font-medium">直接要 HTML</th>
              <th className="py-2 pr-3 font-medium">Answer me with HTML</th>
              <th className="py-2 font-medium">差异</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.metric} className="border-b border-border/60 last:border-0">
                <td className="py-2 pr-3 text-muted-foreground">{row.metric}</td>
                <td className="py-2 pr-3 whitespace-nowrap tabular-nums">{row.direct}</td>
                <td className="py-2 pr-3 font-semibold whitespace-nowrap text-primary tabular-nums">
                  {row.skill}
                </td>
                <td className="py-2 whitespace-nowrap tabular-nums">{row.diff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 space-y-4">
        {BARS.map((bar) => (
          <div key={bar.metric} className="min-w-0">
            <div className="text-xs font-medium text-foreground">{bar.metric}</div>
            <div className="mt-2 space-y-2">
              <BenchBar
                label={bar.directLabel}
                pct={(bar.directValue / bar.directValue) * 100}
              />
              <BenchBar
                label={bar.skillLabel}
                pct={(bar.skillValue / bar.directValue) * 100}
                highlight
              />
            </div>
          </div>
        ))}
      </div>

      <a
        href={BENCH_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-block text-sm text-primary underline-offset-4 hover:underline"
      >
        查看上游 README 原文 →
      </a>
    </section>
  )
}
