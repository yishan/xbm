// Deck data model for the SlideBlocks-style demo. Layout ideas from
// UniUni2000/slideblocks-skill (MIT). https://github.com/UniUni2000/slideblocks-skill

export type MetaItem = { label: string; value: string }

export type TitleSlideData = {
  kind: "title"
  id: string
  title: string
  subtitle: string
  meta: MetaItem[]
}

export type AgendaSlideData = {
  kind: "agenda"
  id: string
  title: string
  items: string[]
}

export type DefinitionSlideData = {
  kind: "definition"
  id: string
  title: string
  definition: string
  contrasts: { label: string; text: string }[]
  criteriaLabel: string
  criteria: string[]
}

export type TimelineEvent = { year: string; date: string; text: string }

export type TimelineSlideData = {
  kind: "timeline"
  id: string
  title: string
  events: TimelineEvent[]
}

export type LabeledItem = { name: string; text: string; note?: string }

export type LayersSlideData = {
  kind: "layers"
  id: string
  title: string
  center: string
  layers: LabeledItem[]
}

export type ProductItem = { name: string; tag: string; text: string }

export type ProductsSlideData = {
  kind: "products"
  id: string
  title: string
  items: ProductItem[]
}

export type ChallengesSlideData = {
  kind: "challenges"
  id: string
  title: string
  items: LabeledItem[]
}

export type TrendsSlideData = {
  kind: "trends"
  id: string
  title: string
  items: LabeledItem[]
}

export type MetricItem = { value: string; label: string; note?: string }

export type MetricsSlideData = {
  kind: "metrics"
  id: string
  title: string
  items: MetricItem[]
}

export type ClosingSlideData = {
  kind: "closing"
  id: string
  title: string
  points: string[]
  callout: string
  cta: string
}

export type SlideData =
  | TitleSlideData
  | AgendaSlideData
  | DefinitionSlideData
  | TimelineSlideData
  | LayersSlideData
  | ProductsSlideData
  | ChallengesSlideData
  | TrendsSlideData
  | MetricsSlideData
  | ClosingSlideData

export type SlideKind = SlideData["kind"]

export type Deck = {
  title: string
  speaker: string
  date: string
  slides: SlideData[]
}

/** Props every slide layout component receives. */
export type SlideProps<T extends SlideData> = {
  slide: T
  index: number
  total: number
}
