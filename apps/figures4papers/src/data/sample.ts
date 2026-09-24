export type ChartKind = "bar" | "radar" | "line"

export type MetricRow = {
  method: string
  accuracy: number
  f1: number
  precision: number
  recall: number
}

export type LinePoint = {
  epoch: number
  Baseline: number
  Ours: number
  "Ablation-A": number
}

export const METRIC_KEYS = ["accuracy", "f1", "precision", "recall"] as const
export type MetricKey = (typeof METRIC_KEYS)[number]

export const METRIC_LABELS: Record<MetricKey, string> = {
  accuracy: "Accuracy (%)",
  f1: "F1",
  precision: "Precision",
  recall: "Recall",
}

export const FIGURE_TITLE =
  "Figure 1. Comparison of methods on the ImageNet-1K validation set."

export const DEFAULT_METRICS: MetricRow[] = [
  { method: "Baseline", accuracy: 76.2, f1: 74.8, precision: 75.1, recall: 74.5 },
  { method: "Ablation-A", accuracy: 78.9, f1: 77.4, precision: 78.0, recall: 76.9 },
  { method: "Ablation-B", accuracy: 80.1, f1: 79.0, precision: 79.6, recall: 78.5 },
  { method: "Ours", accuracy: 82.7, f1: 81.9, precision: 82.3, recall: 81.5 },
]

export const DEFAULT_LINE: LinePoint[] = [
  { epoch: 0, Baseline: 42.0, Ours: 45.5, "Ablation-A": 43.2 },
  { epoch: 20, Baseline: 58.4, Ours: 64.1, "Ablation-A": 60.8 },
  { epoch: 40, Baseline: 67.9, Ours: 73.6, "Ablation-A": 70.2 },
  { epoch: 60, Baseline: 72.5, Ours: 78.9, "Ablation-A": 75.4 },
  { epoch: 80, Baseline: 75.1, Ours: 81.4, "Ablation-A": 77.8 },
  { epoch: 100, Baseline: 76.2, Ours: 82.7, "Ablation-A": 78.9 },
]

export const LINE_SERIES = ["Baseline", "Ablation-A", "Ours"] as const
export type LineSeriesKey = (typeof LINE_SERIES)[number]

/** Colorblind-friendly palette for paper figures */
export const SERIES_COLORS = [
  "#4C72B0",
  "#DD8452",
  "#55A868",
  "#C44E52",
  "#8172B3",
] as const
