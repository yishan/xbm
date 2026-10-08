import { Search } from "lucide-react"

import type { Category, FpsChoice } from "@/lib/types"
import { CATEGORIES } from "@/lib/types"
import { cn } from "@/lib/utils"

export type GalleryToolbarProps = {
  category: Category | "all"
  onCategory: (c: Category | "all") => void
  counts: Record<Category, number>
  total: number
  fps: FpsChoice
  onFps: (f: FpsChoice) => void
  mono: boolean
  onMono: (m: boolean) => void
  query: string
  onQuery: (q: string) => void
}

const FPS_OPTIONS: { value: FpsChoice; label: string }[] = [
  { value: "native", label: "native" },
  { value: 24, label: "24" },
  { value: 8, label: "8" },
  { value: 0, label: "still" },
]

export function GalleryToolbar(props: GalleryToolbarProps) {
  const { category, onCategory, counts, total, fps, onFps, mono, onMono, query, onQuery } = props

  return (
    <div className="flex flex-col gap-3 font-mono text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-56">
          <Search
            className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="filter pieces…"
            aria-label="filter pieces"
            data-testid="piece-filter"
            className="h-8 w-full rounded-md border border-border bg-card pl-7 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-signal"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">fps</span>
          <div className="flex overflow-hidden rounded-md border border-border">
            {FPS_OPTIONS.map((option) => {
              const active = fps === option.value
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onFps(option.value)}
                  data-testid={`fps-${option.value}`}
                  className={cn(
                    "h-8 border-r border-border px-2 last:border-r-0",
                    active ? "bg-foreground text-background" : "bg-card text-foreground hover:bg-muted",
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          aria-pressed={mono}
          onClick={() => onMono(!mono)}
          data-testid="mono-toggle"
          title="draw coloured pieces as text in one ink"
          className={cn(
            "h-8 rounded-md border border-border px-2",
            mono ? "bg-foreground text-background" : "bg-card text-foreground hover:bg-muted",
          )}
        >
          {mono ? "mono: on" : "mono: off"}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <CategoryChip
          name="all"
          label="all"
          count={total}
          selected={category === "all"}
          onClick={() => onCategory("all")}
        />
        {CATEGORIES.map((c) => (
          <CategoryChip
            key={c}
            name={c}
            label={c}
            count={counts[c]}
            selected={category === c}
            onClick={() => onCategory(c)}
          />
        ))}
      </div>
    </div>
  )
}

type CategoryChipProps = {
  name: string
  label: string
  count: number
  selected: boolean
  onClick: () => void
}

function CategoryChip({ name, label, count, selected, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      data-testid={`cat-${name}`}
      className={cn(
        "flex items-center gap-1 rounded-full border border-border px-2.5 py-1",
        selected ? "bg-foreground text-background" : "bg-card text-foreground hover:bg-muted",
      )}
    >
      <span>{label}</span>
      <span className={selected ? "opacity-70" : "text-muted-foreground"}>{count}</span>
    </button>
  )
}
