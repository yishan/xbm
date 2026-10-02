// Gallery demo using @antv/infographic (MIT). https://github.com/antvis/Infographic
// Bookmark: https://x.com/Huahuazo/status/2104558493244281026

import { CATEGORIES, SAMPLES } from "@/templates"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type TemplateSidebarProps = {
  activeId: string
  activeCategory: string | "all"
  onSelectId: (id: string) => void
  onSelectCategory: (cat: string | "all") => void
}

const ALL = "all" as const

export function TemplateSidebar({
  activeId,
  activeCategory,
  onSelectId,
  onSelectCategory,
}: TemplateSidebarProps) {
  const visible =
    activeCategory === ALL
      ? SAMPLES
      : SAMPLES.filter((sample) => sample.category === activeCategory)

  const categoryName = (id: string) =>
    CATEGORIES.find((cat) => cat.id === id)?.label ?? id

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-background">
      <div className="border-b border-border p-3">
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Categories
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            data-testid="cat-all"
            variant={activeCategory === ALL ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => onSelectCategory(ALL)}
          >
            All
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              type="button"
              data-testid={`cat-${cat.id}`}
              variant={activeCategory === cat.id ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => onSelectCategory(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-0.5 p-2">
          {visible.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              No templates in this category.
            </p>
          ) : (
            visible.map((sample) => (
              <button
                key={sample.id}
                type="button"
                data-testid={`template-${sample.id}`}
                onClick={() => onSelectId(sample.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent/60",
                  activeId === sample.id
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground"
                )}
              >
                <span className="truncate">{sample.name}</span>
                <Badge
                  variant="secondary"
                  className="shrink-0 text-[10px] font-normal"
                >
                  {categoryName(sample.category)}
                </Badge>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
