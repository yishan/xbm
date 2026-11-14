import type { Requirement } from "../board"
import { RankHandle, RankItem, RankRoot } from "../primitives/rank"

type Props = {
  items: Requirement[]
  order: string[]
  onOrder: (order: string[]) => void
}

export function RankList({ items, order, onOrder }: Props) {
  const byId = new Map(items.map((item) => [item.id, item]))
  return (
    <RankRoot className="rank" defaultValue={order} onValueChange={(next) => onOrder([...next])}>
      {({ order: keys }) =>
        keys.map((id) => {
          const item = byId.get(id)
          if (!item) return null
          return (
            <RankItem key={id} className="rank-item" value={id}>
              <RankHandle className="rank-handle" value={id} aria-label={`拖动 ${item.title}`}>
                <span aria-hidden="true">⋮⋮</span>
              </RankHandle>
              <span className="rank-title">{item.title}</span>
              <span className="rank-meta" aria-hidden="true">
                {item.owner}
                {item.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </span>
            </RankItem>
          )
        })
      }
    </RankRoot>
  )
}
