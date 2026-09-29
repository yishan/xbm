import { HoverImage } from "@/blocks/hover-image"
import { useReducedMotionConfig } from "motion/react"

export function HoverImageDemo() {
  const reducedMotion = useReducedMotionConfig() ?? false

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden px-5 pt-8 pb-3">
      <HoverImage className="w-full max-w-[320px]" reducedMotion={reducedMotion} />
    </div>
  )
}
