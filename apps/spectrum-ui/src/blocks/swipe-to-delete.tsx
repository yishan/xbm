// Swipe to delete row with draggable reveal.
// Inspired by Spectrum UI (ui.spectrumhq.in). Re-implemented from scratch.

import { useRef } from "react"
import type { ReactNode } from "react"
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotionConfig,
  useSpring,
  useTransform,
} from "motion/react"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

type SwipeToDeleteProps = {
  children: ReactNode
  onDelete: () => void
  className?: string
}

export function SwipeToDelete({ children, onDelete, className }: SwipeToDeleteProps) {
  const reducedMotion = useReducedMotionConfig()
  const x = useMotionValue(0)
  const ignoreNextClick = useRef(false)

  const deleteOpacity = useTransform(x, [-40, 0], [1, 0])
  const iconScale = useTransform(x, [-120, 0], [1.25, 1])
  const springIconScale = useSpring(iconScale, { stiffness: 300, damping: 30 })
  const activeIconScale = reducedMotion ? iconScale : springIconScale

  const snapTo = (target: number) => {
    animate(
      x,
      target,
      reducedMotion
        ? { duration: 0.2 }
        : ({ type: "spring", stiffness: 500, damping: 40 } as const)
    )
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900",
        className
      )}
    >
      <motion.button
        type="button"
        aria-label="Delete"
        onClick={onDelete}
        style={{ opacity: deleteOpacity }}
        className="absolute inset-y-0 right-0 z-0 flex w-[96px] items-center justify-center gap-1 bg-rose-500 text-white"
      >
        <motion.div style={{ scale: activeIconScale }}>
          <Trash2 className="h-4 w-4" />
        </motion.div>
        <span className="text-xs font-medium">Delete</span>
      </motion.button>

      <motion.div
        data-testid="swipe-row"
        drag={reducedMotion ? false : "x"}
        dragConstraints={{ left: -220, right: 0 }}
        dragElastic={reducedMotion ? 0 : 0.05}
        style={{ x }}
        onDragEnd={(_, info) => {
          ignoreNextClick.current = true
          const currentX = x.get()

          if (
            currentX < -180 ||
            (currentX < -60 && info.velocity.x < -800)
          ) {
            onDelete()
            return
          }

          if (currentX < -60) {
            snapTo(-96)
          } else {
            snapTo(0)
          }
        }}
        onPointerDown={() => {
          ignoreNextClick.current = false
        }}
        onClick={() => {
          if (ignoreNextClick.current) {
            ignoreNextClick.current = false
            return
          }

          if (x.get() < 0) {
            snapTo(0)
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Delete" || event.key === "Backspace") {
            event.preventDefault()
            onDelete()
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Delete row"
        className="relative z-10 flex w-full items-center bg-white dark:bg-zinc-900 p-3"
      >
        {children}
      </motion.div>
    </div>
  )
}
