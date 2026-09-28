import { useState } from "react"
import type { ReactNode } from "react"
import {
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
  const [settleX, setSettleX] = useState(0)

  const iconScale = useTransform(x, [-120, 0], [1.25, 1])
  const springIconScale = useSpring(iconScale, { stiffness: 300, damping: 30 })
  const activeIconScale = reducedMotion ? iconScale : springIconScale

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-zinc-200 bg-white",
        className
      )}
    >
      <div className="absolute inset-y-0 right-0 z-0 flex w-[120px] items-center justify-center gap-1 bg-rose-500 text-white">
        <motion.div style={{ scale: activeIconScale }}>
          <Trash2 className="h-4 w-4" />
        </motion.div>
        <span className="text-xs font-medium">Delete</span>
      </div>

      <motion.div
        data-testid="swipe-row"
        drag={reducedMotion ? false : "x"}
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={reducedMotion ? 0 : 0.1}
        style={{ x }}
        animate={{ x: settleX }}
        transition={
          reducedMotion
            ? { duration: 0.2 }
            : { type: "spring", stiffness: 500, damping: 40 }
        }
        onDragEnd={(_, info) => {
          const currentX = x.get()

          if (currentX < -200 || (currentX < -80 && info.velocity.x < -300)) {
            onDelete()
          } else if (currentX < -80) {
            setSettleX(-80)
          } else {
            setSettleX(0)
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
        className="relative z-10 flex w-full items-center bg-white p-3"
      >
        {children}
      </motion.div>
    </div>
  )
}
