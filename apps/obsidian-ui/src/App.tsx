import { useEffect, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { MotionConfig, useReducedMotion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Toaster } from "@/components/ui/sonner"
import { BLOCKS } from "@/blocks/index"
import type { BlockDef } from "@/blocks/types"
import { ShowcaseCard } from "@/components/ShowcaseCard"
import { ShowcaseSection } from "@/components/ShowcaseSection"

type BlockGroup =
  | { kind: "section"; def: BlockDef; index: number }
  | { kind: "cards"; items: { def: BlockDef; index: number }[] }

function groupBlocks(blocks: BlockDef[]): BlockGroup[] {
  const groups: BlockGroup[] = []
  let cardBuffer: { def: BlockDef; index: number }[] = []

  blocks.forEach((def, index) => {
    if (def.layout === "section") {
      if (cardBuffer.length) {
        groups.push({ kind: "cards", items: cardBuffer })
        cardBuffer = []
      }
      groups.push({ kind: "section", def, index })
    } else {
      cardBuffer.push({ def, index })
    }
  })

  if (cardBuffer.length) {
    groups.push({ kind: "cards", items: cardBuffer })
  }

  return groups
}

export default function App() {
  const systemReduced = useReducedMotion() ?? false
  const [userReduced, setUserReduced] = useState(false)
  const reduced = systemReduced || userReduced

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduced)
  }, [reduced])

  const groups = groupBlocks(BLOCKS)

  return (
    <MotionConfig reducedMotion={reduced ? "always" : "user"}>
      <div className="min-h-svh overflow-x-clip bg-[#09090b] text-zinc-100">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.25),rgba(14,165,233,0.12)_50%,transparent_75%)] blur-3xl"
        />

        <header className="relative mx-auto w-full max-w-6xl px-5 pt-12 pb-10 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <Badge variant="outline" className="border-white/10 text-zinc-300">
              xbm demo
            </Badge>
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <a
                className="hover:text-zinc-200"
                href="https://obsidianui.dev"
                target="_blank"
                rel="noreferrer"
              >
                Inspired by ObsidianUI{" "}
                <ArrowUpRight className="inline h-3 w-3" />
              </a>
              <span className="text-zinc-700">·</span>
              <a
                className="hover:text-zinc-200"
                href="https://x.com/athrix_codes/status/2104101588466074028"
                target="_blank"
                rel="noreferrer"
              >
                via @athrix_codes{" "}
                <ArrowUpRight className="inline h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
                Obsidian-grade effects,{" "}
                <span className="bg-gradient-to-r from-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                  rebuilt.
                </span>
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
                Eleven signature pieces from{" "}
                <a
                  href="https://obsidianui.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-200 underline underline-offset-4 hover:text-white"
                >
                  ObsidianUI
                </a>{" "}
                — WebGL shaders, canvas light, GSAP momentum and Motion springs —
                re-implemented from scratch. Drag, hover, scroll and click the
                previews, then copy the source.
              </p>
            </div>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <Switch
                  data-testid="reduce-motion"
                  aria-label="Reduce motion"
                  checked={reduced}
                  disabled={systemReduced}
                  onCheckedChange={setUserReduced}
                />
                Reduce motion
                {systemReduced && (
                  <span className="text-zinc-500"> (system)</span>
                )}
              </label>
              <Button asChild variant="outline" size="sm">
                <a
                  href="https://github.com/Atharvsinh-codez/ObsidianUI"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5"
                >
                  ObsidianUI on GitHub
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
            <span>5 sections</span>
            <span className="text-zinc-700">·</span>
            <span>6 components</span>
            <span className="text-zinc-700">·</span>
            <span>WebGL</span>
            <span className="text-zinc-700">·</span>
            <span>Canvas</span>
            <span className="text-zinc-700">·</span>
            <span>GSAP</span>
            <span className="text-zinc-700">·</span>
            <span>Motion</span>
          </div>
        </header>

        <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 pb-20 sm:px-8">
          {groups.map((group) => {
            if (group.kind === "section") {
              return (
                <ShowcaseSection
                  key={group.def.id}
                  def={group.def}
                  index={group.index}
                />
              )
            }
            return (
              <div
                key={`cards-${group.items[0]?.def.id ?? "start"}`}
                className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {group.items.map(({ def, index }) => (
                  <ShowcaseCard key={def.id} def={def} index={index} />
                ))}
              </div>
            )
          })}
        </main>

        <footer className="relative border-t border-white/10">
          <div className="mx-auto w-full max-w-6xl px-5 py-8 text-xs leading-relaxed text-zinc-500 sm:px-8">
            <p>
              Piece names and behaviour ideas come from{" "}
              <a
                href="https://obsidianui.dev"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-zinc-200"
              >
                ObsidianUI
              </a>{" "}
              by Atharvsinh (@athrix_codes), MIT-licensed. Every piece here is
              an independent re-implementation — no ObsidianUI source is
              included. For the real library (components, blocks, landing
              templates, the shadcn registry and agent-friendly docs), go to{" "}
              <a
                href="https://obsidianui.dev"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-zinc-200"
              >
                obsidianui.dev
              </a>{" "}
              and the{" "}
              <a
                href="https://github.com/Atharvsinh-codez/ObsidianUI"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-zinc-200"
              >
                GitHub repo
              </a>
              .
            </p>
            <p className="mt-2">
              Found via{" "}
              <a
                href="https://x.com/athrix_codes/status/2104101588466074028"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-zinc-200"
              >
                this X post
              </a>
              . Code written with aider + DeepSeek (deepseek-v4-pro). All
              effects respect prefers-reduced-motion.
            </p>
          </div>
        </footer>

        <Toaster theme="dark" position="bottom-right" />
      </div>
    </MotionConfig>
  )
}
