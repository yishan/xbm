// definePrimitive: createPopup, createSelection, createTypeahead, createFocusRecovery, createRovingFocus
import {
  createChange,
  createFocusRecovery,
  createPopup,
  createRovingFocus,
  createSelection,
  createTypeahead,
  definePrimitive,
  isTypeaheadKey,
  labelOf,
  popupContent,
  popupState,
  popupTrigger,
  type PopupState,
} from "@ui-sdk/core"
import { popoverPreset } from "@ui-sdk/core/popover"
import { createParts } from "@ui-sdk/react/primitive"

type PickReason = "item-press"

type FieldOptions = {
  popup: boolean
  multiple: boolean
  typeahead: boolean
  recovery: boolean
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[], details: { reason: PickReason; event?: Event }) => void
  onRemove?: (key: string) => void
  /** Shared with `createPopup`. Left unset so the popup stays uncontrolled. */
  open?: boolean
  defaultOpen?: boolean
}

type FieldState = PopupState & {
  value: string[]
  focused: string | null
  /** Mirrored from options so slot attrs recompute when the mode changes. */
  multiple: boolean
}

type OptionProps = { value: string; index: number }

const field = definePrimitive({
  name: "field",
  options: {
    popup: "boolean",
    multiple: "boolean",
    typeahead: "boolean",
    recovery: "boolean",
    value: "list",
    defaultValue: "list",
    onValueChange: "callback",
    onRemove: "callback",
    open: "boolean",
    defaultOpen: "boolean",
  },
  state: (options: FieldOptions): FieldState => ({
    ...popupState({}),
    value: options.value ?? options.defaultValue ?? [],
    focused: null,
    multiple: options.multiple,
  }),
  sync: (options: FieldOptions) => ({
    ...(options.value === undefined ? {} : { value: options.value }),
    multiple: options.multiple,
  }),
  api: (context) => {
    const change = createChange(context)
    const popup = createPopup(context, { preset: popoverPreset })
    const roving = createRovingFocus<FieldState, OptionProps>(context, {
      slot: "option",
      key: "focused",
      orientation: () => "vertical",
      loop: () => true,
    })
    const selection = createSelection(context, {
      key: "value",
      set: (value, details) => change("value", value, { reason: "item-press", event: details.event }),
      order: () => roving.items().map((item) => item.key),
      multiple: () => context.options().multiple,
    })
    const typeahead = createTypeahead()
    const recovery = createFocusRecovery<OptionProps>({
      fallback: (lost) => {
        if (!context.options().recovery) return undefined
        const items = roving.items()
        return (items[lost.props.index] ?? items.at(-1))?.el
      },
    })
    const flags = () => ({
      popup: context.options().popup,
      multiple: context.options().multiple,
      typeahead: context.options().typeahead,
      recovery: context.options().recovery,
    })
    return {
      ...popup,
      roving,
      selection,
      typeahead,
      recovery,
      flags,
      remove: (key: string) => context.options().onRemove?.(key),
    }
  },
  slots: (slot) => ({
    root: slot({}),
    trigger: popupTrigger(slot),
    content: popupContent(slot),
    list: slot<{ label: string }>({
      props: { label: "string" },
      attrs: (state, part) => ({
        role: "listbox",
        "aria-label": part.props.label,
        "aria-multiselectable": state.multiple ? "true" : undefined,
        "aria-orientation": "vertical",
      }),
    }),
    option: slot<OptionProps>({
      props: { value: "string", index: "number" },
      attrs: (state, part) => ({
        role: "option",
        "aria-selected": String(state.value.includes(part.key)),
        tabindex: part.api.roving.tabIndex(state, part),
        "data-value": part.key,
      }),
      on: {
        pointerdown: (_event, { api, key }) => {
          api.roving.focus(key)
        },
        click: (event, { api, key }) => {
          const mode = api.flags()
          if (event.shiftKey) api.selection.extend(key, { reason: "item-press", event })
          else if (event.metaKey || event.ctrlKey || mode.multiple) api.selection.toggle(key, { reason: "item-press", event })
          else api.selection.choose(key, { reason: "item-press", event })
          if (mode.popup && !mode.multiple && !event.shiftKey) api.close()
        },
        keydown: (event, { el, api, key }) => {
          if (event.isComposing || event.key === "Process") return
          const mode = api.flags()
          if (event.key === "Delete" || event.key === "Backspace") {
            event.preventDefault()
            api.remove(key)
            return
          }
          if (mode.typeahead && isTypeaheadKey(event) && !(event.key === " " && !api.typeahead.active())) {
            const items = api.roving.items()
            const labels = items.map((item) => labelOf(item.el))
            const current = items.findIndex((item) => item.el === el)
            const next = api.typeahead(event.key, labels, current < 0 ? 0 : current)
            if (next !== -1) {
              event.preventDefault()
              api.roving.focus(items[next]!.key)
            }
            return
          }
          if (event.key === " " && !api.typeahead.active()) {
            event.preventDefault()
            api.selection.toggle(key, { reason: "item-press", event })
            return
          }
          if (event.key === "Enter") {
            event.preventDefault()
            api.selection.choose(key, { reason: "item-press", event })
            if (mode.popup && !mode.multiple) api.close()
            return
          }
          api.roving.keydown(event, el!)
        },
      },
      bind: (el, part) => {
        const cleanups = [part.api.roving.bind(el, part), part.api.recovery.bind(el, part)]
        return () => {
          for (const cleanup of cleanups) cleanup()
        }
      },
    }),
  }),
})

const parts = createParts(field, {
  root: "div",
  trigger: "button",
  content: "div",
  list: "div",
  option: "div",
})

export const FieldRoot = parts.Root
export const FieldTrigger = parts.Trigger
export const FieldContent = parts.Content
export const FieldList = parts.List
export const FieldOption = parts.Option
