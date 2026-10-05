// SlideBlocks-style layout, inspired by UniUni2000/slideblocks-skill (MIT).
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function SlideShell(props: {
  index: number
  total: number
  title: string
  kicker?: string
  children: ReactNode
  className?: string
}) {
  const { index, total, title, kicker, children, className } = props

  const pageLabel = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`

  return (
    <section
      className={cn(
        "sb-slide relative flex h-[720px] w-[1280px] flex-col overflow-hidden px-[72px] pb-[36px] pt-[52px]",
        className,
      )}
    >
      {/* decorative top accent */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-[6px] w-[120px] rounded-br-[6px] bg-[var(--sb-accent)]"
      />

      {/* decorative dot grid, top-right */}
      <svg
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-[120px] w-[240px] opacity-[0.4]"
      >
        <defs>
          <pattern id="sb-shell-dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="none" stroke="var(--sb-border)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sb-shell-dots)" />
      </svg>

      {/* header row */}
      <div className="relative z-10 flex items-center gap-[12px]">
        <span className="rounded-full border border-[color:var(--sb-border)] bg-[var(--sb-card)] px-[12px] py-[4px] text-[14px] tabular-nums text-[color:var(--sb-muted)]">
          {pageLabel}
        </span>
        {kicker ? (
          <span className="text-[14px] font-medium uppercase tracking-[0.12em] text-[color:var(--sb-accent)]">
            {kicker}
          </span>
        ) : null}
      </div>

      {/* title */}
      <h2 className="relative z-10 mt-[14px] text-balance text-[42px] font-semibold leading-[1.2] tracking-[-0.01em] text-[color:var(--sb-heading)]">
        {title}
      </h2>

      {/* body */}
      <div className="mt-[28px] flex min-h-0 flex-1 flex-col">{children}</div>

      {/* footer */}
      <footer className="mt-[20px] flex justify-between border-t border-[color:var(--sb-border)] pt-[14px] text-[13px] text-[color:var(--sb-muted)]">
        <span>Personal Agent 的发展现状 · Tech Demos / Yishan</span>
        <span>SlideBlocks-style · MIT</span>
      </footer>
    </section>
  )
}
