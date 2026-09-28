import { useState } from "react"
import { AgentStatus, TextStates } from "@/blocks/text-states"
import { Brain, Globe, PenLine } from "lucide-react"

const MANUAL_STATES = [
  { label: "Thinking…", icon: Brain },
  { label: "Searching the web…", icon: Globe },
  { label: "Writing answer…", icon: PenLine },
]

export function TextStatesDemo() {
  const [manualIndex, setManualIndex] = useState(0)
  const manual = MANUAL_STATES[manualIndex]
  const ManualIcon = manual.icon

  return (
    <div className="flex flex-col items-center gap-4">
      <AgentStatus auto />

      <div
        data-testid="text-states"
        className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 shadow-sm"
      >
        <TextStates
          text={manual.label}
          icon={<ManualIcon className="h-4 w-4" aria-hidden />}
          className="text-sm font-medium text-zinc-900"
        />
      </div>

      <div className="flex gap-1">
        {MANUAL_STATES.map((state, idx) => (
          <button
            key={state.label}
            type="button"
            onClick={() => setManualIndex(idx)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              idx === manualIndex
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {state.label}
          </button>
        ))}
      </div>
    </div>
  )
}
