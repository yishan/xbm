// SlideBlocks-style layout, inspired by UniUni2000/slideblocks-skill (MIT).
import { AppWindow, Bot, CalendarDays, Globe, Mail, Monitor } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { SlideProps, TitleSlideData } from "@/lib/deck-types"

const PANEL_W = 512
const PANEL_H = 720
const CENTER_X = PANEL_W / 2
const CENTER_Y = PANEL_H / 2
const OUTER_R = 205
const INNER_R = 130

const ORBIT: { Icon: LucideIcon; angle: number }[] = [
  { Icon: Mail, angle: 270 },
  { Icon: AppWindow, angle: 342 },
  { Icon: Globe, angle: 54 },
  { Icon: CalendarDays, angle: 126 },
  { Icon: Monitor, angle: 198 },
]

function polar(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180
  return {
    x: CENTER_X + radius * Math.cos(rad),
    y: CENTER_Y + radius * Math.sin(rad),
  }
}

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
        className="relative w-[38%] overflow-hidden bg-[var(--sb-subtle)]"
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${PANEL_W} ${PANEL_H}`}
          fill="none"
        >
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={INNER_R}
            stroke="var(--sb-border)"
            strokeWidth={1}
          />
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={OUTER_R}
            stroke="var(--sb-border)"
            strokeWidth={1}
          />
          {ORBIT.map(({ angle }) => {
            const p = polar(angle, OUTER_R)
            return (
              <line
                key={angle}
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={p.x}
                y2={p.y}
                stroke="var(--sb-border)"
                strokeWidth={1}
              />
            )
          })}
        </svg>

        <div className="absolute left-1/2 top-1/2 flex h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--sb-accent)]">
          <Bot size={48} className="text-[color:var(--sb-accent-fg)]" />
        </div>

        {ORBIT.map(({ Icon, angle }) => {
          const p = polar(angle, OUTER_R)
          return (
            <div
              key={angle}
              className="absolute flex h-[52px] w-[52px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[14px] border border-[color:var(--sb-border)] bg-[var(--sb-card)] shadow-[var(--sb-shadow)]"
              style={{ left: p.x, top: p.y }}
            >
              <Icon size={24} className="text-[color:var(--sb-accent)]" />
            </div>
          )
        })}
      </div>
    </section>
  )
}
