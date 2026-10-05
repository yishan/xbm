// SlideBlocks-style layout, inspired by UniUni2000/slideblocks-skill (MIT).
import { CircleCheck } from "lucide-react"

import { SlideShell } from "@/components/slides/slide-shell"
import type { DefinitionSlideData, SlideProps } from "@/lib/deck-types"

export function DefinitionSlide({ slide, index, total }: SlideProps<DefinitionSlideData>) {
  return (
    <SlideShell index={index} total={total} title={slide.title} kicker="Definition">
      <div data-testid="slide-definition" className="grid h-full grid-cols-[7fr_5fr] gap-[28px]">
        <div className="flex h-full flex-col justify-center gap-[40px]">
          <div className="border-l-4 border-l-[color:var(--sb-accent)] pl-[20px] text-[32px] font-medium leading-[1.45] text-balance text-[color:var(--sb-heading)]">
            {slide.definition}
          </div>
          <div className="grid grid-cols-2 gap-[16px]">
            {slide.contrasts.map((contrast) => (
              <div
                key={contrast.label}
                className="rounded-[16px] border border-[color:var(--sb-border)] bg-[var(--sb-card)] p-[24px] shadow-[var(--sb-shadow)]"
              >
                <div className="text-[17px] font-semibold text-[color:var(--sb-accent)]">
                  {contrast.label}
                </div>
                <div className="mt-[10px] text-[21px] leading-[1.5] text-[color:var(--sb-fg)]">
                  {contrast.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex h-full flex-col justify-center rounded-[16px] bg-[var(--sb-accent-soft)] p-[32px]">
          <div className="mb-[8px] text-[18px] font-semibold text-[color:var(--sb-heading)]">
            {slide.criteriaLabel}
          </div>
          <ul className="mt-[16px] flex flex-col gap-[26px]">
            {slide.criteria.map((criterion) => (
              <li key={criterion} className="flex items-start gap-[16px]">
                <CircleCheck
                  className="mt-[2px] size-[26px] shrink-0 text-[color:var(--sb-accent)]"
                  strokeWidth={2}
                />
                <span className="text-[23px] leading-[1.5] text-[color:var(--sb-fg)]">
                  {criterion}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SlideShell>
  )
}
