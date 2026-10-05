// SlideBlocks-style layout, inspired by UniUni2000/slideblocks-skill (MIT).
import { Brain, Wrench, CalendarClock, Network, Monitor } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { SlideShell } from "@/components/slides/slide-shell"
import type { LayersSlideData, SlideProps } from "@/lib/deck-types"

const LAYER_ICONS: LucideIcon[] = [Brain, Wrench, CalendarClock, Network, Monitor]
const SLAB_WIDTHS = ["70%", "77%", "85%", "92%", "100%"]

export function LayersSlide({ slide, index, total }: SlideProps<LayersSlideData>) {
  return (
    <SlideShell index={index} total={total} title={slide.title} kicker="Capability stack">
      <div
        data-testid="slide-layers"
        className="grid h-full grid-cols-[5fr_7fr] items-stretch gap-[32px]"
      >
        <div className="flex h-full flex-col items-center justify-center">
          <div className="rounded-full bg-[var(--sb-accent)] px-[16px] py-[6px] text-[14px] font-medium tracking-[0.01em] text-[color:var(--sb-accent-fg)]">
            {slide.center}
          </div>
          <div className="h-[24px] w-[2px] bg-[color:var(--sb-accent)]" />
          <div className="flex w-full flex-col items-center gap-[10px]">
            {slide.layers.map((layer, i) => {
              const Icon = LAYER_ICONS[i % LAYER_ICONS.length]
              return (
                <div
                  key={layer.name + String(i)}
                  style={{ width: SLAB_WIDTHS[i % SLAB_WIDTHS.length] }}
                  className="flex h-[60px] items-center gap-[12px] rounded-[12px] border border-[color:var(--sb-accent)] bg-[var(--sb-accent-soft)] px-[18px] shadow-[var(--sb-shadow)]"
                >
                  <Icon size={22} className="shrink-0 text-[color:var(--sb-accent)]" />
                  <span className="truncate text-[22px] font-semibold text-[color:var(--sb-heading)]">
                    {layer.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex h-full flex-col justify-between">
          {slide.layers.map((layer, i) => (
            <div
              key={layer.name + String(i)}
              className={[
                "flex items-baseline gap-[16px] py-[8px]",
                i > 0 ? "border-t border-[color:var(--sb-border)]" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="shrink-0 text-[19px] font-semibold text-[color:var(--sb-accent)]">
                {layer.name}
              </span>
              <div className="flex flex-1 flex-wrap items-baseline gap-x-[10px] gap-y-[4px]">
                <span className="text-[18px] leading-[1.5] text-[color:var(--sb-fg)]">
                  {layer.text}
                </span>
                {layer.note ? (
                  <span className="shrink-0 rounded-full border border-[color:var(--sb-warn)] bg-[var(--sb-warn-soft)] px-[10px] py-[2px] text-[13px] leading-[1.4] text-[color:var(--sb-warn)]">
                    {layer.note}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  )
}
