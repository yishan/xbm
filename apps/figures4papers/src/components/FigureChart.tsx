import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  FIGURE_TITLE,
  LINE_SERIES,
  METRIC_KEYS,
  METRIC_LABELS,
  SERIES_COLORS,
  type ChartKind,
  type LinePoint,
  type MetricKey,
  type MetricRow,
} from "@/data/sample"

type Props = {
  kind: ChartKind
  metrics: MetricRow[]
  lineData: LinePoint[]
  activeMetric: MetricKey
}

const paperAxis = {
  stroke: "#333",
  fontSize: 12,
  tickLine: false,
}

export function FigureChart({ kind, metrics, lineData, activeMetric }: Props) {
  return (
    <div className="flex h-full w-full flex-col bg-white p-6 text-neutral-900">
      <p className="mb-4 text-center text-sm font-medium leading-snug">
        {FIGURE_TITLE}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {kind === "bar" ? (
            <BarChart
              data={metrics}
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis dataKey="method" {...paperAxis} />
              <YAxis
                {...paperAxis}
                domain={[0, 100]}
                label={{
                  value: METRIC_LABELS[activeMetric],
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12, fill: "#333" },
                }}
              />
              <Tooltip />
              <Legend />
              <Bar
                dataKey={activeMetric}
                name={METRIC_LABELS[activeMetric]}
                fill={SERIES_COLORS[0]}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          ) : kind === "radar" ? (
            <RadarChart
              data={METRIC_KEYS.map((key) => {
                const point: Record<string, string | number> = {
                  metric: METRIC_LABELS[key],
                }
                for (const row of metrics) {
                  point[row.method] = row[key]
                }
                return point
              })}
              margin={{ top: 16, right: 32, left: 32, bottom: 16 }}
            >
              <PolarGrid stroke="#ccc" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#333" }} />
              <PolarRadiusAxis
                angle={30}
                domain={[60, 100]}
                tick={{ fontSize: 10, fill: "#666" }}
              />
              <Tooltip />
              <Legend />
              {metrics.map((row, i) => (
                <Radar
                  key={row.method}
                  name={row.method}
                  dataKey={row.method}
                  stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                  fill={SERIES_COLORS[i % SERIES_COLORS.length]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
            </RadarChart>
          ) : (
            <LineChart
              data={lineData}
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis
                dataKey="epoch"
                {...paperAxis}
                label={{
                  value: "Epoch",
                  position: "insideBottom",
                  offset: -2,
                  style: { fontSize: 12, fill: "#333" },
                }}
              />
              <YAxis
                {...paperAxis}
                domain={[40, 90]}
                label={{
                  value: "Accuracy (%)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12, fill: "#333" },
                }}
              />
              <Tooltip />
              <Legend />
              {LINE_SERIES.map((series, i) => (
                <Line
                  key={series}
                  type="monotone"
                  dataKey={series}
                  stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
