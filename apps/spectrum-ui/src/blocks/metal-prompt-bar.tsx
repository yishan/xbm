import { useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotionConfig,
} from "motion/react"
import { ArrowUp, Check, Code2, Files, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

// AI prompt composer with a rotating liquid-metal send button and reflective chips.
// Inspired by Spectrum UI (ui.spectrumhq.in). Re-implemented from scratch.

interface MetalPromptBarProps {
  className?: string
}

const CHIPS = [
  { label: "Web", icon: Globe },
  { label: "Code", icon: Code2 },
  { label: "Files", icon: Files },
] as const

export function MetalPromptBar({ className }: MetalPromptBarProps) {
  const [value, setValue] = useState("")
  const [activeChips, setActiveChips] = useState<string[]>(["Web"])
  const [sentText, setSentText] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const reducedMotion = useReducedMotionConfig()
  const metalAngle = useMotionValue(0)
  const chipSheen = useMotionTemplate`linear-gradient(${metalAngle}deg, rgba(255,255,255,0.8), rgba(113,113,122,0.15), rgba(255,255,255,0.8))`
  const animationRef = useRef<ReturnType<typeof animate> | null>(null)

  useEffect(() => {
    if (reducedMotion) return
    animationRef.current = animate(metalAngle, 360, {
      duration: 4,
      repeat: Infinity,
      ease: "linear",
    })
    return () => animationRef.current?.stop()
  }, [metalAngle, reducedMotion])

  useEffect(() => {
    return () => animationRef.current?.stop()
  }, [])

  const toggleChip = (chip: string) => {
    setActiveChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    )
  }

  const handleSend = () => {
    if (!value.trim() || sent) return
    setSentText(value)
    setSent(true)
    setValue("")

    window.setTimeout(() => {
      setSent(false)
      setSentText(null)
    }, 700)
  }

  const metalBackground =
    "conic-gradient(from 0deg, #f5f5f5, #a1a1aa, #fafafa, #71717a, #f5f5f5)"

  return (
    <div className={cn("w-[320px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-sm", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Describe a task for your agent…"
            data-testid="metal-prompt"
            disabled={sent}
            className="h-9 w-full rounded-lg bg-transparent px-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
          />
          <AnimatePresence>
            {sentText ? (
              <motion.span
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -28 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-sm text-zinc-900 dark:text-zinc-100"
              >
                {sentText}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>

        <button
          type="submit"
          data-testid="metal-send"
          disabled={!value.trim() || sent}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm disabled:opacity-50"
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: metalBackground }}
            animate={reducedMotion ? undefined : { rotate: 360 }}
            transition={
              reducedMotion
                ? undefined
                : { duration: 4, repeat: Infinity, ease: "linear" }
            }
          />
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.65),transparent_65%)]" />
          <span className="relative z-10">
            {sent ? <Check className="h-4 w-4 text-zinc-900 dark:text-zinc-100" /> : <ArrowUp className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />}
          </span>
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {CHIPS.map((chip) => {
          const Icon = chip.icon
          const active = activeChips.includes(chip.label)
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => toggleChip(chip.label)}
              className={cn(
                "relative flex items-center gap-1.5 overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-800 px-3 py-1 text-xs font-medium transition-colors",
                active ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              {active && !reducedMotion ? (
                <motion.span
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{ background: chipSheen }}
                />
              ) : active ? (
                <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-zinc-100 dark:from-zinc-800 via-zinc-200 dark:via-zinc-800 to-zinc-100 dark:to-zinc-800" />
              ) : null}
              <Icon className="relative z-10 h-3.5 w-3.5" />
              <span className="relative z-10">{chip.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
