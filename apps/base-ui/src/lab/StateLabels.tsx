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
    // Only label what the user is pointing at or focused on; labelling every
    // part at once stacks badges on top of the component they describe.
    let hovered: HTMLElement | null = null
    const onOver = (e: PointerEvent) => {
      hovered = (e.target as Element | null)?.closest<HTMLElement>("[data-part]") ?? null
    }
    const onLeave = () => {
      hovered = null
    }
    document.addEventListener("pointerover", onOver)
    document.documentElement.addEventListener("pointerleave", onLeave)

    const tick = () => {
      const next: Label[] = []
      const focused = document.activeElement?.closest<HTMLElement>("[data-part]") ?? null
      const targets = [...new Set([hovered, focused])].filter(
        (el): el is HTMLElement => !!el && el.isConnected,
      )

      targets.forEach((element, index) => {
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

        // flip below when there is no room above
        const above = rect.top - 20
        next.push({
          id: `${index}-${element.dataset.part ?? "part"}`,
          part: element.dataset.part ?? "",
          attrs,
          left: Math.round(rect.left),
          top: Math.round(above < 2 ? rect.bottom + 4 : above),
        })
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
      document.removeEventListener("pointerover", onOver)
      document.documentElement.removeEventListener("pointerleave", onLeave)
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
            maxWidth: "calc(100vw - 16px)",
            translate: `min(0px, calc(100vw - 8px - ${label.left}px - 100%)) 0`,
            top: label.top,
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "1px 5px",
            borderRadius: 4,
            background: "oklch(0.22 0 0 / 0.9)",
            color: "white",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
            fontSize: 10.5,
            lineHeight: 1.5,
            whiteSpace: "nowrap",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <span style={{ color: "oklch(0.85 0.12 var(--lab-hue, 40))" }}>{label.part}</span>
          {label.attrs.map((attr) => (
            <span
              key={attr.key}
              style={{
                padding: "0 3px",
                borderRadius: 3,
                background: attr.hot ? "oklch(0.75 0.15 75)" : "transparent",
                color: attr.hot ? "oklch(0.2 0.02 75)" : "oklch(0.9 0 0)",
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
