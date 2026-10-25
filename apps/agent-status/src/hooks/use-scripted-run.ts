import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { SCRIPTED_RUN } from "@/lib/agent"
import type { AgentState, RunStep } from "@/lib/agent"

export type RunEntry = RunStep & {
  status: "pending" | "active" | "complete" | "skipped" | "failed"
  startedAt?: number
  endedAt?: number
}

export type ScriptedRun = {
  state: AgentState
  current: RunStep | null
  entries: RunEntry[]
  elapsedMs: number
  creditsUsed: number
  playing: boolean
  play: () => void
  reset: () => void
  approve: () => void
  deny: () => void
  speed: number
  setSpeed: (n: number) => void
}

type Phase = "idle" | "running" | "finished" | "failed"

type RunState = {
  phase: Phase
  index: number
  entries: RunEntry[]
  runId: number
}

const TICK_MS = 100

const buildEntries = (steps: RunStep[]): RunEntry[] =>
  steps.map((step) => ({ ...step, status: "pending" }))

export function useScriptedRun(steps: RunStep[] = SCRIPTED_RUN): ScriptedRun {
  const startRef = useRef(0)
  const [speed, setSpeed] = useState(1)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [run, setRun] = useState<RunState>(() => ({
    phase: "idle",
    index: -1,
    entries: buildEntries(steps),
    runId: 0,
  }))

  const play = useCallback(() => {
    startRef.current = performance.now()
    setElapsedMs(0)
    setRun((prev) => {
      const entries = buildEntries(steps)
      if (entries.length === 0) {
        return { phase: "idle", index: -1, entries, runId: prev.runId + 1 }
      }
      entries[0] = { ...entries[0], status: "active", startedAt: 0 }
      return { phase: "running", index: 0, entries, runId: prev.runId + 1 }
    })
  }, [steps])

  const reset = useCallback(() => {
    setElapsedMs(0)
    setRun((prev) => ({
      phase: "idle",
      index: -1,
      entries: buildEntries(steps),
      runId: prev.runId + 1,
    }))
  }, [steps])

  const advanceStep = useCallback(
    (fromIndex: number, runId: number) => {
      const endedAt = Math.round(performance.now() - startRef.current)
      setRun((prev) => {
        if (prev.phase !== "running" || prev.index !== fromIndex || prev.runId !== runId) {
          return prev
        }
        const step: RunStep | undefined = steps[fromIndex]
        if (!step) return prev
        const completed: RunEntry[] = prev.entries.map((entry, i) =>
          i === fromIndex ? { ...entry, status: "complete", endedAt } : entry,
        )
        const isFinal = fromIndex >= steps.length - 1 || step.state === "done"
        if (isFinal) {
          return { ...prev, entries: completed, phase: "finished" }
        }
        const nextIndex = fromIndex + 1
        const advanced: RunEntry[] = completed.map((entry, i) =>
          i === nextIndex ? { ...entry, status: "active", startedAt: endedAt } : entry,
        )
        return { ...prev, entries: advanced, index: nextIndex }
      })
    },
    [steps],
  )

  const approve = useCallback(() => {
    const endedAt = Math.round(performance.now() - startRef.current)
    setRun((prev) => {
      if (prev.phase !== "running") return prev
      const step: RunStep | undefined = steps[prev.index]
      if (!step || step.state !== "approval") return prev
      const completed: RunEntry[] = prev.entries.map((entry, i) =>
        i === prev.index ? { ...entry, status: "complete", endedAt } : entry,
      )
      const nextIndex = prev.index + 1
      if (nextIndex >= steps.length) {
        return { ...prev, entries: completed, phase: "finished" }
      }
      const advanced: RunEntry[] = completed.map((entry, i) =>
        i === nextIndex ? { ...entry, status: "active", startedAt: endedAt } : entry,
      )
      return { ...prev, entries: advanced, index: nextIndex }
    })
  }, [steps])

  const deny = useCallback(() => {
    const endedAt = Math.round(performance.now() - startRef.current)
    setRun((prev) => {
      if (prev.phase !== "running") return prev
      const step: RunStep | undefined = steps[prev.index]
      if (!step || step.state !== "approval") return prev
      const entries: RunEntry[] = prev.entries.map((entry, i) => {
        if (i === prev.index) return { ...entry, status: "failed", endedAt }
        if (i > prev.index) return { ...entry, status: "skipped" }
        return entry
      })
      return { ...prev, entries, phase: "failed" }
    })
  }, [steps])

  // Auto-advance the active timed step. Approval steps intentionally have no timer.
  useEffect(() => {
    if (run.phase !== "running") return
    if (run.index < 0) return
    const step: RunStep | undefined = steps[run.index]
    if (!step) return
    if (step.state === "approval") return
    const delay = step.state === "done" || step.durationMs <= 0 ? 0 : step.durationMs / speed
    const timer = setTimeout(() => advanceStep(run.index, run.runId), delay)
    return () => clearTimeout(timer)
  }, [run.phase, run.index, run.runId, steps, speed, advanceStep])

  // Tick elapsed time while the run is in flight (keeps ticking during approval waits).
  useEffect(() => {
    if (run.phase !== "running") return
    const interval = setInterval(() => {
      setElapsedMs(Math.round(performance.now() - startRef.current))
    }, TICK_MS)
    return () => clearInterval(interval)
  }, [run.phase, run.runId])

  // Freeze elapsed time once the run finishes or fails.
  useEffect(() => {
    if (run.phase !== "finished" && run.phase !== "failed") return
    setElapsedMs(Math.max(0, Math.round(performance.now() - startRef.current)))
  }, [run.phase, run.runId])

  const creditsUsed = useMemo(
    () =>
      run.entries.reduce(
        (total, entry) => (entry.status === "complete" ? total + entry.credits : total),
        0,
      ),
    [run.entries],
  )

  const activeStep: RunStep | undefined = run.index >= 0 ? steps[run.index] : undefined

  const current = run.phase !== "idle" ? activeStep ?? null : null

  const state: AgentState =
    run.phase === "idle"
      ? "idle"
      : run.phase === "finished"
        ? "done"
        : run.phase === "failed"
          ? "error"
          : activeStep
            ? activeStep.state
            : "idle"

  return {
    state,
    current,
    entries: run.entries,
    elapsedMs,
    creditsUsed,
    playing: run.phase === "running",
    play,
    reset,
    approve,
    deny,
    speed,
    setSpeed,
  }
}
