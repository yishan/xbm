import { useReducedMotionConfig } from "motion/react";
import { TextReel } from "@/blocks/text-reel";

export function TextReelDemo() {
  const reducedMotion = useReducedMotionConfig() ?? false;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <TextReel className="w-full" reducedMotion={reducedMotion} />
      <p className="mt-4 text-xs text-zinc-500">
        scroll or use the wheel over the reel
      </p>
    </div>
  );
}
