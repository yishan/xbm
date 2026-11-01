// SlideBlocks-style layout, inspired by UniUni2000/slideblocks-skill (MIT).
import { DECK } from "@/lib/deck"
import type { SlideProps, TimelineSlideData, TitleSlideData } from "@/lib/deck-types"

// The cover's right panel previews the deck's own timeline: one row per year,
// one tick per event. The newest year carries the accent.
const TIMELINE = DECK.slides.find(
  (s): s is TimelineSlideData => s.kind === "timeline",
)
const YEARS = TIMELINE
  ? Array.from(
      TIMELINE.events.reduce((acc, e) => {
        acc.set(e.year, (acc.get(e.year) ?? 0) + 1)
        return acc
      }, new Map<string, number>()),
    )
  : []
const EVENT_COUNT = TIMELINE?.events.length ?? 0

export function TitleSlide({ slide, index, total }: SlideProps<TitleSlideData>) {
  const pageLabel = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`

  return (
    <section
      data-testid="slide-title"
      className="sb-slide relative flex h-[720px] w-[1280px] overflow-hidden"
    >
      <div className="flex w-[62%] flex-col p-[80px]">
        <div className="flex items-center gap-[12px]">
          <span className="h-[10px] w-[10px] rounded-full bg-[var(--sb-accent)]" />
          <span className="rounded-full border border-[color:var(--sb-border)] px-[14px] py-[5px] text-[14px] tabular-nums text-[color:var(--sb-muted)]">
            {pageLabel}
          </span>
        </div>

        <h1 className="mt-[110px] text-balance text-[64px] font-semibold leading-[1.15] tracking-[-0.02em] text-[color:var(--sb-heading)]">
          {slide.title}
        </h1>
        <p className="mt-[20px] text-[26px] text-[color:var(--sb-muted)]">
          {slide.subtitle}
        </p>

        <div className="mt-auto grid grid-cols-[auto_1fr] gap-x-[48px] gap-y-[16px]">
          {slide.meta.map((item) => (
            <div
              key={item.label}
              className="border-t border-[color:var(--sb-border)] pt-[12px]"
            >
              <div className="text-[13px] text-[color:var(--sb-muted)]">
                {item.label}
              </div>
              <div className="whitespace-nowrap text-[18px] text-[color:var(--sb-fg)]">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        aria-hidden
        className="flex w-[38%] flex-col justify-center border-l border-[color:var(--sb-border)] bg-[var(--sb-subtle)] px-[56px]"
      >
        <div className="text-[14px] text-[color:var(--sb-muted)]">
          时间线 · {EVENT_COUNT} 个关键节点
        </div>
        <ol className="mt-[28px]">
          {YEARS.map(([year, count], i) => {
            const latest = i === YEARS.length - 1
            return (
              <li
                key={year}
                className="flex items-center gap-[28px] border-t border-[color:var(--sb-border)] py-[22px]"
              >
                <span
                  className={`w-[96px] text-[40px] font-semibold tabular-nums leading-none tracking-[-0.02em] ${
                    latest
                      ? "text-[color:var(--sb-heading)]"
                      : "text-[color:var(--sb-muted)]"
                  }`}
                >
                  {year}
                </span>
                <span className="flex gap-[8px]">
                  {Array.from({ length: count }, (_, k) => (
                    <span
                      key={k}
                      className={`h-[20px] w-[6px] ${
                        latest ? "bg-[var(--sb-accent)]" : "bg-[var(--sb-fg)] opacity-40"
                      }`}
                    />
                  ))}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
