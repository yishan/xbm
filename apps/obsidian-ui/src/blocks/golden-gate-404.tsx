// Ported from ObsidianUI (MIT) — Golden Gate 404 block. Next.js Link/font and RaisedButton swapped for <a>, a CSS serif stack and the local Button.
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { GoldenGateScene } from "./golden-gate-404/golden-gate-scene"
import "./golden-gate-404/golden-gate-404.css"

const TITLE_ID = "golden-gate-404-title"

export type GoldenGate404Props = {
  code?: string
  title?: string
  message?: string
  href?: string
  linkLabel?: string
  className?: string
}

/** The Golden Gate's north tower with live traffic, boats and fog, in light and dark themes. */
export function GoldenGate404({
  code = "404",
  title = "page not found",
  message = "This page drifted out past the Golden Gate.",
  href = "#",
  linkLabel = "Back home",
  className,
}: GoldenGate404Props) {
  return (
    <div className={cn("obsidianui-404", className)}>
      <section className="obsidianui-404-card" aria-labelledby={TITLE_ID}>
        <GoldenGateScene className="obsidianui-404-scene" />
        <div className="obsidianui-404-haze" aria-hidden="true" />
        <div className="obsidianui-404-copy">
          <h2 id={TITLE_ID} data-text={code}>
            <span className="obsidianui-404-code">{code}</span>
            <span className="sr-only">: {title}</span>
          </h2>
          <p className="obsidianui-404-lede">{message}</p>
          <Button asChild size="lg" className="obsidianui-404-home rounded-xl no-underline">
            <a href={href}>
              <ArrowLeft aria-hidden="true" />
              {linkLabel}
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}
