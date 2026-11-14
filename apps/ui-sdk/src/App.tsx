import { useEffect, useState } from "react"
import { ASKS, OWNERS, REQUIREMENTS, TAGS, type Ask, visibleRequirements } from "./board"
import { CodePanel } from "./ui/CodePanel"
import { FieldControl, type FieldItem } from "./ui/FieldControl"
import { Inspector } from "./ui/Inspector"
import { RankList } from "./ui/RankList"

type Theme = "system" | "light" | "dark"
type Density = "compact" | "regular" | "loose"
type Motion = "short" | "off"

type Flags = {
  popup: boolean
  multiple: boolean
  typeahead: boolean
  recovery: boolean
}

const LAB = [
  { id: "owner", label: "负责人", items: ["林夏", "周衡", "陈予", "苏晚"] },
  { id: "status", label: "状态", items: ["待做", "进行中", "复核", "完成"] },
  { id: "env", label: "环境", items: ["开发", "预览", "线上"] },
] as const

const THEME_KEY = "ui-sdk-theme"

function initialTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === "light" || stored === "dark" || stored === "system") return stored
  } catch {
    /* ignore */
  }
  return "system"
}

function toItems(labels: readonly string[]): FieldItem[] {
  return labels.map((label) => ({ id: label, label }))
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [radius, setRadius] = useState(8)
  const [density, setDensity] = useState<Density>("regular")
  const [motion, setMotion] = useState<Motion>("short")
  const [flags, setFlags] = useState<Flags>({
    popup: false,
    multiple: false,
    typeahead: true,
    recovery: true,
  })
  const [pools, setPools] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(LAB.map((field) => [field.id, [...field.items]])),
  )
  const [picked, setPicked] = useState<Record<string, string[]>>({ owner: [], status: [], env: [] })
  const [ask, setAsk] = useState<Ask>("owner")
  const [owner, setOwner] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [order, setOrder] = useState<string[]>(() => REQUIREMENTS.map((item) => item.id))
  const [labRoot, setLabRoot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    if (theme !== "system") root.classList.add(theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.density = density
    root.dataset.motion = motion
    root.style.setProperty("--radius", `${radius}px`)
  }, [density, motion, radius])

  useEffect(() => {
    const root = document.documentElement
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Tab" || event.key.startsWith("Arrow") || event.key === " " || event.key === "Enter") {
        root.dataset.input = "key"
      }
    }
    const onPointer = () => {
      root.dataset.input = "pointer"
    }
    window.addEventListener("keydown", onKey, true)
    window.addEventListener("pointerdown", onPointer, true)
    return () => {
      window.removeEventListener("keydown", onKey, true)
      window.removeEventListener("pointerdown", onPointer, true)
    }
  }, [])

  const cards = visibleRequirements(REQUIREMENTS, ask, owner, tags, order)

  function removeFrom(fieldId: string, key: string) {
    setPools((current) => ({ ...current, [fieldId]: current[fieldId]?.filter((item) => item !== key) ?? [] }))
    setPicked((current) => ({ ...current, [fieldId]: current[fieldId]?.filter((item) => item !== key) ?? [] }))
  }

  function restore() {
    setPools(Object.fromEntries(LAB.map((field) => [field.id, [...field.items]])))
  }

  return (
    <div className="page">
      <header className="top">
        <h1>UI SDK</h1>
        <a href="https://github.com/vercel-labs/ui">vercel-labs/ui</a>
        <Segmented
          label="明暗"
          value={theme}
          onChange={setTheme}
          options={[
            { value: "system", label: "系统" },
            { value: "light", label: "浅色" },
            { value: "dark", label: "深色" },
          ]}
        />
      </header>

      <div className="knobs" role="group" aria-label="外观">
        <label className="radius">
          圆角
          <input
            type="range"
            min={0}
            max={16}
            step={1}
            value={radius}
            aria-valuetext={`${radius}`}
            onChange={(event) => setRadius(Number(event.target.value))}
          />
          <span className="num">{radius}</span>
        </label>
        <Segmented
          label="密度"
          value={density}
          onChange={setDensity}
          options={[
            { value: "compact", label: "紧凑" },
            { value: "regular", label: "常规" },
            { value: "loose", label: "宽松" },
          ]}
        />
        <Segmented
          label="动效"
          value={motion}
          onChange={setMotion}
          options={[
            { value: "short", label: "短" },
            { value: "off", label: "无" },
          ]}
        />
      </div>

      <div className="split">
        <section className="lab" aria-labelledby="lab-title" ref={setLabRoot}>
          <div className="lab-bar">
            <h2 id="lab-title">行为</h2>
            <div className="flags" role="group" aria-label="行为">
              <Switch
                label="弹出层"
                on={flags.popup}
                onChange={(popup) => setFlags((current) => ({ ...current, popup }))}
              />
              <Segmented
                label="选择"
                value={flags.multiple ? "multi" : "single"}
                onChange={(mode) => {
                  setFlags((current) => ({ ...current, multiple: mode === "multi" }))
                  if (mode === "single") {
                    setPicked((current) =>
                      Object.fromEntries(Object.entries(current).map(([key, value]) => [key, value.slice(0, 1)])),
                    )
                  }
                }}
                options={[
                  { value: "single", label: "单选" },
                  { value: "multi", label: "多选" },
                ]}
              />
              <Switch
                label="键入定位"
                on={flags.typeahead}
                onChange={(typeahead) => setFlags((current) => ({ ...current, typeahead }))}
              />
              <Switch
                label="焦点回收"
                on={flags.recovery}
                onChange={(recovery) => setFlags((current) => ({ ...current, recovery }))}
              />
              <button type="button" className="text" onClick={restore}>
                恢复
              </button>
            </div>
          </div>
          <div className="fields">
            {LAB.map((field) => (
              <FieldControl
                key={field.id}
                id={field.id}
                label={field.label}
                items={toItems(pools[field.id] ?? [])}
                value={picked[field.id] ?? []}
                onValueChange={(value) => setPicked((current) => ({ ...current, [field.id]: value }))}
                onRemove={(key) => removeFrom(field.id, key)}
                popup={flags.popup}
                multiple={flags.multiple}
                typeahead={flags.typeahead}
                recovery={flags.recovery}
              />
            ))}
          </div>
        </section>
        <Inspector root={labRoot} />
      </div>

      <section className="assemble" aria-labelledby="assemble-title">
        <div className="lab-bar">
          <h2 id="assemble-title">组装</h2>
          <Segmented label="请求" value={ask} onChange={setAsk} options={ASKS.map((item) => ({ value: item.id, label: item.label }))} />
        </div>
        <div className="assemble-grid">
          <div className="board" aria-labelledby="sample-title">
            <h3 id="sample-title">示例数据</h3>
            {ask === "owner" ? (
              <FieldControl
                id="ask-owner"
                label="负责人"
                items={OWNERS.map((name) => ({ id: name, label: name }))}
                value={owner}
                onValueChange={setOwner}
                popup
                multiple={false}
                typeahead
                recovery={false}
              />
            ) : null}
            {ask === "tags" ? (
              <FieldControl
                id="ask-tags"
                label="标签"
                items={TAGS.map((name) => ({ id: name, label: name }))}
                value={tags}
                onValueChange={setTags}
                popup
                multiple
                typeahead
                recovery={false}
              />
            ) : null}
            {ask === "rank" ? <RankList items={REQUIREMENTS} order={order} onOrder={setOrder} /> : null}
            {ask !== "rank" ? (
              <ol className="cards">
                {cards.map((card, index) => (
                  <li key={card.id}>
                    <span className="num">{index + 1}</span>
                    <span className="rank-title">{card.title}</span>
                    <span className="rank-meta">
                      {card.owner}
                      {card.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
          <CodePanel ask={ask} />
        </div>
      </section>
    </div>
  )
}

function Switch({ label, on, onChange }: { label: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)}>
      {label}
    </button>
  )
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="seg"
      onKeyDown={(event) => {
        const index = options.findIndex((option) => option.value === value)
        let next = index
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % options.length
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + options.length) % options.length
        else return
        event.preventDefault()
        const option = options[next]
        if (!option) return
        onChange(option.value)
        const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')
        buttons[next]?.focus()
      }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          tabIndex={value === option.value ? 0 : -1}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
