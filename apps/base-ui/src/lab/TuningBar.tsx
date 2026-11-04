import type { CSSProperties } from "react"
import { Select } from "@base-ui/react/select"
import { Slider } from "@base-ui/react/slider"
import { Switch } from "@base-ui/react/switch"
import { Check, ChevronsUpDown, Copy, Moon, Sun } from "lucide-react"
import type { Origin, Tuning } from "./tuning"
import { EASINGS } from "./tuning"

const ORIGINS: { id: Origin; label: string }[] = [
  { id: "trigger", label: "Trigger" },
  { id: "center", label: "Center" },
  { id: "top", label: "Top" },
]

const HUE_TRACK = `linear-gradient(90deg, ${Array.from(
  { length: 13 },
  (_, index) => `oklch(0.7 0.15 ${index * 30})`,
).join(", ")})`

function curvePath(id: string): string {
  const value = EASINGS.find((item) => item.id === id)?.value ?? "ease"

  let points: number[]
  if (value.startsWith("cubic-bezier(")) {
    points = value
      .slice("cubic-bezier(".length, -1)
      .split(",")
      .map((part) => Number(part.trim()))
  } else if (value === "linear") {
    points = [0, 0, 1, 1]
  } else {
    points = [0.25, 0.1, 0.25, 1]
  }

  const [x1, y1, x2, y2] = points
  const width = 48
  const height = 20
  const pad = 2
  const sx = (x: number) => pad + x * (width - pad * 2)
  const sy = (y: number) => height - pad - y * (height - pad * 2)

  return `M ${sx(0)} ${sy(0)} C ${sx(x1)} ${sy(y1)}, ${sx(x2)} ${sy(y2)}, ${sx(1)} ${sy(1)}`
}

function CurvePreview({ id }: { id: string }) {
  return (
    <svg width="48" height="20" viewBox="0 0 48 20" aria-hidden="true" style={{ display: "block" }}>
      <path
        d={curvePath(id)}
        fill="none"
        stroke="var(--lab-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

type LabSliderProps = {
  value: number
  min: number
  max: number
  step: number
  label: string
  valueText: (value: number) => string
  largeStep?: number
  onValueChange: (value: number) => void
  trackStyle?: CSSProperties
}

function LabSlider({ value, min, max, step, label, valueText, largeStep, onValueChange, trackStyle }: LabSliderProps) {
  return (
    <Slider.Root
      className="lab-slider"
      value={value}
      min={min}
      max={max}
      step={step}
      largeStep={largeStep}
      onValueChange={(next) => onValueChange(typeof next === "number" ? next : next[0])}
    >
      <Slider.Control className="lab-slider-control">
        <Slider.Track className="lab-slider-track" style={trackStyle}>
          <Slider.Indicator className="lab-slider-indicator" />
          <Slider.Thumb
            className="lab-slider-thumb"
            aria-label={label}
            getAriaValueText={(_, v) => valueText(v)}
          />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  )
}

type TuningBarProps = {
  tuning: Tuning
  onChange: (next: Tuning) => void
  inspect: boolean
  onInspect: (next: boolean) => void
  onCopy: () => void
  copied: boolean
  dark: boolean
  onDark: () => void
}

export function TuningBar({
  tuning,
  onChange,
  inspect,
  onInspect,
  onCopy,
  copied,
  dark,
  onDark,
}: TuningBarProps) {
  const easingLabel = EASINGS.find((item) => item.id === tuning.easing)?.label ?? tuning.easing

  return (
    <header className="lab-bar">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold">Base UI</span>
            <a
              href="https://base-ui.com"
              target="_blank"
              rel="noreferrer"
              className="lab-muted text-xs hover:underline"
            >
              base-ui.com
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="lab-muted lab-switch-row flex items-center gap-2 text-xs">
              <Switch.Root
                className="lab-switch"
                checked={tuning.slow}
                onCheckedChange={(checked) => onChange({ ...tuning, slow: checked })}
              >
                <Switch.Thumb className="lab-switch-thumb" />
              </Switch.Root>
              Slow ×5
            </label>

            <label className="lab-muted lab-switch-row flex items-center gap-2 text-xs">
              <Switch.Root
                className="lab-switch"
                checked={inspect}
                onCheckedChange={onInspect}
              >
                <Switch.Thumb className="lab-switch-thumb" />
              </Switch.Root>
              States
            </label>

            <button
              type="button"
              className="lab-btn lab-btn-icon"
              aria-label="Toggle theme"
              onClick={onDark}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button type="button" className="lab-btn" onClick={onCopy}>
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Copied" : "Copy CSS"}
            </button>
            <span role="status" aria-live="polite" className="sr-only">
              {copied ? "CSS copied to clipboard" : ""}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="lab-muted text-xs">Duration</span>
              <span className="lab-num text-xs">
                {tuning.duration}ms{tuning.slow ? " ×5" : ""}
              </span>
            </div>
            <LabSlider
              label="Duration"
              valueText={(v) => `${v} milliseconds`}
              min={0}
              max={1200}
              step={10}
              value={tuning.duration}
              onValueChange={(value) => onChange({ ...tuning, duration: value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="lab-muted flex items-center gap-1.5 text-xs">
                Easing
                <CurvePreview id={tuning.easing} />
              </span>
              <span className="text-xs">{easingLabel}</span>
            </div>
            <Select.Root
              items={EASINGS.map((item) => ({ label: item.label, value: item.id }))}
              value={tuning.easing}
              onValueChange={(value) => onChange({ ...tuning, easing: String(value) })}
            >
              <Select.Trigger
                className="lab-btn w-full justify-between"
                aria-label="Easing"
              >
                {easingLabel}
                <Select.Icon>
                  <ChevronsUpDown size={14} />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Positioner sideOffset={6} alignItemWithTrigger={false}>
                  <Select.Popup className="lab-popup">
                    <Select.List>
                      {EASINGS.map((item) => (
                        <Select.Item key={item.id} value={item.id} className="lab-item">
                          <Select.ItemIndicator>
                            <Check size={14} />
                          </Select.ItemIndicator>
                          <Select.ItemText>{item.label}</Select.ItemText>
                          <span className="lab-num ml-auto text-[11px] opacity-60">
                            {item.value}
                          </span>
                        </Select.Item>
                      ))}
                    </Select.List>
                  </Select.Popup>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="lab-muted text-xs">Scale / origin</span>
              <span className="lab-num text-xs">{tuning.scale.toFixed(2)}</span>
            </div>
            <LabSlider
              label="Scale"
              valueText={(v) => `${v.toFixed(2)} times`}
              largeStep={0.02}
              min={0.5}
              max={1}
              step={0.01}
              value={tuning.scale}
              onValueChange={(value) =>
                onChange({ ...tuning, scale: Math.round(value * 100) / 100 })
              }
            />
            <div className="flex gap-1">
              {ORIGINS.map((origin) => (
                <button
                  key={origin.id}
                  type="button"
                  className="lab-btn lab-btn-sm flex-1"
                  aria-pressed={tuning.origin === origin.id}
                  onClick={() => onChange({ ...tuning, origin: origin.id })}
                >
                  {origin.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="lab-muted text-xs">Radius</span>
              <span className="lab-num text-xs">{tuning.radius}px</span>
            </div>
            <LabSlider
              label="Radius"
              valueText={(v) => `${v} pixels`}
              min={0}
              max={28}
              step={1}
              value={tuning.radius}
              onValueChange={(value) => onChange({ ...tuning, radius: value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="lab-muted text-xs">Shadow</span>
              <span className="lab-num text-xs">{tuning.shadow}</span>
            </div>
            <LabSlider
              label="Shadow"
              valueText={(v) => `${v} percent`}
              min={0}
              max={100}
              step={1}
              value={tuning.shadow}
              onValueChange={(value) => onChange({ ...tuning, shadow: value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="lab-muted text-xs">Hue</span>
              <span className="lab-num text-xs">{tuning.hue}°</span>
            </div>
            <LabSlider
              label="Hue"
              valueText={(v) => `${v} degrees`}
              min={0}
              max={360}
              step={1}
              value={tuning.hue}
              onValueChange={(value) => onChange({ ...tuning, hue: value })}
              trackStyle={{ background: HUE_TRACK }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
