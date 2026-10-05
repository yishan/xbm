// SlideBlocks-style layout, inspired by UniUni2000/slideblocks-skill (MIT).
import { SlideShell } from "@/components/slides/slide-shell"
import type { ProductsSlideData, SlideProps } from "@/lib/deck-types"

export function ProductsSlide({ slide, index, total }: SlideProps<ProductsSlideData>) {
  return (
    <SlideShell index={index} total={total} title={slide.title} kicker="Landscape">
      <div data-testid="slide-products" className="h-full w-full">
        <div className="grid h-full w-full grid-cols-3 grid-rows-2 gap-[16px]">
          {slide.items.map((item, i) => (
            <div
              key={item.name}
              className="flex min-h-0 flex-col overflow-hidden rounded-[16px] border border-[color:var(--sb-border)] bg-[var(--sb-card)] p-[20px] shadow-[var(--sb-shadow)]"
              style={{
                borderTopWidth: "3px",
                borderTopColor: i < 2 ? "var(--sb-accent)" : "var(--sb-border)",
              }}
            >
              <div className="flex items-start justify-between gap-[10px]">
                <h3 className="min-w-0 text-[21px] font-semibold leading-[1.25] text-[color:var(--sb-heading)]">
                  {item.name}
                </h3>
                <span className="shrink-0 whitespace-nowrap rounded-full bg-[var(--sb-accent-soft)] px-[10px] py-[3px] text-[14px] font-medium leading-[1.2] text-[color:var(--sb-accent)]">
                  {item.tag}
                </span>
              </div>
              <p className="mt-[10px] text-[17px] leading-[1.55] text-[color:var(--sb-fg)]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  )
}
