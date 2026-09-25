import { useEffect, useState } from "react"
import { ArrowUpRight, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Toaster } from "@/components/ui/sonner"
import { TransitionCard } from "@/components/TransitionCard"
import { ReducedMotionContext, useSystemReducedMotion } from "@/lib/motion"
import { TRANSITIONS } from "@/transitions"

const BOOKMARK_URL = "https://x.com/jonathan_wilke/status/2098801944756154391"

export default function App() {
  const system = useSystemReducedMotion()
  const [userReduced, setUserReduced] = useState(false)
  const [replayAll, setReplayAll] = useState(0)
  const reduced = system || userReduced

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduced)
  }, [reduced])

  return (
    <ReducedMotionContext.Provider value={reduced}>
      <div className="min-h-svh bg-zinc-50/70">
        <header className="mx-auto max-w-6xl px-5 pt-12 pb-8 sm:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-background">
              xbm demo
            </Badge>
            <a
              href="https://transitions.dev"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Inspired by transitions.dev <ArrowUpRight className="size-3" />
            </a>
          </div>

          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Essential UI transitions, rebuilt.
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                Twelve of the free transitions from{" "}
                <a className="font-medium text-foreground underline underline-offset-4" href="https://transitions.dev" target="_blank" rel="noreferrer">
                  transitions.dev
                </a>
                , re-implemented from scratch in plain CSS and a little React. Poke the previews, hit
                replay, and copy the snippet.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch
                  checked={reduced}
                  disabled={system}
                  onCheckedChange={setUserReduced}
                  aria-label="Reduce motion"
                  data-testid="reduce-motion"
                />
                Reduce motion{system && " (system)"}
              </label>
              <Button onClick={() => setReplayAll((n) => n + 1)} data-testid="replay-all">
                <Play /> Replay all
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto grid max-w-6xl items-start gap-5 px-5 pb-16 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
          {TRANSITIONS.map((def, i) => (
            <TransitionCard key={def.id} def={def} index={i} globalTrigger={replayAll} />
          ))}
        </main>

        <footer className="border-t bg-background">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs leading-relaxed text-muted-foreground sm:px-8">
            <p>
              Transition names and ideas come from{" "}
              <a className="underline underline-offset-4 hover:text-foreground" href="https://transitions.dev" target="_blank" rel="noreferrer">
                transitions.dev
              </a>{" "}
              by Jakub Antalik. Every effect here is an independent re-implementation — no
              transitions.dev code is included. For the real library (plus the agent skill and Pro
              effects), go to the source.
            </p>
            <p>
              Found via{" "}
              <a className="underline underline-offset-4 hover:text-foreground" href={BOOKMARK_URL} target="_blank" rel="noreferrer">
                this X bookmark
              </a>
              . All animations respect <code className="font-mono">prefers-reduced-motion</code>.
            </p>
          </div>
        </footer>
      </div>
      <Toaster theme="light" position="bottom-right" />
    </ReducedMotionContext.Provider>
  )
}
