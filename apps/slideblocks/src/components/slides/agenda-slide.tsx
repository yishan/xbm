// SlideBlocks-style layout, inspired by UniUni2000/slideblocks-skill (MIT).
import type { AgendaSlideData, SlideProps } from "@/lib/deck-types";
import { SlideShell } from "@/components/slides/slide-shell";
import { cn } from "@/lib/utils";

export function AgendaSlide({ slide, index, total }: SlideProps<AgendaSlideData>) {
  return (
    <SlideShell index={index} total={total} title={slide.title} kicker="Agenda">
      <div data-testid="slide-agenda" className="flex h-full w-full flex-col">
        <div className="grid h-full w-full grid-cols-3 grid-rows-2 gap-[20px]">
          {slide.items.map((item, i) => (
            <div
              key={`${slide.id}-agenda-${i}`}
              className={cn(
                "flex flex-col rounded-[16px] border border-[color:var(--sb-border)] bg-[var(--sb-card)] p-[24px] shadow-[var(--sb-shadow)]",
                i === 0 && "bg-[var(--sb-accent-soft)]",
              )}
            >
              <span className="text-[40px] font-semibold tabular-nums leading-none text-[color:var(--sb-accent)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-auto text-[24px] font-medium leading-[1.5] text-balance text-[color:var(--sb-heading)]">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}
