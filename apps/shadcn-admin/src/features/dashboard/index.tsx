// Showcase inspired by satnaing/shadcn-admin (MIT). https://github.com/satnaing/shadcn-admin
import { Activity, CreditCard, DollarSign, Download, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsChart } from "./analytics-chart"
import { OverviewChart } from "./overview-chart"
import { RecentSales } from "./recent-sales"

type Kpi = {
  label: string
  value: string
  delta: string
  icon: LucideIcon
}

const kpis: Kpi[] = [
  {
    label: "Total Revenue",
    value: "$45,231.89",
    delta: "+20.1% from last month",
    icon: DollarSign,
  },
  {
    label: "Subscriptions",
    value: "+2,350",
    delta: "+180.1% from last month",
    icon: Users,
  },
  {
    label: "Sales",
    value: "+12,234",
    delta: "+19% from last month",
    icon: CreditCard,
  },
  {
    label: "Active Now",
    value: "+573",
    delta: "+201 since last hour",
    icon: Activity,
  },
]

const topPages = [
  { path: "/", visits: 12840 },
  { path: "/pricing", visits: 8321 },
  { path: "/docs", visits: 5190 },
  { path: "/blog", visits: 3642 },
  { path: "/changelog", visits: 1875 },
]

const maxVisits = Math.max(...topPages.map((page) => page.visits))

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Showcase of the shadcn-admin layout — sample data only.
          </p>
        </div>
        <Button
          className="w-full sm:w-auto"
          data-testid="download-btn"
          onClick={() => toast.success("Report queued (demo)")}
        >
          <Download />
          Download
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports" disabled>
              Reports
            </TabsTrigger>
            <TabsTrigger value="notifications" disabled>
              Notifications
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon
              return (
                <Card key={kpi.label} data-testid="kpi-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {kpi.label}
                    </CardTitle>
                    <Icon className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold tabular-nums">
                      {kpi.value}
                    </div>
                    <p className="text-xs text-muted-foreground">{kpi.delta}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Monthly revenue, 2026</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <OverviewChart />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  You made 265 sales this month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AnalyticsChart />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Top pages</CardTitle>
                <CardDescription>Most visited paths this month.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topPages.map((page) => (
                  <div key={page.path} className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-medium">{page.path}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {page.visits.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={Math.round((page.visits / maxVisits) * 100)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
