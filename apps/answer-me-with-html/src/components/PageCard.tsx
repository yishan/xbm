import type { DemoPage } from '@/data/pages'
import { cn } from '@/lib/utils'

export function PageCard({
  page,
  index,
  active,
  onOpen,
}: {
  page: DemoPage
  index: number
  active: boolean
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      data-testid={`card-${page.id}`}
      onClick={onOpen}
      className={cn(
        'flex h-full w-full flex-col justify-start rounded-xl border bg-card p-4 text-left transition-colors',
        'hover:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
        active && 'ring-2 ring-primary',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          {String(index + 1).padStart(2, '0')}
        </span>
        {page.exampleData ? (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            示例数据
          </span>
        ) : null}
      </div>

      <div className="mt-2 min-w-0 font-medium break-words text-foreground">{page.title}</div>

      <p className="mt-1 min-w-0 text-sm break-words text-muted-foreground">{page.summary}</p>

      <div className="mt-3 flex flex-wrap gap-1">
        {page.components.map((component) => (
          <span
            key={component}
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
          >
            {component}
          </span>
        ))}
      </div>

      <div className="mt-3 min-w-0 text-xs break-words text-muted-foreground">
        来源：{page.source}
      </div>
    </button>
  )
}
