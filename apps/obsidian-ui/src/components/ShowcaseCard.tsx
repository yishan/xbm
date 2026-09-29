import { useState } from "react"
import { MousePointerClick, RotateCcw } from "lucide-react"
import type { BlockDef } from "@/blocks/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SourcePanel } from "./SourcePanel"

const categoryDot: Record<BlockDef["category"], string> = {
  WebGL: "bg-fuchsia-400",
  Canvas: "bg-amber-400",
  GSAP: "bg-emerald-400",
  Motion: "bg-sky-400",
}

const dotGrid = {
  backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
  backgroundSize: "16px 16px",
}

export function ShowcaseCard({
  def,
  index,
}: {
  def: BlockDef
  index: number
}) {
  const [remountKey, setRemountKey] = useState(0)
  const number = String(index + 1).padStart(2, "0")
  const DemoComponent = def.Demo

  return (
    <Card
      data-testid={`card-${def.id}`}
      className="gap-0 overflow-hidden border-white/10 bg-zinc-900/40 py-0"
    >
      <div
        className="relative flex h-64 items-center justify-center overflow-hidden border-b border-white/10 bg-zinc-950"
        style={dotGrid}
      >
        <div
          key={remountKey}
          className="flex h-full w-full items-center justify-center"
        >
          <DemoComponent />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Remount demo"
          onClick={() => setRemountKey((k) => k + 1)}
          className="absolute left-2 top-2 bg-black/40 text-zinc-300 backdrop-blur"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        <span className="absolute right-3 top-2 font-mono text-xs text-zinc-600">
          {number}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div>
          <h2 className="text-[15px] font-medium text-zinc-100">
            {def.title}
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">
            {def.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {def.tech.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="border-white/10 text-[10px] text-zinc-400"
              >
                {tech}
              </Badge>
            ))}
          </div>
          <Badge
            variant="outline"
            className="gap-1.5 border-white/10 text-[10px] text-zinc-400"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${categoryDot[def.category]}`}
            />
            {def.category}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <MousePointerClick className="h-3.5 w-3.5" />
          {def.hint}
        </div>

        <SourcePanel def={def} />
      </div>
    </Card>
  )
}
