import { useId, useState } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DAYS, HOURLY } from "@/lib/brief-data";
import { cssColor, FillPattern, SERIES_COLORS } from "@/lib/dither";
import type { DitherColor } from "@/lib/dither";

const W = 960;
const PLOT_LEFT = 48;
const PLOT_RIGHT = W - 12;
const BASE_TOP = 52;
const ROW_GAP = 30;
const PEAK = 46;
const LAST_HOUR = 23;

const xAt = (hour: number): number =>
  PLOT_LEFT + (hour * (PLOT_RIGHT - PLOT_LEFT)) / LAST_HOUR;

const baselineAt = (row: number): number => BASE_TOP + row * ROW_GAP;

const round = (value: number): number => Math.round(value * 100) / 100;

const ridgeColor = (row: number, mono: boolean): DitherColor =>
  mono ? "ink" : SERIES_COLORS[row % SERIES_COLORS.length];

/** Catmull-Rom through every point, emitted as cubic Bézier segments. */
function smoothLine(points: readonly (readonly [number, number])[]): string {
  let d = `M ${round(points[0][0])} ${round(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(p2[0])} ${round(p2[1])}`;
  }
  return d;
}

export function HourlyRidgelines({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const [mono, setMono] = useState(false);
  const ticks = [0, 6, 12, 18, LAST_HOUR];

  return (
    <Card data-testid="ridgelines" className={className}>
      <CardHeader>
        <CardTitle>每小时阅读分布</CardTitle>
        <CardDescription>一行一天，越高越活跃</CardDescription>
        <CardAction>
          <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
            示例数据
          </span>
        </CardAction>
      </CardHeader>
      <CardContent>
        <svg
          viewBox={`0 0 ${W} 260`}
          className="h-64 w-full"
          role="img"
          aria-label="每小时阅读分布山脊图（示例数据）"
        >
          <defs>
            {DAYS.map((day, row) => (
              <FillPattern
                key={day}
                id={`${uid}-r${row}`}
                fill="gradient"
                color={ridgeColor(row, mono)}
                ramp={{ edge: "bottom", at: baselineAt(row), length: PEAK }}
              />
            ))}
          </defs>

          {DAYS.map((day, row) => (
            <text
              key={day}
              x={4}
              y={baselineAt(row) + 4}
              fontSize={11}
              className="fill-muted-foreground"
            >
              {day}
            </text>
          ))}

          {DAYS.map((day, row) => {
            const baseline = baselineAt(row);
            const line = smoothLine(
              HOURLY[row].map(
                (value, hour) => [xAt(hour), baseline - value * PEAK] as const,
              ),
            );
            const area = `${line} L ${PLOT_RIGHT} ${baseline} L ${PLOT_LEFT} ${baseline} Z`;
            return (
              <g key={day}>
                <path d={area} fill="var(--card)" />
                <path d={area} fill={`url(#${uid}-r${row})`} />
                <path
                  d={line}
                  fill="none"
                  stroke={cssColor(ridgeColor(row, mono))}
                  strokeWidth={1.25}
                />
              </g>
            );
          })}

          {ticks.map((hour) => (
            <text
              key={hour}
              x={xAt(hour)}
              y={baselineAt(DAYS.length - 1) + 16}
              fontSize={10}
              textAnchor={
                hour === 0 ? "start" : hour === LAST_HOUR ? "end" : "middle"
              }
              className="fill-muted-foreground"
            >
              {hour}时
            </text>
          ))}
        </svg>

        <div className="mt-3 flex items-center justify-end gap-2">
          <Label
            htmlFor="ridgelines-mono-toggle"
            className="text-xs text-muted-foreground"
          >
            单色
          </Label>
          <Switch
            id="ridgelines-mono-toggle"
            data-testid="ridgelines-mono"
            checked={mono}
            onCheckedChange={setMono}
          />
        </div>
      </CardContent>
    </Card>
  );
}
