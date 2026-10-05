// SlideBlocks-style layout, inspired by UniUni2000/slideblocks-skill (MIT).
import { MessagesSquare, Quote } from "lucide-react"
import type { ClosingSlideData, SlideProps } from "@/lib/deck-types"
import { SlideShell } from "@/components/slides/slide-shell"

function renderPoint(text: string) {
  const parts = text.split("待补")
  return parts.map((part, i) => {
    const isLast = i === parts.length - 1
    return (
      <span key={i}>
        {part}
        {!isLast && (
          <span className="rounded-[4px] bg-[var(--sb-warn-soft)] px-1 text-[color:var(--sb-warn)]">
            待补
          </span>
        )}
      </span>
    )
  })
}

export function ClosingSlide({ slide, index, total }: SlideProps<ClosingSlideData>) {
  return (
    <SlideShell index={index} total={total} title={slide.title} kicker="Wrap-up">
      <div
        data-testid="slide-closing"
        className="grid h-full w-full grid-cols-[6fr_5fr] items-center gap-[32px]"
      >
        <ol className="flex flex-col gap-[28px]">
          {slide.points.map((point, i) => (
            <li key={i} className="flex items-start gap-[16px]">
              <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[var(--sb-accent-soft)] text-[17px] font-semibold text-[color:var(--sb-accent)]">
                {i + 1}
              </span>
              <span className="text-[24px] leading-[1.5] text-[color:var(--sb-fg)]">
                {renderPoint(point)}
              </span>
            </li>
          ))}
        </ol>

        <div className="flex flex-col">
          <div className="rounded-[20px] bg-[var(--sb-accent)] p-[40px] text-[color:var(--sb-accent-fg)] shadow-[var(--sb-shadow)]">
            <Quote className="h-[32px] w-[32px] opacity-70" />
            <div className="mt-[20px] text-[30px] font-medium leading-[1.45]">
              {slide.callout}
            </div>
          </div>

          <div className="mt-[28px] flex items-center gap-[14px]">
            <MessagesSquare className="h-[28px] w-[28px] shrink-0 text-[color:var(--sb-accent)]" />
            <span className="text-[32px] font-semibold text-[color:var(--sb-heading)]">
              {slide.cta}
            </span>
          </div>
        </div>
      </div>
    </SlideShell>
  )
}
