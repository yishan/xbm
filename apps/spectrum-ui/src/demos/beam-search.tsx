import { useState } from "react"
import { BeamSearch } from "@/blocks/beam-search"

export function BeamSearchDemo() {
  const [query, setQuery] = useState("")

  const chips = ["Research", "Refactor", "Summarize"]

  return (
    <div className="flex w-full flex-col items-center gap-3 p-4">
      <BeamSearch className="w-[300px]" value={query} onChange={setQuery} />
      <div className="flex gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setQuery(chip)}
            className="whitespace-nowrap rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  )
}
