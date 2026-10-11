import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Cloud, CloudLightning, CloudRain, Droplets, MapPin, Sun, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeatherProps } from "./types";

type Condition = WeatherProps["condition"];
type Unit = "C" | "F";

const CONDITION_META: Record<Condition, { label: string; icon: LucideIcon; tint: string }> = {
  sunny: { label: "晴", icon: Sun, tint: "text-amber-500" },
  cloudy: { label: "多云", icon: Cloud, tint: "text-neutral-400" },
  rain: { label: "雨", icon: CloudRain, tint: "text-sky-500" },
  storm: { label: "雷暴", icon: CloudLightning, tint: "text-violet-500" },
};

function convert(celsius: number, unit: Unit): number {
  return Math.round(unit === "C" ? celsius : (celsius * 9) / 5 + 32);
}

export function WeatherCard({ city, tempC, condition, humidity, windKph, forecast }: WeatherProps) {
  const [unit, setUnit] = useState<Unit>("C");

  const meta = CONDITION_META[condition];
  const CurrentIcon = meta.icon;

  const lows = forecast.map((day) => day.lowC);
  const highs = forecast.map((day) => day.highC);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const span = Math.max(max - min, 1);

  return (
    <div className="w-full rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-900 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-neutral-500">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate font-medium text-neutral-900">{city}</span>
          </div>
          <div className="mt-0.5 text-xs text-neutral-500">{meta.label}</div>
        </div>
        <button
          type="button"
          data-testid="unit-toggle"
          aria-label="切换温度单位"
          onClick={() => setUnit((current) => (current === "C" ? "F" : "C"))}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium tabular-nums transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40"
        >
          <span className={cn(unit === "C" ? "text-neutral-900" : "text-neutral-400")}>°C</span>
          <span className="text-neutral-300">/</span>
          <span className={cn(unit === "F" ? "text-neutral-900" : "text-neutral-400")}>°F</span>
        </button>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <CurrentIcon className={cn("size-12 shrink-0", meta.tint)} strokeWidth={1.5} />
          <div className="flex items-baseline gap-0.5">
            <span className="text-4xl font-semibold tracking-tight tabular-nums">
              {convert(tempC, unit)}
            </span>
            <span className="text-lg text-neutral-400">°{unit}</span>
          </div>
        </div>
        <dl className="flex shrink-0 flex-col items-end gap-1 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <Droplets className="size-3.5 text-sky-400" />
            <dt className="sr-only">湿度</dt>
            <dd>湿度 {humidity}%</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="size-3.5 text-neutral-400" />
            <dt className="sr-only">风速</dt>
            <dd>风速 {windKph} km/h</dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 border-t border-neutral-100 pt-3">
        <div className="grid grid-cols-4 gap-2">
          {forecast.map((day) => {
            const dayMeta = CONDITION_META[day.condition];
            const DayIcon = dayMeta.icon;
            const left = ((day.lowC - min) / span) * 100;
            const width = ((day.highC - day.lowC) / span) * 100;
            return (
              <div key={day.day} className="flex flex-col items-center gap-1.5">
                <span className="w-full truncate text-center text-xs text-neutral-500">{day.day}</span>
                <DayIcon className={cn("size-4", dayMeta.tint)} strokeWidth={1.75} />
                <div className="w-full">
                  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="absolute inset-y-0 rounded-full bg-gradient-to-r from-sky-300 to-amber-300"
                      style={{ left: `${left}%`, width: `${Math.max(width, 8)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] tabular-nums">
                    <span className="text-neutral-400">{convert(day.lowC, unit)}°</span>
                    <span className="font-medium text-neutral-700">{convert(day.highC, unit)}°</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
