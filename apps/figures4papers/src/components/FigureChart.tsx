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
  FIGURE_TITLES,
  META,
  SERIES_COLORS,
  SERIES_KEYS,
  USAGE_LINE_TITLE,
  USAGE_METER,
  chartRows,
  radarRows,
  toGroupedBarData,
  toRadarData,
  type AbRow,
  type ChartKind,
  type FigureId,
} from "@/data/jev"

type Props = {
  figure: FigureId
  kind: ChartKind
  rows: AbRow[]
}

const paperAxis = {
  stroke: "#333",
  fontSize: 12,
  tickLine: false,
}

export function FigureChart({ figure, kind, rows }: Props) {
  const barData = toGroupedBarData(chartRows(rows))
  const radarData = toRadarData(radarRows(rows))

  return (
    <div className="flex h-full w-full flex-col bg-white p-5 text-neutral-900">
      <p className="mb-3 text-center text-[13px] font-medium leading-snug">
        {FIGURE_TITLES[figure]}
      </p>
      {figure === "timing-200k" && kind === "bar" && (
        <p className="mb-2 text-center text-[11px] text-neutral-600">
          Shared collection {META.collectSecondsSharedExcluded} s excluded ·
          reported ratio {META.reportedSpeedupX}× with Jev · pool n=
          {META.poolN}
        </p>
      )}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {kind === "bar" ? (
            <BarChart
              data={barData}
              margin={{ top: 8, right: 16, left: 8, bottom: 48 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis
                dataKey="metric"
                {...paperAxis}
                interval={0}
                angle={-28}
                textAnchor="end"
                height={60}
              />
              <YAxis {...paperAxis} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey={SERIES_KEYS.without}
                fill={SERIES_COLORS[0]}
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey={SERIES_KEYS.with}
                fill={SERIES_COLORS[1]}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          ) : kind === "radar" ? (
            <RadarChart
              data={radarData}
              margin={{ top: 16, right: 40, left: 40, bottom: 16 }}
            >
              <PolarGrid stroke="#ccc" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 11, fill: "#333" }}
              />
              <PolarRadiusAxis
                angle={30}
                tick={{ fontSize: 10, fill: "#666" }}
              />
              <Tooltip />
              <Legend />
              <Radar
                name={SERIES_KEYS.without}
                dataKey={SERIES_KEYS.without}
                stroke={SERIES_COLORS[0]}
                fill={SERIES_COLORS[0]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Radar
                name={SERIES_KEYS.with}
                dataKey={SERIES_KEYS.with}
                stroke={SERIES_COLORS[1]}
                fill={SERIES_COLORS[1]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          ) : (
            <LineChart
              data={USAGE_METER}
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis dataKey="phase" {...paperAxis} />
              <YAxis
                {...paperAxis}
                domain={[30, 45]}
                label={{
                  value: "Weekly usage %",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12, fill: "#333" },
                }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="percent"
                name="Usage meter %"
                stroke={SERIES_COLORS[2]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      {kind === "line" && (
        <p className="mt-2 text-center text-[11px] text-neutral-600">
          {USAGE_LINE_TITLE}
        </p>
      )}
    </div>
  )
}
