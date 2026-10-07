import type { JSX, ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Source } from "@/data/sources"
import { cn } from "@/lib/utils"

export type ChartCardProps = {
  id?: string
  title: string
  description?: string
  source: Source
  exampleData?: boolean
  actions?: ReactNode
  footer?: ReactNode
  className?: string
  children: ReactNode
}

export function ChartCard({
  id,
  title,
  description,
  source,
  exampleData = false,
  actions,
  footer,
  className,
  children,
}: ChartCardProps): JSX.Element {
  return (
    <Card id={id} className={cn("gap-3 overflow-hidden", className)}>
      <CardHeader className="@container">
        <div className="flex min-w-0 flex-col gap-3 @3xl:flex-row @3xl:items-start @3xl:justify-between">
          <div className="grid min-w-0 gap-1">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base font-semibold">
              <span>{title}</span>
              {exampleData ? <Badge variant="outline">Example data</Badge> : null}
            </CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {actions ? (
            <div className="flex min-w-0 max-w-full shrink-0 flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="ts-chart-card min-w-0">{children}</div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-1">
        {footer ? <div className="text-xs">{footer}</div> : null}
        <p className="text-xs text-muted-foreground">
          Source: {source.author} — “{source.title}” · {source.note}
        </p>
      </CardFooter>
    </Card>
  )
}
