import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { Segmented } from "./Segmented";
import { ACCENTS, SPEED_MAX, SPEED_MIN, SPEED_STEP } from "./settings";
import type { Settings } from "./settings";

type ControlsProps = {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
};

const frameOptions = [
  { value: "box", label: "Box" },
  { value: "corners", label: "Corners" },
  { value: "rule", label: "Rule" },
  { value: "none", label: "None" },
] as const satisfies readonly { value: Settings["frame"]; label: string }[];

const densityOptions = [
  { value: "compact", label: "Compact" },
  { value: "regular", label: "Regular" },
  { value: "roomy", label: "Roomy" },
] as const satisfies readonly { value: Settings["density"]; label: string }[];

const fontOptions = [
  { value: "mono", label: "Mono" },
  { value: "sans", label: "Sans" },
] as const satisfies readonly { value: Settings["font"]; label: string }[];

function formatSpeed(speed: number): string {
  return `${Number(speed.toFixed(2))}×`;
}

export function Controls({ settings, onChange }: ControlsProps) {
  const accentRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusAccent = (index: number) => {
    accentRefs.current[index]?.focus();
  };

  const moveAccent = (index: number, delta: number, event: KeyboardEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const next = (index + delta + ACCENTS.length) % ACCENTS.length;
    onChange({ accent: ACCENTS[next].id });
    requestAnimationFrame(() => focusAccent(next));
  };

  const moveAccentHome = (event: KeyboardEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onChange({ accent: ACCENTS[0].id });
    requestAnimationFrame(() => focusAccent(0));
  };

  const moveAccentEnd = (event: KeyboardEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onChange({ accent: ACCENTS[ACCENTS.length - 1].id });
    requestAnimationFrame(() => focusAccent(ACCENTS.length - 1));
  };

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-4 border-t border-[var(--border)] px-4 py-4">
      <div className="flex flex-col gap-2">
        <span id="accent-label" className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          Accent
        </span>
        <div role="radiogroup" aria-labelledby="accent-label" className="flex items-center gap-1.5">
          {ACCENTS.map((accent, index) => {
            const checked = accent.id === settings.accent;
            return (
              <button
                key={accent.id}
                ref={(el) => {
                  accentRefs.current[index] = el;
                }}
                type="button"
                role="radio"
                aria-checked={checked}
                aria-label={accent.label}
                tabIndex={checked ? 0 : -1}
                onClick={() => {
                  onChange({ accent: accent.id });
                  focusAccent(index);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                    moveAccent(index, 1, event);
                  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                    moveAccent(index, -1, event);
                  } else if (event.key === "Home") {
                    moveAccentHome(event);
                  } else if (event.key === "End") {
                    moveAccentEnd(event);
                  }
                }}
                className={`lab-press lab-hit grid h-7 w-7 place-items-center ${
                  checked ? "outline outline-[1.5px] outline-offset-[2px] outline-[var(--foreground)]" : ""
                }`}
              >
                <span
                  className="block h-4 w-4 bg-[var(--swatch)]"
                  style={{ "--swatch": accent.swatch } as React.CSSProperties}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span id="frame-label" className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          Frame
        </span>
        <Segmented
          label="Frame"
          value={settings.frame}
          options={frameOptions}
          onChange={(frame) => onChange({ frame })}
          size="sm"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span id="density-label" className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          Density
        </span>
        <Segmented
          label="Density"
          value={settings.density}
          options={densityOptions}
          onChange={(density) => onChange({ density })}
          size="sm"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span id="font-label" className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          Font
        </span>
        <Segmented
          label="Font"
          value={settings.font}
          options={fontOptions}
          onChange={(font) => onChange({ font })}
          size="sm"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span id="speed-label" className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          Speed
        </span>
        <div className="flex items-center gap-2">
          <input
            id="speed-range"
            type="range"
            min={SPEED_MIN}
            max={SPEED_MAX}
            step={SPEED_STEP}
            value={settings.speed}
            onChange={(event) => onChange({ speed: Number(event.target.value) })}
            aria-labelledby="speed-label"
            aria-valuetext={formatSpeed(settings.speed)}
            className="lab-range w-32"
          />
          <output htmlFor="speed-range" className="w-12 font-mono text-[13px] tabular-nums text-foreground">
            {formatSpeed(settings.speed)}
          </output>
        </div>
      </div>
    </div>
  );
}
