import { useEffect, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Toaster } from "@/components/ui/sonner"
import { ShowcaseCard } from "@/components/ShowcaseCard"
import { BLOCKS } from "@/blocks"
import { MotionConfig, useReducedMotion } from "motion/react"

const SPECTRUM_URL = "https://ui.spectrumhq.in"
const GITHUB_URL = "https://github.com/arihantcodes/spectrum-ui"
const BOOKMARK_URL = "https://x.com/dingyi/status/2099784285775593630"

export default function App() {
  const systemReduced = useReducedMotion() ?? false
  const [userReduced, setUserReduced] = useState(false)
  const reduced = systemReduced || userReduced

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduced)
  }, [reduced])

  return (
    <MotionConfig reducedMotion={reduced ? "always" : "user"}>
      <div className="min-h-svh bg-zinc-50/70">
        <header className="mx-auto max-w-6xl px-5 pt-12 pb-8 sm:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-background">
              xbm demo
            </Badge>
            <a
              href={SPECTRUM_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Inspired by Spectrum UI <ArrowUpRight className="size-3" />
            </a>
          </div>

          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Animated components for agent UIs, rebuilt.
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                Twelve signature components from{" "}
                <a
                  className="font-medium text-foreground underline underline-offset-4"
                  href={SPECTRUM_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  Spectrum UI
                </a>
                , re-implemented from scratch with Motion + Tailwind; hover, hold, drag and click
                the previews, then copy the source.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch
                  checked={reduced}
                  disabled={systemReduced}
                  onCheckedChange={setUserReduced}
                  aria-label="Reduce motion"
                  data-testid="reduce-motion"
                />
                Reduce motion{systemReduced && " (system)"}
              </label>
              <Button asChild variant="outline">
                <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                  Spectrum UI on GitHub
                  <ArrowUpRight />
                </a>
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto grid max-w-6xl items-start gap-5 px-5 pb-16 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
          {BLOCKS.map((def, i) => (
            <ShowcaseCard key={def.id} def={def} index={i} />
          ))}
        </main>

        <footer className="border-t bg-background">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs leading-relaxed text-muted-foreground sm:px-8">
            <p>
              Component names and behaviour ideas come from Spectrum UI by Arihant Jain (Apache-2.0).
              Every component here is an independent re-implementation — no Spectrum UI source is
              included. For the real library (250+ components, blocks and the Spectrum UI MCP server),
              go to the source.
            </p>
            <p>
              Found via{" "}
              <a
                className="underline underline-offset-4 hover:text-foreground"
                href={BOOKMARK_URL}
                target="_blank"
                rel="noreferrer"
              >
                this X bookmark
              </a>
              . Code written with aider + DeepSeek (deepseek-v4-pro). All animations respect
              prefers-reduced-motion.
            </p>
          </div>
        </footer>
      </div>
      <Toaster theme="light" position="bottom-right" />
    </MotionConfig>
  )
}
