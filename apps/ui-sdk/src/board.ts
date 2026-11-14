export type Requirement = {
  id: string
  title: string
  owner: string
  tags: string[]
}

export const REQUIREMENTS: Requirement[] = [
  { id: "entry", title: "对照入口", owner: "林夏", tags: ["界面"] },
  { id: "filter", title: "筛选条", owner: "周衡", tags: ["界面", "筛选"] },
  { id: "keys", title: "键盘路径", owner: "林夏", tags: ["无障碍"] },
  { id: "empty", title: "空列表", owner: "陈予", tags: ["文案"] },
  { id: "density", title: "密度档位", owner: "周衡", tags: ["界面"] },
  { id: "focus", title: "焦点回到列表", owner: "苏晚", tags: ["无障碍", "焦点"] },
]

export const ASKS = [
  { id: "owner", label: "按负责人筛选" },
  { id: "tags", label: "多选标签" },
  { id: "rank", label: "拖动调整优先级" },
] as const

export type Ask = (typeof ASKS)[number]["id"]

function unique(values: string[]): string[] {
  return [...new Set(values)]
}

export const OWNERS = unique(REQUIREMENTS.map((item) => item.owner))
export const TAGS = unique(REQUIREMENTS.flatMap((item) => item.tags))

export function orderOf(items: Requirement[], ids: string[]): Requirement[] {
  const byId = new Map(items.map((item) => [item.id, item]))
  return ids.flatMap((id) => {
    const item = byId.get(id)
    return item ? [item] : []
  })
}

export function visibleRequirements(
  items: Requirement[],
  ask: Ask,
  owner: string[],
  tags: string[],
  order: string[],
): Requirement[] {
  const ordered = orderOf(items, order)
  switch (ask) {
    case "rank":
      return ordered
    case "owner":
      return owner.length === 0 ? ordered : ordered.filter((item) => owner.includes(item.owner))
    case "tags":
      return tags.length === 0 ? ordered : ordered.filter((item) => tags.some((tag) => item.tags.includes(tag)))
    default: {
      const _never: never = ask
      return _never
    }
  }
}

export function behaviorsFor(ask: Ask): string[] {
  switch (ask) {
    case "owner":
      return ["createPopup", "createSelection", "createTypeahead", "createRovingFocus"]
    case "tags":
      return ["createPopup", "createSelection", "createTypeahead", "createRovingFocus"]
    case "rank":
      return ["createReorder", "createRovingFocus"]
    default: {
      const _never: never = ask
      return _never
    }
  }
}
