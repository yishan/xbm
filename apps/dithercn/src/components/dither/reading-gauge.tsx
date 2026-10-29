import { useId, useState } from "react";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { DitherShader, FillPattern } from "@/lib/dither";
import { READING } from "@/lib/brief-data";
import { cn } from "@/lib/utils";

const GAUGE_GLOW = `
float field(vec2 uv, vec2 res, float t) {
  float aspect = res.x / res.y;
  vec2 c = vec2((uv.x - 0.5) * aspect, uv.y - 0.15);
  float breathe = 1.0 + sin(t * 0.6) * 0.04;
  float sigma = (0.16 + 0.14 * clamp(gaugeLevel, 0.0, 1.0)) * breathe;
  float glow = exp(-dot(c, c) / (2.0 * sigma * sigma));
  return clamp(glow, 0.0, 1.0) * 0.55;
}
`;

const CX = 120;
const CY = 128;
const R = 96;
const HALF = 11;

const polar = (cx: number, cy: number, r: number, a: number): [number, number] => [
  cx + r * Math.cos(a),
  cy - r * Math.sin(a),
];

function sectorPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  a0: number,
  a1: number,
): string {
  const p = (r: number, a: number) =>
    polar(cx, cy, r, a)
      .map((n) => n.toFixed(2))
      .join(" ");
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return [
    `M ${p(rOuter, a0)}`,
    `A ${rOuter} ${rOuter} 0 ${large} 0 ${p(rOuter, a1)}`,
    `L ${p(rInner, a1)}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${p(rInner, a0)}`,
    "Z",
  ].join(" ");
}

const TICKS = Array.from({ length: 7 }, (_, i) => i * 10);

export function ReadingGauge({ animate = true, className }: { animate?: boolean; className?: string }) {
  const [minutes, setMinutes] = useState(READING.minutes);
  const rawId = useId().replace(/:/g, "");
  const trackId = `${rawId}-track`;
  const valueId = `${rawId}-value`;

  const fraction = Math.min(1, Math.max(0, minutes / READING.goal));

  return (
    <Card data-testid="reading-gauge" className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>阅读时长</CardTitle>
        <CardDescription>今日 vs 目标</CardDescription>
        <CardAction>
          <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
            示例数据
          </span>
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="relative">
          <DitherShader
            field={GAUGE_GLOW}
            uniforms={{ gaugeLevel: fraction }}
            palette={["--dither-paper", "green"]}
            cell={3}
            animate={animate}
            stillTime={4}
            className="absolute inset-0 opacity-40 [mask-image:radial-gradient(closest-side,black,transparent)]"
          />
          <svg
            viewBox="0 0 240 134"
            className="relative mx-auto block h-40 w-full max-w-[280px]"
            role="img"
            aria-label={`阅读时长 ${minutes} / ${READING.goal} 分钟（示例数据）`}
          >
            <defs>
              <FillPattern id={trackId} fill="dotted" color="grey" />
              <FillPattern
                id={valueId}
                fill="gradient"
                color="green"
                ramp={{ edge: "left", at: 24, length: 192 }}
              />
            </defs>

            <path
              d={sectorPath(CX, CY, R + HALF, R - HALF, 0, Math.PI)}
              fill={`url(#${trackId})`}
              opacity={0.6}
            />
            {fraction > 0.001 && (
              <path
                d={sectorPath(CX, CY, R + HALF, R - HALF, Math.PI * (1 - fraction), Math.PI)}
                fill={`url(#${valueId})`}
              />
            )}

            {TICKS.map((m) => {
              const a = Math.PI * (1 - m / 60);
              const [x1, y1] = polar(CX, CY, 111, a);
              const [x2, y2] = polar(CX, CY, 118, a);
              return (
                <line
                  key={m}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  strokeOpacity={0.3}
                  strokeWidth={1.5}
                />
              );
            })}

          </svg>
        </div>

        <div className="mt-2 text-center">
          <p className="text-3xl font-semibold leading-none tabular-nums">{minutes}</p>
          <p className="mt-1 text-xs text-muted-foreground">/ {READING.goal} 分钟</p>
        </div>

        <div className="mt-4 space-y-2">
          <Slider
            value={[minutes]}
            onValueChange={(v) => setMinutes(v[0])}
            min={0}
            max={60}
            step={1}
            aria-label="调整阅读分钟"
            data-testid="gauge-slider"
          />
          <p className="text-xs text-muted-foreground">拖动滑块：FillPattern 弧形实时更新</p>
        </div>
      </CardContent>
    </Card>
  );
}
