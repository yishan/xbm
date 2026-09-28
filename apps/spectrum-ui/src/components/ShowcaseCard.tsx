import { useState } from "react"
import { AnimatePresence, motion, useReducedMotionConfig } from "motion/react"
import { Check, ChevronDown, Code2, Copy, MousePointerClick, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { BlockDef } from "@/blocks/types"

export function ShowcaseCard({ def, index }: { def: BlockDef; index: number }) {
  const { Demo } = def
  const [remountKey, setRemountKey] = useState(0)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const reducedMotion = useReducedMotionConfig() ?? false

  const copySource = async () => {
    try {
      await navigator.clipboard.writeText(def.source)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = def.source
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      ta.remove()
    }

    setCopied(true)
    toast.success(`Copied ${def.title} source`)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <Card className="gap-0 py-0" data-testid={`card-${def.id}`}>
      <div className="relative flex h-64 items-center justify-center overflow-hidden border-b bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.06)_1px,transparent_1px)] [background-size:16px_16px]">
        <span className="absolute top-3 right-3 font-mono text-[10px] text-zinc-400">
          {String(index + 1).padStart(2, "0")}
        </span>

        <Button
          size="icon-sm"
          variant="ghost"
          className="absolute top-3 left-3"
          aria-label="Remount"
          onClick={() => setRemountKey((k) => k + 1)}
        >
          <RotateCcw />
        </Button>

        <div key={remountKey} className="flex h-full w-full items-center justify-center">
          <Demo />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[15px] leading-snug font-medium">{def.title}</h3>
            <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
              {def.description}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {def.category}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MousePointerClick className="size-3.5" />
          <span>{def.hint}</span>
        </div>

        <div className="mt-auto flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            aria-expanded={open}
            aria-controls={`source-${def.id}`}
            onClick={() => setOpen((o) => !o)}
          >
            <Code2 />
            Code
            <ChevronDown className={cn("transition-transform", open && "rotate-180")} />
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={copySource}
            aria-label={`Copy ${def.title} source`}
          >
            {copied ? <Check className="text-emerald-600" /> : <Copy />}
            Copy
          </Button>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={`source-${def.id}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div>
                <p className="mb-2 pt-1 font-mono text-[11px] text-muted-foreground">
                  src/blocks/{def.file}
                </p>
                <pre className="max-h-72 overflow-auto rounded-lg bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-zinc-200">
                  <code>{def.source}</code>
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}
