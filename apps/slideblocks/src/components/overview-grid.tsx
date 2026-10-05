// SlideBlocks-style layout, inspired by UniUni2000/slideblocks-skill (MIT).
import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SlideRenderer } from "@/components/slide-renderer"
import { SlideThumb } from "@/components/slide-stage"
import type { SlideData } from "@/lib/deck-types"

const THUMB_WIDTH = 300

export function OverviewGrid({
  slides,
  current,
  onSelect,
  onClose,
}: {
  slides: SlideData[]
  current: number
  onSelect: (index: number) => void
  onClose: () => void
}) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const el = itemRefs.current[current]
    if (!el) return
    el.scrollIntoView({ block: "center" })
    el.focus()
  }, [current])

  return (
    <div
      data-testid="overview-grid"
      role="dialog"
      aria-label="幻灯片总览"
      className="fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 pt-6">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-semibold">幻灯片总览</span>
          <span className="text-sm text-muted-foreground">
            共 {slides.length} 页 · 按 Esc 或 O 关闭
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="关闭总览"
          data-testid="overview-close"
          onClick={onClose}
        >
          <X />
        </Button>
      </div>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 justify-items-center gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            data-testid={`overview-item-${i}`}
            ref={(el) => {
              itemRefs.current[i] = el
            }}
            onClick={() => onSelect(i)}
            className={`rounded-xl ring-offset-2 outline-none transition focus-visible:ring-2 focus-visible:ring-primary ${
              i === current ? "ring-2 ring-primary" : "ring-1 ring-border hover:ring-primary/50"
            }`}
          >
            <SlideThumb width={THUMB_WIDTH}>
              <SlideRenderer slide={s} index={i} total={slides.length} />
            </SlideThumb>
            <div className="mt-2 flex items-center gap-2 px-1">
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-left text-xs">{s.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
