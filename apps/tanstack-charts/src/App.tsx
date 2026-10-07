import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { StatsStrip } from "@/components/stats-strip"
import { TimelineChart } from "@/components/charts/timeline-chart"
import { JevLatencyChart } from "@/components/charts/jev-latency-chart"
import { JevComplianceChart } from "@/components/charts/jev-compliance-chart"
import { PlanValueChart } from "@/components/charts/plan-value-chart"
import { MarginChart } from "@/components/charts/margin-chart"

export function App() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            One dashboard, five TanStack Charts
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            TanStack Charts 1.0 is a TypeScript chart library on D3 primitives with SVG output,
            keyboard focus and built-in tooltips. Every chart below uses real numbers: the xbm demo
            gallery&apos;s own merge history and two articles about AI agent cost. Hover or focus a
            chart to see exact values.
          </p>
        </section>

        <StatsStrip />

        <section className="grid gap-6 lg:grid-cols-2">
          <TimelineChart className="lg:col-span-2" />
          <JevLatencyChart />
          <JevComplianceChart />
          <PlanValueChart />
          <MarginChart />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
