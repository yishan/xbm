import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type FleetPanelProps = {
  title: string
  subtitle?: string
  source: string
  example?: boolean
  className?: string
  children: ReactNode
  testId?: string
}

export function FleetPanel({
  title,
  subtitle,
  source,
  example = false,
  className,
  children,
  testId,
}: FleetPanelProps) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card",
        className,
      )}
      data-testid={testId}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2 font-mono text-xs">
        <span className="text-signal" aria-hidden="true">
          ●
        </span>
        <span className="font-medium">{title}</span>
        {subtitle ? (
          <span className="hidden truncate text-muted-foreground sm:inline">
            {subtitle}
          </span>
        ) : null}
        {example ? (
          <span
            className="ml-auto rounded border border-dashed px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
            title="values drawn by the piece itself, not real numbers"
          >
            example data
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1 p-3">{children}</div>
      <div className="border-t px-3 py-1.5 font-mono text-[10px] text-muted-foreground">
        <span className="break-words">source: {source}</span>
      </div>
    </section>
  )
}
