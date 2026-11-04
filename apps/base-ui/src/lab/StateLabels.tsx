import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

type LabelAttr = { key: string; text: string; hot: boolean }

type Label = {
  id: string
  part: string
  attrs: LabelAttr[]
  left: number
  top: number
}

const IGNORED = new Set(["data-part", "data-slot", "data-inspect"])

export function StateLabels({ enabled }: { enabled: boolean }) {
  const [labels, setLabels] = useState<Label[]>([])

  useEffect(() => {
    if (!enabled) {
      delete document.body.dataset.inspect
      setLabels([])
      return
    }

    document.body.dataset.inspect = ""

    let frame = 0
    let lastSerialized = ""

    const tick = () => {
      const next: Label[] = []
      let index = 0

      document.querySelectorAll<HTMLElement>("[data-part]").forEach((element) => {
        const rect = element.getBoundingClientRect()
        if (rect.width <= 0) return

        const attrs: LabelAttr[] = []
        for (const name of element.getAttributeNames()) {
          if (!name.startsWith("data-")) continue
          if (IGNORED.has(name) || name.startsWith("data-base-ui-")) continue
          const value = element.getAttribute(name) ?? ""
          attrs.push({
            key: name,
            text: value.length > 0 && value.length < 12 ? `${name}=${value}` : name,
            hot: name.includes("starting") || name.includes("ending"),
          })
        }

        next.push({
          id: `${index}-${element.dataset.part ?? "part"}`,
          part: element.dataset.part ?? "",
          attrs,
          left: Math.round(rect.left),
          top: Math.max(2, Math.round(rect.top - 18)),
        })
        index += 1
      })

      const serialized = JSON.stringify(next)
      if (serialized !== lastSerialized) {
        lastSerialized = serialized
        setLabels(next)
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      delete document.body.dataset.inspect
    }
  }, [enabled])

  if (!enabled) return null

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: "var(--z-labels)",
        pointerEvents: "none",
      }}
    >
      {labels.map((label) => (
        <div
          key={label.id}
          style={{
            position: "fixed",
            left: label.left,
            top: label.top,
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "1px 5px",
            borderRadius: 4,
            background: "oklch(0.22 0.02 265 / 0.9)",
            color: "white",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
            fontSize: 10.5,
            lineHeight: 1.5,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          <span style={{ color: "oklch(0.85 0.12 var(--lab-hue, 265))" }}>{label.part}</span>
          {label.attrs.map((attr) => (
            <span
              key={attr.key}
              style={{
                padding: "0 3px",
                borderRadius: 3,
                background: attr.hot ? "oklch(0.75 0.15 75)" : "transparent",
                color: attr.hot ? "oklch(0.2 0.02 75)" : "oklch(0.88 0.02 265)",
              }}
            >
              {attr.text}
            </span>
          ))}
        </div>
      ))}
    </div>,
    document.body,
  )
}
