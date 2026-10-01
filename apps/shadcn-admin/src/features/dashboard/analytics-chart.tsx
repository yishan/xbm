// Showcase inspired by satnaing/shadcn-admin (MIT). https://github.com/satnaing/shadcn-admin
import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

// Deterministic (sin/cos based) daily visitor data for the last 30 days.
const visitorsData = Array.from({ length: 30 }, (_, index) => {
  const day = String(index + 1).padStart(2, "0")
  const wave = Math.sin((index / 29) * Math.PI * 2)
  const desktopRipple = Math.cos(index / 2.5)
  const mobileRipple = Math.sin(index / 1.9)

  return {
    date: `Sep ${day}`,
    desktop: Math.round(280 + wave * 90 + desktopRipple * 60 + index * 1.5),
    mobile: Math.round(250 - wave * 60 + mobileRipple * 70 + index * 2),
  }
})

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

type StackMode = "stacked" | "expanded"

export function AnalyticsChart() {
  const [mode, setMode] = useState<StackMode>("stacked")

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="grid gap-1">
          <CardTitle>Visitors</CardTitle>
          <CardDescription>Last 30 days · desktop vs mobile</CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant={mode === "stacked" ? "secondary" : "outline"}
            aria-pressed={mode === "stacked"}
            onClick={() => setMode("stacked")}
            data-testid="analytics-chart-stacked"
          >
            Stacked
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "expanded" ? "secondary" : "outline"}
            aria-pressed={mode === "expanded"}
            onClick={() => setMode("expanded")}
            data-testid="analytics-chart-expanded"
          >
            Expanded
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="h-[280px] w-full"
          config={chartConfig}
          data-testid="analytics-chart"
        >
          <AreaChart
            accessibilityLayer
            data={visitorsData}
            margin={{ left: 4, right: 4, top: 8 }}
            stackOffset={mode === "expanded" ? "expand" : undefined}
          >
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="mobile"
              type="natural"
              stackId="a"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              strokeWidth={2}
            />
            <Area
              dataKey="desktop"
              type="natural"
              stackId="a"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
