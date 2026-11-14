import { useState } from "react"
import { FieldContent, FieldList, FieldOption, FieldRoot, FieldTrigger } from "../primitives/field"

export type FieldItem = { id: string; label: string }

type Props = {
  id: string
  label: string
  items: FieldItem[]
  value: string[]
  onValueChange: (value: string[]) => void
  onRemove?: (key: string) => void
  popup: boolean
  multiple: boolean
  typeahead: boolean
  recovery: boolean
}

function pickedText(items: FieldItem[], value: string[]): string {
  return value
    .map((id) => items.find((item) => item.id === id)?.label ?? id)
    .join("、")
}

export function FieldControl({
  id,
  label,
  items,
  value,
  onValueChange,
  onRemove,
  popup,
  multiple,
  typeahead,
  recovery,
}: Props) {
  const [armed, setArmed] = useState<string | null>(null)
  const text = pickedText(items, value)

  return (
    <div
      className="field"
      data-field={id}
      onFocus={(event) => {
        const option = (event.target as HTMLElement).closest?.("[data-slot='field-option']")
        const key = option?.getAttribute("data-value")
        if (key) setArmed(key)
      }}
      onBlur={(event) => {
        const next = event.relatedTarget
        if (next instanceof Node && event.currentTarget.contains(next)) return
        setArmed(null)
      }}
    >
      <FieldRoot
        popup={popup}
        multiple={multiple}
        typeahead={typeahead}
        recovery={recovery}
        value={value}
        onValueChange={(next) => onValueChange(next)}
        onRemove={onRemove}
      >
        {popup ? (
          <FieldTrigger className="field-trigger" type="button">
            <span>{label}</span>
            {text ? <span className="field-value">{text}</span> : null}
            <span className="chev" aria-hidden="true">
              ▾
            </span>
          </FieldTrigger>
        ) : (
          <div className="field-name">{label}</div>
        )}
        {popup ? (
          <FieldContent className="field-content" side="bottom" align="start" sideOffset={6}>
            <OptionList label={label} items={items} />
          </FieldContent>
        ) : (
          <OptionList label={label} items={items} />
        )}
      </FieldRoot>
      {onRemove ? (
        <button
          type="button"
          className="text"
          disabled={armed === null || !items.some((item) => item.id === armed)}
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => {
            if (armed) onRemove(armed)
          }}
        >
          移出焦点项
        </button>
      ) : null}
    </div>
  )
}

function OptionList({ label, items }: { label: string; items: FieldItem[] }) {
  return (
    <FieldList className="field-list" label={label}>
      {items.map((item, index) => (
        <FieldOption key={item.id} className="field-option" value={item.id} index={index}>
          {item.label}
        </FieldOption>
      ))}
    </FieldList>
  )
}
