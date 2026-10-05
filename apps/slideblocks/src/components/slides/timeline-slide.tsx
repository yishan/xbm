// SlideBlocks-style layout, inspired by UniUni2000/slideblocks-skill (MIT).
import type { SlideProps, TimelineSlideData } from "@/lib/deck-types"
import { SlideShell } from "@/components/slides/slide-shell"

const COLUMNS = "1fr 1.3fr 1.3fr 1.8fr"

export function TimelineSlide({ slide, index, total }: SlideProps<TimelineSlideData>) {
  const years = Array.from(new Set(slide.events.map((event) => event.year)))
  const lastYear = years[years.length - 1]

  return (
    <SlideShell index={index} total={total} title={slide.title} kicker="Timeline">
      <div data-testid="slide-timeline" className="relative flex w-full flex-col">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 top-[7px] h-[2px] bg-[var(--sb-border)]"
        />
        <div
          className="relative grid w-full items-start gap-[20px]"
          style={{ gridTemplateColumns: COLUMNS }}
        >
          {years.map((year) => {
            const isLast = year === lastYear
            const events = slide.events.filter((event) => event.year === year)
            return (
              <div key={year} className="flex flex-col">
                <div className="relative h-[16px]">
                  {isLast ? (
                    <span className="absolute left-0 top-[1px] h-[14px] w-[14px] rounded-full bg-[var(--sb-accent)]" />
                  ) : (
                    <span className="absolute left-0 top-[1px] h-[14px] w-[14px] rounded-full border-[2px] border-[color:var(--sb-accent)] bg-[var(--sb-bg)]" />
                  )}
                </div>
                <div className="mt-[8px] text-[32px] font-semibold leading-[1.1] tracking-tight tabular-nums text-[color:var(--sb-heading)]">
                  {year}
                </div>
                <div
                  className={
                    isLast
                      ? "mt-[14px] flex flex-col gap-[10px] rounded-[16px] bg-[var(--sb-accent-soft)] p-[12px]"
                      : "mt-[14px] flex flex-col gap-[10px]"
                  }
                >
                  {events.map((event) => (
                    <div
                      key={`${event.year}-${event.date}-${event.text}`}
                      className="rounded-[12px] border border-[color:var(--sb-border)] bg-[var(--sb-card)] px-[14px] py-[10px]"
                    >
                      <div className="text-[14px] font-semibold tabular-nums text-[color:var(--sb-accent)]">
                        {event.date}
                      </div>
                      <div className="mt-[4px] text-[16px] leading-[1.45] text-[color:var(--sb-fg)]">
                        {event.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </SlideShell>
  )
}
