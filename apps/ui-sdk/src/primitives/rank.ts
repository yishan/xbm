// definePrimitive: createReorder, createRovingFocus
import {
  createChange,
  createReorder,
  createRovingFocus,
  definePrimitive,
  type ReorderDraft,
  type ReorderMessage,
  type ReorderReason,
} from "@ui-sdk/core"
import { createParts } from "@ui-sdk/react/primitive"

type RankOptions = {
  defaultValue: string[]
  onValueChange?: (value: string[], details: { reason: ReorderReason; event?: Event }) => void
}

type RankState = {
  value: string[]
  focused: string | null
  moving: ReorderDraft | null
}

function rankMessage(message: ReorderMessage): string {
  const place = `第 ${message.position} 项，共 ${message.total} 项`
  switch (message.type) {
    case "grab":
      return `已拿起 ${message.label}，${place}`
    case "move":
      return `${message.label} 移到${place}`
    case "drop":
      return `已放下 ${message.label}，${place}`
    case "cancel":
      return `已取消移动 ${message.label}`
    default: {
      const _never: never = message.type
      return _never
    }
  }
}

const rank = definePrimitive({
  name: "rank",
  options: { defaultValue: "list", onValueChange: "callback" },
  state: (options: RankOptions): RankState => ({
    value: options.defaultValue,
    focused: null,
    moving: null,
  }),
  api: (context) => {
    const change = createChange(context)
    const roving = createRovingFocus<RankState, { value: string }>(context, {
      slot: "item",
      key: "focused",
      orientation: () => "vertical",
    })
    const reorder = createReorder<RankState>(context, {
      slot: "item",
      key: "value",
      draft: "moving",
      set: (value, details) => change("value", value, details),
      message: rankMessage,
    })
    return { roving, reorder }
  },
  slots: (slot) => ({
    root: slot<{}, { order: string[] }>({
      state: (state, { api }) => ({ order: api.reorder.order(state) }),
      attrs: () => ({
        role: "listbox",
        "aria-label": "优先级",
        "aria-roledescription": "可排序列表",
      }),
    }),
    item: slot<{ value: string }>({
      props: { value: "string" },
      attrs: (state, part) => ({
        role: "option",
        "aria-roledescription": "可排序条目",
        "aria-selected": String(state.moving?.key === part.key),
        tabindex: part.api.roving.tabIndex(state, part),
        "data-grabbed": state.moving?.key === part.key ? "" : undefined,
        "data-dragging": part.api.reorder.dragging(state, part.key) ? "" : undefined,
      }),
      on: {
        keydown: (event, { el, api, key }) => {
          if (api.reorder.keydown(event, key)) return
          api.roving.keydown(event, el!)
        },
      },
      bind: (el, part) => {
        const cleanups = [part.api.roving.bind(el, part), part.api.reorder.bind(el, part)]
        return () => {
          for (const cleanup of cleanups) cleanup()
        }
      },
    }),
    handle: slot<{ value: string }>({
      props: { value: "string" },
      attrs: () => ({
        type: "button",
        tabindex: "-1",
      }),
      on: {
        pointerdown: (event, { api, key }) => api.reorder.pointerdown(event, key),
      },
    }),
  }),
})

const parts = createParts(rank, {
  root: "div",
  item: "div",
  handle: "button",
})

export const RankRoot = parts.Root
export const RankItem = parts.Item
export const RankHandle = parts.Handle
