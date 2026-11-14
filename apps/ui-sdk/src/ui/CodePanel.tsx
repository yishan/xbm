import { useEffect, useState } from "react"
import type { Ask } from "../board"
import fieldSource from "../primitives/field.ts?raw"
import rankSource from "../primitives/rank.ts?raw"

function sourceFor(ask: Ask): string {
  switch (ask) {
    case "owner":
      return `// 按负责人筛选\n// createPopup + createSelection multiple () => false + createTypeahead\n\n${fieldSource}`
    case "tags":
      return `// 多选标签\n// createPopup + createSelection multiple () => true + createTypeahead\n\n${fieldSource}`
    case "rank":
      return `// 拖动调整优先级\n// createReorder + createRovingFocus\n\n${rankSource}`
    default: {
      const _never: never = ask
      return _never
    }
  }
}

export function CodePanel({ ask }: { ask: Ask }) {
  const source = sourceFor(ask)
  const [status, setStatus] = useState("")

  useEffect(() => {
    if (!status) return
    const timer = window.setTimeout(() => setStatus(""), 1600)
    return () => window.clearTimeout(timer)
  }, [status])

  return (
    <div className="code">
      <div className="code-bar">
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(source).then(
              () => setStatus("已复制"),
              () => setStatus("未能复制"),
            )
          }}
        >
          复制
        </button>
        <span aria-live="polite">{status}</span>
      </div>
      <pre tabIndex={0} aria-label="生成的 primitive">
        {source}
      </pre>
    </div>
  )
}
