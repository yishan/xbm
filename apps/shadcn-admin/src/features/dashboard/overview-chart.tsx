// Showcase inspired by satnaing/shadcn-admin (MIT). https://github.com/satnaing/shadcn-admin
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

const data = [
  { month: "Jan", total: 2400 },
  { month: "Feb", total: 1890 },
  { month: "Mar", total: 3200 },
  { month: "Apr", total: 2780 },
  { month: "May", total: 3890 },
  { month: "Jun", total: 3450 },
  { month: "Jul", total: 4100 },
  { month: "Aug", total: 3620 },
  { month: "Sep", total: 4780 },
  { month: "Oct", total: 5210 },
  { month: "Nov", total: 4890 },
  { month: "Dec", total: 5730 },
]

const chartConfig = {
  total: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function OverviewChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="h-[300px] w-full"
      data-testid="overview-chart"
    >
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v: number) => `$${v / 1000}k`}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="total" fill="var(--color-total)" radius={6} />
      </BarChart>
    </ChartContainer>
  )
}
