import { useId, useState } from "react";

import { FillPattern, fillStyle } from "@/lib/dither";
import {
  ITEMS_PER_BRIEF,
  SOURCES,
  avgItems,
  totalItems,
} from "@/lib/brief-data";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const WIDTH = 560;
const HEIGHT = 220;
const PLOT_TOP = 16;
const PLOT_BOTTOM = 184;
const PLOT_HEIGHT = PLOT_BOTTOM - PLOT_TOP;
const PAD_X = 16;
const BAR_WIDTH = 40;

const STEP = (WIDTH - PAD_X * 2) / ITEMS_PER_BRIEF.length;
const MAX = Math.max(1, ...ITEMS_PER_BRIEF.map((entry) => entry.items));
const MAX_INDEX = ITEMS_PER_BRIEF.findIndex((entry) => entry.items === MAX);

const sourceTotal = SOURCES.reduce((sum, source) => sum + source.items, 0);

export function BriefBars({ className }: { className?: string }) {
  const rawId = useId();
  const id = rawId.replace(/:/g, "");
  const [active, setActive] = useState<number | null>(null);

  const activeEntry = active === null ? null : ITEMS_PER_BRIEF[active];

  return (
    <Card className={className} data-testid="brief-bars">
      <CardHeader>
        <CardTitle>每期早报条目</CardTitle>
        <CardDescription>
          近 7 天 · 合计 {totalItems()} 条 · 平均 {avgItems()} 条/期
        </CardDescription>
        <CardAction>
          <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
            示例数据
          </span>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-56 w-full"
          role="img"
          aria-label="每期早报条目柱状图（示例数据）"
        >
          <defs>
            <FillPattern id={`${id}-track`} fill="dotted" color="grey" />
            <FillPattern
              id={`${id}-bar`}
              fill="gradient"
              color="ink"
              ramp={{ edge: "bottom", at: PLOT_BOTTOM, length: PLOT_HEIGHT }}
            />
            <FillPattern
              id={`${id}-max`}
              fill="gradient"
              color="blue"
              ramp={{ edge: "bottom", at: PLOT_BOTTOM, length: PLOT_HEIGHT }}
            />
          </defs>

          <g role="list">
            {ITEMS_PER_BRIEF.map((entry, index) => {
              const height = Math.max(2, (entry.items / MAX) * PLOT_HEIGHT);
              const x = PAD_X + index * STEP + (STEP - BAR_WIDTH) / 2;
              const y = PLOT_BOTTOM - height;
              const centre = x + BAR_WIDTH / 2;
              const isMax = index === MAX_INDEX;
              return (
                <g
                  key={entry.day}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${entry.day} ${entry.items} 条`}
                  className="outline-none"
                  onMouseEnter={() => setActive(index)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(index)}
                  onBlur={() => setActive(null)}
                >
                  <rect
                    x={x}
                    y={PLOT_TOP}
                    width={BAR_WIDTH}
                    height={PLOT_HEIGHT}
                    rx={3}
                    fill={`url(#${id}-track)`}
                    opacity={active === index ? 0.9 : 0.5}
                  />
                  <rect
                    x={x}
                    y={y}
                    width={BAR_WIDTH}
                    height={height}
                    rx={3}
                    fill={`url(#${isMax ? `${id}-max` : `${id}-bar`})`}
                  />
                  <text
                    x={centre}
                    y={Math.max(y - 6, 12)}
                    textAnchor="middle"
                    fontSize={12}
                    fill="currentColor"
                    className="tabular-nums"
                  >
                    {entry.items}
                  </text>
                  <text
                    x={centre}
                    y={PLOT_BOTTOM + 20}
                    textAnchor="middle"
                    fontSize={12}
                    className="fill-muted-foreground"
                  >
                    {entry.day}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        <p className="text-xs text-muted-foreground tabular-nums">
          {activeEntry ? `${activeEntry.day}: ${activeEntry.items} 条` : "悬停柱子查看数值"}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {SOURCES.map((source) => (
            <span
              key={source.name}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                className="inline-block size-2.5 shrink-0 rounded-sm"
                style={fillStyle("solid", { color: source.color })}
              />
              <span className="tabular-nums">
                {source.name} {source.items}
              </span>
            </span>
          ))}
        </div>

        <div className="flex h-3 overflow-hidden rounded-sm">
          {SOURCES.map((source) => (
            <div
              key={source.name}
              style={{
                width: `${(source.items / sourceTotal) * 100}%`,
                ...fillStyle("gradient", {
                  color: source.color,
                  edge: "left",
                  length: 32,
                  to: 0.25,
                }),
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
