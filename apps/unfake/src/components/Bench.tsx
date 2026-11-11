import { useId, type ReactNode } from "react"
import type { Denoise, DownscaleMethod, PixelSettings, VectorSettings } from "../engine/pipeline"
import type { ResultView, SampleId } from "../hooks/use-lab"
import { sampleList } from "../hooks/use-lab"

type Props = {
  mode: "pixel" | "vector"
  pixel: PixelSettings
  vector: VectorSettings
  sourceName: SampleId | "file"
  result: ResultView | null
  note: string
  grid: boolean
  onPixel: (next: PixelSettings) => void
  onVector: (next: VectorSettings) => void
  onSample: (id: SampleId) => void
  onOpen: () => void
  onGrid: (on: boolean) => void
  onSwap: (from: string, to: string) => void
  onExportPng: (kind: "native" | "upscale") => void
  onExportSvg: () => void
  onCopy: () => void
}

const DOWNSCALE: { id: DownscaleMethod; name: string }[] = [
  { id: "dominant", name: "主色" },
  { id: "median", name: "中值" },
  { id: "adaptive", name: "自适应" },
  { id: "nearest", name: "最近" },
]

const DENOISE: { id: Denoise; name: string }[] = [
  { id: "off", name: "关" },
  { id: "bilateral", name: "双边" },
  { id: "median", name: "中值" },
]

export function Bench(props: Props) {
  const shownScale = props.pixel.scaleMode === "auto" ? (props.result?.scale ?? props.pixel.manualScale) : props.pixel.manualScale
  return (
    <aside className="bench">
      <div className="bench-body">
      <p className="status" aria-live="polite">
        {props.note}
      </p>
      <div className="row">
        <button type="button" onClick={props.onOpen}>
          打开
        </button>
        <button type="button" disabled={!props.result} onClick={() => props.onExportPng("native")}>
          1× PNG
        </button>
        <button type="button" disabled={!props.result} onClick={() => props.onExportPng("upscale")}>
          放大 PNG
        </button>
        <button type="button" disabled={!props.result} onClick={props.onExportSvg}>
          SVG
        </button>
        <button type="button" onClick={props.onCopy}>
          设置
        </button>
      </div>
      <div className="field">
        <span className="field-label">示例数据</span>
        <div className="samples">
          {sampleList().map((sample) => (
            <button
              key={sample.id}
              type="button"
              className="sample"
              aria-pressed={props.sourceName === sample.id}
              aria-label={`示例数据 ${sample.name}`}
              onClick={() => props.onSample(sample.id)}
            >
              <img src={`${import.meta.env.BASE_URL}samples/${sample.file}`} alt="" />
              <span>{sample.name}</span>
            </button>
          ))}
        </div>
      </div>
      {props.mode === "pixel" ? (
        <PixelFields
          pixel={props.pixel}
          shownScale={shownScale}
          grid={props.grid}
          onPixel={props.onPixel}
          onGrid={props.onGrid}
        />
      ) : (
        <VectorFields vector={props.vector} onVector={props.onVector} />
      )}
      <div className="palette" aria-label="调色">
        {(props.result?.palette ?? []).map((color) => (
          <label key={color} className="chip" style={{ background: color }}>
            <input
              type="color"
              value={color}
              aria-label={`调色 ${color}`}
              onChange={(event) => props.onSwap(color, event.target.value)}
            />
          </label>
        ))}
      </div>
      </div>
      <p className="credit">
        <a href="https://github.com/jenissimo/unfake.js" rel="noreferrer">
          unfake.js
        </a>
      </p>
    </aside>
  )
}

function PixelFields({
  pixel,
  shownScale,
  grid,
  onPixel,
  onGrid,
}: {
  pixel: PixelSettings
  shownScale: number
  grid: boolean
  onPixel: (next: PixelSettings) => void
  onGrid: (on: boolean) => void
}) {
  return (
    <>
      <Slider
        label="倍率"
        min={2}
        max={32}
        value={shownScale}
        suffix={
          <button
            type="button"
            aria-pressed={pixel.scaleMode === "auto"}
            onClick={() => onPixel({ ...pixel, scaleMode: pixel.scaleMode === "auto" ? "manual" : "auto" })}
          >
            自动
          </button>
        }
        onChange={(manualScale) => onPixel({ ...pixel, scaleMode: "manual", manualScale })}
      />
      <Segment
        label="取样"
        value={pixel.downscale}
        options={DOWNSCALE}
        onChange={(downscale) => onPixel({ ...pixel, downscale })}
      />
      <Slider label="颜色" min={2} max={48} value={pixel.maxColors} onChange={(maxColors) => onPixel({ ...pixel, maxColors })} />
      <Slider
        label="透明"
        min={0}
        max={255}
        value={pixel.alphaThreshold}
        onChange={(alphaThreshold) => onPixel({ ...pixel, alphaThreshold })}
      />
      <div className="row">
        <Switch label="去杂点" on={pixel.morph} onChange={(morph) => onPixel({ ...pixel, morph })} />
        <Switch label="去斜刺" on={pixel.jaggy} onChange={(jaggy) => onPixel({ ...pixel, jaggy })} />
        <Switch label="网格" on={grid} onChange={onGrid} />
      </div>
    </>
  )
}

function VectorFields({ vector, onVector }: { vector: VectorSettings; onVector: (next: VectorSettings) => void }) {
  return (
    <>
      <Segment label="去噪" value={vector.denoise} options={DENOISE} onChange={(denoise) => onVector({ ...vector, denoise })} />
      <Slider
        label="强度"
        min={3}
        max={11}
        step={2}
        value={vector.denoiseSize % 2 === 0 ? vector.denoiseSize + 1 : vector.denoiseSize}
        onChange={(denoiseSize) => onVector({ ...vector, denoiseSize })}
      />
      <Slider label="颜色" min={2} max={32} value={vector.maxColors} onChange={(maxColors) => onVector({ ...vector, maxColors })} />
      <Slider label="平滑" min={0} max={4} value={vector.smooth} onChange={(smooth) => onVector({ ...vector, smooth })} />
      <Slider label="细节" min={0} max={100} value={vector.detail} onChange={(detail) => onVector({ ...vector, detail })} />
    </>
  )
}

function Slider({
  label,
  min,
  max,
  value,
  step,
  onChange,
  suffix,
}: {
  label: string
  min: number
  max: number
  value: number
  step?: number
  onChange: (value: number) => void
  suffix?: ReactNode
}) {
  const id = useId()
  return (
    <div className="field">
      <div className="field-label">
        <label htmlFor={id}>{label}</label>
        <span className="num">{value}</span>
        {suffix}
      </div>
      <input
        id={id}
        className="range"
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}

function Segment<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { id: T; name: string }[]
  onChange: (id: T) => void
}) {
  const labelId = useId()
  return (
    <div className="field">
      <span className="field-label" id={labelId}>
        {label}
      </span>
      <div className="segment" role="radiogroup" aria-labelledby={labelId}>
        {options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={value === option.id}
            onClick={() => onChange(option.id)}
            onKeyDown={(event) => {
              if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
              event.preventDefault()
              const dir = event.key === "ArrowRight" ? 1 : -1
              const next = (index + dir + options.length) % options.length
              onChange(options[next].id)
              const buttons = event.currentTarget.parentElement?.querySelectorAll("button")
              buttons?.[next]?.focus()
            }}
          >
            {option.name}
          </button>
        ))}
      </div>
    </div>
  )
}

function Switch({ label, on, onChange }: { label: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} className="switch" onClick={() => onChange(!on)}>
      <span>{label}</span>
      <i />
    </button>
  )
}
