// SlideBlocks-style layout, inspired by UniUni2000/slideblocks-skill (MIT).
import { Info } from "lucide-react"
import { SlideShell } from "@/components/slides/slide-shell"
import { cn } from "@/lib/utils"
import type { MetricsSlideData, SlideProps } from "@/lib/deck-types"

export function MetricsSlide({ slide, index, total }: SlideProps<MetricsSlideData>) {
  return (
    <SlideShell index={index} total={total} title={slide.title} kicker="Key numbers">
      <div
        data-testid="slide-metrics"
        className="grid h-full grid-cols-3 grid-rows-2 gap-[16px]"
      >
        {slide.items.map((item, i) => {
          const isHighlighted = i === 3
          const valueClass =
            item.value.length > 10 ? "text-[40px]" : "text-[44px]"

          return (
            <div
              key={i}
              className={cn(
                "flex flex-col justify-between rounded-[16px] border p-[22px] shadow-[var(--sb-shadow)]",
                isHighlighted
                  ? "border-[color:var(--sb-accent)] bg-[var(--sb-accent-soft)]"
                  : "border-[color:var(--sb-border)] bg-[var(--sb-card)]",
              )}
            >
              <div
                className={cn(
                  "font-semibold tabular-nums tracking-[-0.02em] text-[color:var(--sb-accent)]",
                  valueClass,
                )}
              >
                {item.value}
              </div>

              <div className="mt-[10px] text-[16.5px] leading-[1.5] text-[color:var(--sb-fg)]">
                {item.label}
              </div>

              {item.note ? (
                <div className="mt-[8px] flex items-start gap-[6px] text-[13px] leading-[1.4] text-[color:var(--sb-muted)]">
                  <Info className="mt-[1px] h-[14px] w-[14px] shrink-0" />
                  <span>{item.note}</span>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </SlideShell>
  )
}
