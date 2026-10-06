import type { JSX, ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
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
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base font-semibold">
          <span>{title}</span>
          {exampleData ? <Badge variant="outline">Example data</Badge> : null}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {actions ? (
          <CardAction className="col-start-1 row-start-3 max-w-full justify-self-start sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:justify-self-end">
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          </CardAction>
        ) : null}
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
