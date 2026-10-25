import { Check, Minus, X } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import type { RunEntry } from "@/hooks/use-scripted-run"
import type { AgentState } from "@/lib/agent"
import { STATE_META, TONE_CLASSES, formatElapsed } from "@/lib/agent"
import { cn } from "@/lib/utils"

export type RunTimelineProps = {
  entries: RunEntry[]
  elapsedMs: number
  exampleTag?: boolean
  className?: string
}

type Status = RunEntry["status"]

function TimelineNode({ status, state, reduce }: { status: Status; state: AgentState; reduce: boolean }) {
  if (status === "pending") {
    return <span className="size-5 rounded-full border-2 border-muted-foreground/30 bg-card" aria-hidden="true" />
  }

  if (status === "active") {
    const tone = TONE_CLASSES[STATE_META[state].tone]
    return (
      <span className="relative flex size-5 items-center justify-center">
        {!reduce && (
          <motion.span
            aria-hidden="true"
            className={cn("absolute size-2.5 rounded-full", tone.bar)}
            animate={{ scale: [1, 2.2], opacity: [0.55, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <span className={cn("relative size-2.5 rounded-full", tone.bar)} />
      </span>
    )
  }

  if (status === "skipped") {
    return (
      <span className="flex size-5 items-center justify-center rounded-full border border-border text-muted-foreground">
        <Minus className="size-3" aria-hidden="true" />
      </span>
    )
  }

  const tone = TONE_CLASSES[status === "failed" ? "rose" : STATE_META[state].tone]
  const Icon = status === "failed" ? X : Check
  return (
    <span className={cn("flex size-5 items-center justify-center rounded-full ring-1", tone.bg, tone.text, tone.ring)}>
      <Icon className="size-3" strokeWidth={3} aria-hidden="true" />
    </span>
  )
}

function durationLabel(entry: RunEntry): string | null {
  if (entry.status !== "complete" && entry.status !== "failed") return null
  if (entry.startedAt === undefined || entry.endedAt === undefined) return null
  return `${(Math.max(0, entry.endedAt - entry.startedAt) / 1000).toFixed(1)}s`
}

export function RunTimeline({ entries, elapsedMs, exampleTag = true, className }: RunTimelineProps) {
  const reduce = useReducedMotion() ?? false
  const isIdle = elapsedMs === 0 && entries.every((entry) => entry.status === "pending")

  return (
    <section
      data-testid="run-timeline"
      className={cn("rounded-2xl border border-border bg-card p-5", className)}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-medium">RunTimeline · 运行时间线</h2>
          {exampleTag && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              示例数据
            </span>
          )}
        </div>
        <span className="text-sm tabular-nums text-muted-foreground">{formatElapsed(elapsedMs)}</span>
      </div>

      {isIdle && <p className="mb-3 text-xs text-muted-foreground">点「播放」看一次完整运行</p>}

      <ol className="flex flex-col">
        {entries.map((entry, index) => {
          const meta = STATE_META[entry.state]
          const tone = TONE_CLASSES[meta.tone]
          const isActive = entry.status === "active"
          const isSkipped = entry.status === "skipped"
          const isLast = index === entries.length - 1
          const duration = durationLabel(entry)

          return (
            <motion.li
              key={entry.id}
              layout
              data-status={entry.status}
              className="relative flex gap-3 rounded-lg"
            >
              <motion.span
                aria-hidden="true"
                initial={false}
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.25 }}
                className="pointer-events-none absolute inset-0 rounded-lg bg-muted/60"
              />

              <div className="relative flex w-5 flex-col items-center">
                <TimelineNode status={entry.status} state={entry.state} reduce={reduce} />
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1 w-px flex-1",
                      entry.status === "complete" ? tone.bar : "bg-border",
                    )}
                  />
                )}
              </div>

              <div className={cn("relative min-w-0 flex-1", !isLast && "pb-4")}>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isSkipped && "text-muted-foreground line-through",
                    )}
                  >
                    {entry.title}
                  </span>
                  <span
                    role={isActive ? "status" : undefined}
                    aria-live={isActive ? "polite" : undefined}
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] ring-1",
                      tone.text,
                      tone.bg,
                      tone.ring,
                    )}
                  >
                    {meta.label}
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-1 text-xs break-words text-muted-foreground",
                    entry.tool && "font-mono",
                  )}
                >
                  {entry.detail}
                </p>
              </div>

              <div className="relative shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {duration && <div>{duration}</div>}
                {isActive && <div>进行中</div>}
                {entry.status === "complete" && entry.credits > 0 && <div>+{entry.credits}</div>}
              </div>
            </motion.li>
          )
        })}
      </ol>
    </section>
  )
}
