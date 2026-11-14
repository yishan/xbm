import { useEffect, useState } from "react"

const ATTRS = [
  "role",
  "aria-expanded",
  "aria-haspopup",
  "aria-controls",
  "aria-selected",
  "aria-multiselectable",
  "aria-orientation",
  "aria-roledescription",
  "aria-activedescendant",
  "aria-disabled",
  "tabindex",
  "data-open",
  "data-closed",
  "data-grabbed",
  "data-dragging",
  "popover",
] as const

type Row = { key: string; slot: string; attrs: string; current: boolean }

function shownText(el: Element): string {
  const copy = el.cloneNode(true) as Element
  for (const hidden of copy.querySelectorAll("[aria-hidden='true'], [hidden]")) hidden.remove()
  return (copy.textContent ?? "").replace(/\s+/g, " ").trim()
}

function focusLabel(active: Element | null): string {
  if (!active || active === document.body || active === document.documentElement) return "页面"
  const slot = active.closest("[data-slot]")
  const name = slot?.getAttribute("data-slot") ?? active.tagName.toLowerCase()
  const text = shownText(slot ?? active).slice(0, 18)
  return text ? `${name} ${text}` : name
}

function attrText(el: Element): string {
  const parts: string[] = []
  for (const name of ATTRS) {
    const value = el.getAttribute(name)
    if (value === null) continue
    parts.push(value === "" ? name : `${name}=${value}`)
  }
  return parts.join(" ")
}

function slotLabel(el: Element): string {
  const slot = el.getAttribute("data-slot") ?? "slot"
  if (!slot.endsWith("option") && !slot.endsWith("item")) return slot
  const text = shownText(el).slice(0, 18)
  return text ? `${slot} ${text}` : slot
}

function fieldOf(active: Element | null, root: ParentNode): Element | null {
  if (active) {
    const direct = active.closest("[data-field]")
    if (direct && root.contains(direct)) return direct
    const content = active.closest("[data-slot='field-content']")
    if (content?.id) {
      const trigger = document.querySelector(`[aria-controls="${CSS.escape(content.id)}"]`)
      const field = trigger?.closest("[data-field]")
      if (field && root.contains(field)) return field
    }
  }
  return root.querySelector("[data-field]")
}

function rowsFor(field: Element, active: Element | null): Row[] {
  const found: Element[] = [...field.querySelectorAll("[data-slot]")]
  const trigger = field.querySelector("[data-slot='field-trigger']")
  const controls = trigger?.getAttribute("aria-controls")
  if (controls) {
    const content = document.getElementById(controls)
    if (content && !field.contains(content)) {
      found.push(content, ...content.querySelectorAll("[data-slot]"))
    }
  }
  return found.map((el, index) => ({
    key: el.id || `${el.getAttribute("data-slot")}-${index}`,
    slot: slotLabel(el),
    attrs: attrText(el),
    current: el === active || el.contains(active),
  }))
}

export function Inspector({ root }: { root: HTMLElement | null }) {
  const [focus, setFocus] = useState("页面")
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    if (!root) return
    let snapshot = ""
    const read = () => {
      const active = document.activeElement
      const field = fieldOf(active, root)
      const nextRows = field ? rowsFor(field, active) : []
      const nextFocus = focusLabel(active)
      const next = `${nextFocus}\n${nextRows.map((row) => `${row.current ? "*" : ""}${row.slot}|${row.attrs}`).join("\n")}`
      if (next === snapshot) return
      snapshot = next
      setFocus(nextFocus)
      setRows(nextRows)
    }
    const observer = new MutationObserver(read)
    observer.observe(document.body, { subtree: true, childList: true, attributes: true })
    document.addEventListener("focusin", read)
    document.addEventListener("focusout", read)
    read()
    return () => {
      observer.disconnect()
      document.removeEventListener("focusin", read)
      document.removeEventListener("focusout", read)
    }
  }, [root])

  return (
    <section className="inspector" aria-labelledby="inspector-title">
      <h2 id="inspector-title">检查器</h2>
      <p className="focus-line">
        <span>焦点</span>
        <span aria-live="polite">{focus}</span>
      </p>
      <table aria-labelledby="inspector-title">
        <thead>
          <tr>
            <th scope="col">槽</th>
            <th scope="col">属性</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} data-current={row.current ? "" : undefined}>
              <th scope="row">{row.slot}</th>
              <td>{row.attrs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
