import { useState } from "react"
import { AnimatePresence, motion, useReducedMotionConfig } from "motion/react"
import { Check, ChevronDown, Code2, Copy } from "lucide-react"
import { toast } from "sonner"
import type { BlockDef } from "@/blocks/types"
import { Button } from "@/components/ui/button"

export function SourcePanel({ def }: { def: BlockDef }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const reduceMotion = useReducedMotionConfig()
  const panelId = `source-${def.id}`

  const copySource = async () => {
    const text = def.source
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = text
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
    }
    toast.success(`Copied ${def.title} source`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid={`code-${def.id}`}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="group"
        >
          <Code2 className="h-4 w-4" />
          Code
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid={`copy-${def.id}`}
          onClick={copySource}
          className="gap-1.5"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          Copy
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <div className="mb-2 font-mono text-[11px] text-zinc-500">
                src/blocks/{def.file}
              </div>
              <pre className="max-h-80 overflow-auto rounded-xl bg-black/60 border border-white/10 p-3 font-mono text-[11px] leading-relaxed text-zinc-300">
                <code>{def.source}</code>
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
