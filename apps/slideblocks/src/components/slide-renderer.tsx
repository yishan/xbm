// SlideBlocks-style layout, inspired by UniUni2000/slideblocks-skill (MIT).
import type { SlideData } from "@/lib/deck-types"
import { AgendaSlide } from "@/components/slides/agenda-slide"
import { ChallengesSlide } from "@/components/slides/challenges-slide"
import { ClosingSlide } from "@/components/slides/closing-slide"
import { DefinitionSlide } from "@/components/slides/definition-slide"
import { LayersSlide } from "@/components/slides/layers-slide"
import { MetricsSlide } from "@/components/slides/metrics-slide"
import { ProductsSlide } from "@/components/slides/products-slide"
import { TimelineSlide } from "@/components/slides/timeline-slide"
import { TitleSlide } from "@/components/slides/title-slide"
import { TrendsSlide } from "@/components/slides/trends-slide"

export function SlideRenderer({ slide, index, total }: { slide: SlideData; index: number; total: number }) {
  switch (slide.kind) {
    case "title":
      return <TitleSlide slide={slide} index={index} total={total} />
    case "agenda":
      return <AgendaSlide slide={slide} index={index} total={total} />
    case "definition":
      return <DefinitionSlide slide={slide} index={index} total={total} />
    case "timeline":
      return <TimelineSlide slide={slide} index={index} total={total} />
    case "layers":
      return <LayersSlide slide={slide} index={index} total={total} />
    case "products":
      return <ProductsSlide slide={slide} index={index} total={total} />
    case "challenges":
      return <ChallengesSlide slide={slide} index={index} total={total} />
    case "trends":
      return <TrendsSlide slide={slide} index={index} total={total} />
    case "metrics":
      return <MetricsSlide slide={slide} index={index} total={total} />
    case "closing":
      return <ClosingSlide slide={slide} index={index} total={total} />
  }
}
