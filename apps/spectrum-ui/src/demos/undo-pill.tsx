import { useState } from "react"
import { UndoPill } from "@/blocks/undo-pill"

export function UndoPillDemo() {
  const [archived, setArchived] = useState(false)
  const [showPill, setShowPill] = useState(false)
  const [pillKey, setPillKey] = useState(0)

  const handleArchive = () => {
    setArchived(true)
    setShowPill(true)
    setPillKey((key) => key + 1)
  }

  const handleUndo = () => {
    setArchived(false)
    setShowPill(false)
  }

  const handleExpire = () => {
    setShowPill(false)
  }

  const handleReset = () => {
    setArchived(false)
    setShowPill(false)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3 text-sm">
        {archived ? (
          showPill ? null : (
            <div className="flex items-center gap-3">
              <span className="text-zinc-400">Archived</span>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-medium text-sky-600 hover:text-sky-700"
              >
                Reset
              </button>
            </div>
          )
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-zinc-700">Weekly report from Nova</span>
            <button
              type="button"
              data-testid="undo-archive"
              onClick={handleArchive}
              className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200"
            >
              Archive
            </button>
          </div>
        )}
      </div>

      {showPill && (
        <UndoPill
          key={pillKey}
          message="Email archived"
          onUndo={handleUndo}
          onExpire={handleExpire}
        />
      )}
    </div>
  )
}
