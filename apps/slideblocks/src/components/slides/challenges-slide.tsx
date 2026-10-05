// SlideBlocks-style layout, inspired by UniUni2000/slideblocks-skill (MIT).
import { Fragment } from "react"
import { BellRing, Bug, Gauge, RefreshCcw, ShieldAlert, Wallet } from "lucide-react"
import type { ChallengesSlideData, SlideProps } from "@/lib/deck-types"
import { SlideShell } from "@/components/slides/slide-shell"

const ICONS = [ShieldAlert, Bug, RefreshCcw, BellRing, Wallet, Gauge]

const MARKER = "待补"

function withHighlight(text: string) {
  const parts = text.split(MARKER)
  if (parts.length === 1) return text
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 ? (
            <span
              className="rounded px-1"
              style={{ backgroundColor: "var(--sb-warn-soft)", color: "var(--sb-warn)" }}
            >
              {MARKER}
            </span>
          ) : null}
        </Fragment>
      ))}
    </>
  )
}

export function ChallengesSlide({ slide, index, total }: SlideProps<ChallengesSlideData>) {
  return (
    <SlideShell index={index} total={total} title={slide.title} kicker="Open problems">
      <div data-testid="slide-challenges">
        <div className="grid h-full grid-cols-2 grid-rows-3 gap-[14px]">
          {slide.items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <div
                key={i}
                className="flex items-center gap-[16px] rounded-[14px] border border-[color:var(--sb-border)] bg-[var(--sb-card)] p-[20px] shadow-[var(--sb-shadow)]"
              >
                <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[12px] bg-[var(--sb-warn-soft)]">
                  <Icon size={26} color="var(--sb-warn)" />
                </div>
                <div className="min-w-0">
                  <div className="text-[21px] font-semibold text-[color:var(--sb-heading)]">{item.name}</div>
                  <div className="mt-[4px] text-[18px] leading-[1.5] text-[color:var(--sb-fg)]">
                    {withHighlight(item.text)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </SlideShell>
  )
}
