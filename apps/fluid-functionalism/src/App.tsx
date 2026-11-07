import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { MotionConfig } from "motion/react"
import { Switch } from "@/components/ui/switch"
import { ShapeProvider, useShapeContext } from "@/lib/shape-context"
import { SizeProvider } from "@/lib/size-context"
import { SurfaceProvider } from "@/lib/surface-context"
import { surfaceClasses } from "@/lib/surface-classes"
import { Board } from "./lab/Board"
import {
  DEFAULT_TUNING,
  DENSITIES,
  SHAPES,
  SPEED_PRESETS,
  accentCss,
  applySpringScale,
  effectiveScale,
  springReadout,
  toSnippet,
  type Density,
  type ShapeName,
  type SpeedPreset,
  type Tuning,
} from "./lab/tuning"
import "./lab/lab.css"

type ThemeChoice = "system" | "light" | "dark"

export default function App() {
  return (
    <ShapeProvider defaultShape="rounded">
      <Lab />
    </ShapeProvider>
  )
}

function Lab() {
  const [tuning, setTuning] = useState<Tuning>(DEFAULT_TUNING)
  const [theme, setTheme] = useState<ThemeChoice>("system")
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  const [copied, setCopied] = useState(false)
  const [nudge, setNudge] = useState(0)
  const { setShape, shape, classes } = useShapeContext()
  const copyTimer = useRef(0)

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onMotion = () => setReduced(motion.matches)
    motion.addEventListener("change", onMotion)
    return () => motion.removeEventListener("change", onMotion)
  }, [])

  useEffect(() => {
    if (shape !== tuning.shape) setShape(tuning.shape)
  }, [shape, setShape, tuning.shape])

  const scale = effectiveScale(tuning.speed, tuning.slow, reduced)

  useLayoutEffect(() => {
    applySpringScale(scale)
  }, [scale])

  useLayoutEffect(() => {
    document.documentElement.style.setProperty("--fluid-accent", accentCss(tuning.hue))
  }, [tuning.hue])

  useLayoutEffect(() => {
    const root = document.documentElement
    const next = theme === "system" ? null : theme
    const hasLight = root.classList.contains("light")
    const hasDark = root.classList.contains("dark")
    const same =
      (next === "light" && hasLight && !hasDark) ||
      (next === "dark" && hasDark && !hasLight) ||
      (next === null && !hasLight && !hasDark)
    if (same) return
    const style = document.createElement("style")
    style.appendChild(document.createTextNode("*,*::before,*::after{transition:none!important;animation:none!important}"))
    document.head.appendChild(style)
    root.classList.remove("light", "dark")
    if (next) root.classList.add(next)
    void getComputedStyle(root).color
    requestAnimationFrame(() => {
      requestAnimationFrame(() => style.remove())
    })
  }, [theme])

  const motionSeed = `${tuning.speed}:${tuning.slow}:${reduced}`
  const seenSeed = useRef(motionSeed)
  useEffect(() => {
    if (seenSeed.current === motionSeed) return
    seenSeed.current = motionSeed
    setNudge((value) => value + 1)
  }, [motionSeed])

  const readout = springReadout(scale)

  function patch(next: Partial<Tuning>) {
    setCopied(false)
    setTuning((current) => ({ ...current, ...next }))
  }

  function reset() {
    setCopied(false)
    setTheme("system")
    setTuning(DEFAULT_TUNING)
  }

  async function copySnippet() {
    const text = toSnippet(tuning, reduced)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const area = document.createElement("textarea")
      area.value = text
      area.setAttribute("readonly", "")
      document.body.appendChild(area)
      area.select()
      document.execCommand("copy")
      area.remove()
    }
    setCopied(true)
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <MotionConfig reducedMotion={reduced ? "always" : "user"} skipAnimations={reduced}>
      <main className="lab">
        <header className="top">
          <div className="brand">
            <h1>Fluid Functionalism</h1>
            <a href="https://fluidfunctionalism.com">站点</a>
            <a href="https://github.com/mickadesign/fluid-functionalism">源代码</a>
          </div>
          <div className="actions">
            <button type="button" className="hit" aria-pressed={theme === "light"} onClick={() => setTheme((value) => (value === "light" ? "system" : "light"))}>
              浅色
            </button>
            <button type="button" className="hit" aria-pressed={theme === "dark"} onClick={() => setTheme((value) => (value === "dark" ? "system" : "dark"))}>
              深色
            </button>
            <button type="button" className="hit" onClick={() => void copySnippet()}>
              复制主题
            </button>
            <button type="button" className="hit" onClick={reset}>
              重置
            </button>
          </div>
        </header>
        <p className="sr-only" aria-live="polite">{copied ? "已复制" : ""}</p>

        <form className="tune" aria-label="调节" onSubmit={(event) => event.preventDefault()}>
          <div className="tune-line">
            <span id="speed-label">弹簧</span>
            <div className="segs" role="radiogroup" aria-labelledby="speed-label">
              {SPEED_PRESETS.map((preset) => (
                <label key={preset} className="seg">
                  <input
                    type="radio"
                    name="speed"
                    checked={tuning.speed === preset}
                    onChange={() => patch({ speed: preset })}
                  />
                  {speedLabel(preset)}
                </label>
              ))}
            </div>
            <Switch className="min-h-11" label="慢动作" checked={tuning.slow} onToggle={() => patch({ slow: !tuning.slow })} />
          </div>

          <div className="tune-line">
            <RangeField
              label="色相"
              min={0}
              max={360}
              value={tuning.hue}
              onChange={(hue) => patch({ hue })}
            />
            <RangeField
              label="表面"
              min={1}
              max={8}
              value={tuning.surface}
              onChange={(surface) => patch({ surface })}
            />
            <RangeField
              label="接近"
              min={0}
              max={80}
              value={tuning.proximity}
              suffix="px"
              onChange={(proximity) => patch({ proximity })}
            />
          </div>

          <div className="tune-line">
            <span id="density-label">密度</span>
            <div className="segs" role="radiogroup" aria-labelledby="density-label">
              {DENSITIES.map((density) => (
                <label key={density} className="seg">
                  <input
                    type="radio"
                    name="density"
                    checked={tuning.density === density}
                    onChange={() => patch({ density })}
                  />
                  {densityLabel(density)}
                </label>
              ))}
            </div>
            <span id="shape-label">圆角</span>
            <div className="segs" role="radiogroup" aria-labelledby="shape-label">
              {SHAPES.map((name) => (
                <label key={name} className="seg">
                  <input
                    type="radio"
                    name="shape"
                    checked={tuning.shape === name}
                    onChange={() => patch({ shape: name })}
                  />
                  {shapeLabel(name)}
                </label>
              ))}
            </div>
          </div>

          <p className="readout">
            快 {readout.fast}　中 {readout.moderate}　慢 {readout.slow}
          </p>
        </form>

        <section className={`stage ${classes.container} ${surfaceClasses(tuning.surface)}`}>
          <SurfaceProvider value={tuning.surface}>
            <SizeProvider size={tuning.density}>
              <Board proximity={tuning.proximity} reduced={reduced} nudge={nudge} />
            </SizeProvider>
          </SurfaceProvider>
        </section>
      </main>
    </MotionConfig>
  )
}

function RangeField({
  label,
  min,
  max,
  value,
  suffix,
  onChange,
}: {
  label: string
  min: number
  max: number
  value: number
  suffix?: string
  onChange: (value: number) => void
}) {
  const id = `range-${label}`
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        className="lab-range"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="num">
        {value}
        {suffix ?? ""}
      </span>
    </label>
  )
}

function speedLabel(preset: SpeedPreset): string {
  switch (preset) {
    case "snappy":
      return "迅捷"
    case "standard":
      return "标准"
    case "soft":
      return "柔和"
    default: {
      const unexpected: never = preset
      return unexpected
    }
  }
}

function densityLabel(density: Density): string {
  switch (density) {
    case "default":
      return "常规"
    case "compact":
      return "紧凑"
    default: {
      const unexpected: never = density
      return unexpected
    }
  }
}

function shapeLabel(name: ShapeName): string {
  switch (name) {
    case "sharp":
      return "直角"
    case "rounded":
      return "圆角"
    case "pill":
      return "胶囊"
    default: {
      const unexpected: never = name
      return unexpected
    }
  }
}
