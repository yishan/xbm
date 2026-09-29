import { useReducedMotionConfig } from "motion/react";
import { DraggableMarquee } from "@/blocks/draggable-marquee";

export function DraggableMarqueeDemo() {
  const reducedMotion = useReducedMotionConfig() ?? false;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <DraggableMarquee className="h-full w-full" reducedMotion={reducedMotion} />
      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-zinc-500">
        drag, fling, or use ← →
      </div>
    </div>
  );
}
