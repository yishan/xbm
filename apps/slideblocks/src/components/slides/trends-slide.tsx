// SlideBlocks-style layout, inspired by UniUni2000/slideblocks-skill (MIT).
import { TrendingUp } from "lucide-react"

import { SlideShell } from "@/components/slides/slide-shell"
import type { SlideProps, TrendsSlideData } from "@/lib/deck-types"

export function TrendsSlide({ slide, index, total }: SlideProps<TrendsSlideData>) {
  return (
    <SlideShell index={index} total={total} title={slide.title} kicker="Trends">
      <div data-testid="slide-trends" className="flex-1">
        <div className="grid h-full min-h-0 grid-cols-4 gap-[18px]">
          {slide.items.map((item, i) => (
            <div
              key={item.name}
              className="flex h-full flex-col rounded-[16px] border border-[color:var(--sb-border)] bg-[var(--sb-card)] p-[24px] shadow-[var(--sb-shadow)]"
            >
              <div className="flex items-start justify-between">
                <span className="text-[64px] font-semibold leading-[1] tabular-nums text-[color:var(--sb-accent-2)] opacity-40">
                  {i + 1}
                </span>
                <TrendingUp
                  className="mt-[8px] h-[24px] w-[24px] shrink-0 text-[color:var(--sb-accent-2)]"
                  aria-hidden
                />
              </div>
              <h3 className="mt-[16px] text-[26px] font-semibold leading-[1.25] text-balance text-[color:var(--sb-heading)]">
                {item.name}
              </h3>
              <div className="mt-[14px] h-[3px] w-[40px] rounded-full bg-[var(--sb-accent-2)]" />
              <p className="mt-[18px] text-[21px] leading-[1.6] text-[color:var(--sb-fg)]">
                {item.text}
              </p>
              <div aria-hidden className="mt-auto pt-[20px]">
                <div className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--sb-border)]">
                  <div
                    className="h-full rounded-full bg-[var(--sb-accent-2)]"
                    style={{ width: `${(i + 1) * 25}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  )
}
