import { useReducedMotionConfig } from "motion/react";
import { LensGallery } from "@/blocks/lens-gallery";

export function LensGalleryDemo() {
  const reducedMotion = useReducedMotionConfig() ?? false;

  return (
    <div className="h-full w-full">
      <LensGallery className="h-full w-full" reducedMotion={reducedMotion} />
    </div>
  );
}
