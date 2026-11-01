import { useState } from "react"
import { ParallaxSlider, type ParallaxSlide, type ParallaxSliderOrientation } from "@/blocks/parallax-slider"
import { cn } from "@/lib/utils"

const base = import.meta.env.BASE_URL
// Public screenshots of other xbm demos (their own artifacts/screenshot.png).
const slides: ParallaxSlide[] = [
  { title: "Hairline", image: `${base}parallax/hairline.webp`, alt: "Hairline 演示：等距线稿图形目录", href: `${base}../hairline/`, focus: "50% 40%" },
  { title: "SlideBlocks", image: `${base}parallax/slideblocks.webp`, alt: "SlideBlocks 演示：一页中文幻灯片", href: `${base}../slideblocks/`, focus: "40% 50%" },
  { title: "TanStack Charts", image: `${base}parallax/tanstack-charts.webp`, alt: "TanStack Charts 演示：图表面板", href: `${base}../tanstack-charts/`, focus: "50% 50%" },
  { title: "Spectrum UI", image: `${base}parallax/spectrum-ui.webp`, alt: "Spectrum UI 演示：组件页", href: `${base}../spectrum-ui/`, focus: "50% 40%" },
  { title: "ManimGX", image: `${base}parallax/manimgx.webp`, alt: "ManimGX 演示：数学动画", href: `${base}../manimgx/`, focus: "50% 50%" },
  { title: "Figures4Papers", image: `${base}parallax/figures4papers.webp`, alt: "Figures4Papers 演示：论文插图", href: `${base}../figures4papers/`, focus: "50% 50%" },
]

const modes: { value: ParallaxSliderOrientation; label: string }[] = [
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Full image" },
]

export function ParallaxSliderDemo() {
  const [orientation, setOrientation] = useState<ParallaxSliderOrientation>("portrait")
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 pt-12">
      <div role="group" aria-label="Frame shape" className="inline-flex rounded-lg border border-zinc-900/10 bg-white/70 p-0.5 dark:border-white/10 dark:bg-black/40">
        {modes.map((m) => (
          <button
            key={m.value}
            type="button"
            data-testid={`parallax-mode-${m.value}`}
            aria-pressed={orientation === m.value}
            onClick={() => setOrientation(m.value)}
            className={cn(
              "rounded-md px-3 py-1 text-xs text-zinc-500 transition-colors duration-150 ease-out select-none dark:text-zinc-400",
              orientation === m.value && "bg-zinc-900/[0.06] text-zinc-900 dark:bg-white/10 dark:text-zinc-100",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      <ParallaxSlider key={orientation} slides={slides} orientation={orientation} label="xbm demos" className="w-full" />
    </div>
  )
}
