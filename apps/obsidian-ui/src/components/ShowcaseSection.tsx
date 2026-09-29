import { useState } from "react"
import { MousePointerClick, RotateCcw } from "lucide-react"
import type { BlockDef } from "@/blocks/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import SourcePanel from "./SourcePanel"

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

export function ShowcaseSection({
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
    <section
      data-testid={`section-${def.id}`}
      className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/40"
    >
      <div
        className="relative h-[420px] overflow-hidden bg-zinc-950"
        style={dotGrid}
      >
        <div
          key={remountKey}
          className="flex h-full w-full items-center justify-center"
        >
          <DemoComponent />
        </div>
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-zinc-300 backdrop-blur">
          <span className="font-mono text-zinc-500">{number}</span>
          <span>{def.title}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Remount demo"
          onClick={() => setRemountKey((k) => k + 1)}
          className="absolute right-3 top-3 bg-black/40 text-zinc-300 backdrop-blur"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="p-5">
        <div className="grid gap-5 md:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-lg font-medium text-zinc-100">{def.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              {def.description}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
              <MousePointerClick className="h-3.5 w-3.5" />
              {def.hint}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {def.tech.map((tech) => (
                <Badge
                  key={tech}
                  variant="outline"
                  className="border-white/10 text-[10px] text-zinc-400"
                >
                  {tech}
                </Badge>
              ))}
              <Badge
                variant="outline"
                className="ml-auto gap-1.5 border-white/10 text-[10px] text-zinc-400"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${categoryDot[def.category]}`}
                />
                {def.category}
              </Badge>
            </div>
          </div>
          <div className="hidden md:block" />
        </div>

        <div className="mt-5">
          <SourcePanel def={def} />
        </div>
      </div>
    </section>
  )
}
