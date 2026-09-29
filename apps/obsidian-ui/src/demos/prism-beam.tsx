import { PrismBeam } from "../blocks/prism-beam";
import { useReducedMotionConfig } from "motion/react";

export function PrismBeamDemo() {
  const reducedMotion = useReducedMotionConfig() ?? false;

  return (
    <PrismBeam
      className="h-full w-full"
      reducedMotion={reducedMotion}
    />
  );
}
