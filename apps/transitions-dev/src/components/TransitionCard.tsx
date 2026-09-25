import { useState } from "react"
import { Check, ChevronDown, Code2, Copy, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { TransitionDef } from "@/transitions/types"

type Tab = "css" | "jsx"

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement("textarea")
    ta.value = text
    ta.style.position = "fixed"
    ta.style.opacity = "0"
    document.body.appendChild(ta)
    ta.select()
    document.execCommand("copy")
    ta.remove()
  }
}

export function TransitionCard({ def, index, globalTrigger }: { def: TransitionDef; index: number; globalTrigger: number }) {
  const { Demo } = def
  const [trigger, setTrigger] = useState(0)
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>("css")
  const [copied, setCopied] = useState(false)

  const snippet = tab === "css" ? def.css.trim() : def.jsx.trim()

  const copy = async () => {
    await copyText(snippet)
    setCopied(true)
    toast.success(`Copied ${def.title} ${tab === "css" ? "CSS" : "React"} snippet`)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <Card className="gap-0 py-0" data-testid={`card-${def.id}`}>
      <div className="preview-bg relative grid h-56 place-items-center overflow-hidden border-b">
        <span className="absolute top-3 right-3 font-mono text-[10px] text-muted-foreground/70">
          {String(index + 1).padStart(2, "0")}
        </span>
        <Demo trigger={trigger + globalTrigger} />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[15px] leading-snug font-medium">{def.title}</h3>
            <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{def.description}</p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {def.category}
          </Badge>
        </div>

        <div className="mt-auto flex items-center gap-1.5">
          <Button size="sm" onClick={() => setTrigger((t) => t + 1)} data-testid={`replay-${def.id}`}>
            <RotateCcw /> {def.action}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-expanded={open}
            aria-controls={`code-${def.id}`}
            onClick={() => setOpen((o) => !o)}
          >
            <Code2 /> Code
            <ChevronDown className={cn("transition-transform duration-300", open && "rotate-180")} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={copy}
            aria-label={`Copy ${def.title} snippet`}
          >
            <span className="t-swap">
              <Copy data-shown={!copied} aria-hidden />
              <Check data-shown={copied} className="text-emerald-600" aria-hidden />
            </span>
            Copy
          </Button>
        </div>

        <div id={`code-${def.id}`} className="code-collapse" data-open={open}>
          <div>
            <div className="mb-2 flex gap-1 pt-1">
              {(["css", "jsx"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "rounded-md px-2 py-0.5 font-mono text-[11px] transition-colors",
                    tab === t ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {t === "css" ? "CSS" : "React"}
                </button>
              ))}
            </div>
            <pre className="max-h-64 overflow-auto rounded-lg bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-zinc-200">
              <code>{snippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </Card>
  )
}
