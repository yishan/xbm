// SlideBlocks-style layout, inspired by UniUni2000/slideblocks-skill (MIT).
import { useCallback, useEffect, useRef, useState } from "react"
import type { TouchEvent as ReactTouchEvent } from "react"

import { DeckToolbar } from "@/components/deck-toolbar"
import { OverviewGrid } from "@/components/overview-grid"
import { SlideRenderer } from "@/components/slide-renderer"
import { SlideStage } from "@/components/slide-stage"
import { useTheme } from "@/components/theme-provider"
import { DECK } from "@/lib/deck"

/** Read a 1-based slide number from `#/<n>`, clamped to the deck range. */
function readIndexFromHash(total: number): number {
  if (total <= 0) return 0
  const match = /^#\/(\d+)$/.exec(window.location.hash)
  if (!match) return 0
  const n = Number.parseInt(match[1], 10)
  if (Number.isNaN(n)) return 0
  return Math.min(Math.max(n - 1, 0), total - 1)
}

export function App() {
  const total = DECK.slides.length
  const { resolvedTheme, setTheme } = useTheme()

  const [index, setIndex] = useState(() => readIndexFromHash(total))
  const [overview, setOverview] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  // Keep the URL hash in sync with the current slide.
  useEffect(() => {
    const hash = `#/${index + 1}`
    if (window.location.hash !== hash) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}${hash}`,
      )
    }
  }, [index])

  // Follow back/forward navigation and manual hash edits.
  useEffect(() => {
    const onHashChange = () => {
      setIndex(readIndexFromHash(total))
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [total])

  const next = useCallback(() => {
    setIndex((i) => Math.min(i + 1, total - 1))
  }, [total])

  const prev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0))
  }, [])

  // Phone swipe navigation: left = next, right = previous.
  const handleTouchStart = (event: ReactTouchEvent<HTMLElement>) => {
    if (overview) return
    const touch = event.changedTouches[0]
    if (!touch) return
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (event: ReactTouchEvent<HTMLElement>) => {
    if (overview) return
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start) return
    const touch = event.changedTouches[0]
    if (!touch) return
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) <= 50 || Math.abs(dx) <= Math.abs(dy)) return
    if (dx < 0) next()
    else prev()
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const target = event.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
          return
        }
      }

      const key = event.key

      if (key === "o" || key === "O") {
        event.preventDefault()
        setOverview((v) => !v)
        return
      }

      if (key === "Escape") {
        if (overview) {
          event.preventDefault()
          setOverview(false)
        }
        return
      }

      // While the overview is open, arrows are handled by the grid itself.
      if (overview) return

      switch (key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
        case " ":
        case "Enter":
          event.preventDefault()
          next()
          break
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
        case "Backspace":
          event.preventDefault()
          prev()
          break
        case "Home":
          event.preventDefault()
          setIndex(0)
          break
        case "End":
          event.preventDefault()
          setIndex(total - 1)
          break
        case "d":
        case "D":
          event.preventDefault()
          setTheme(resolvedTheme === "dark" ? "light" : "dark")
          break
        default:
          break
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [overview, next, prev, resolvedTheme, setTheme, total])

  return (
    <div className="flex h-dvh flex-col bg-muted/40">
      <DeckToolbar
        index={index}
        total={total}
        title={DECK.title}
        onPrev={prev}
        onNext={next}
        onOverview={() => setOverview(true)}
      />

      <div className="h-[3px] w-full shrink-0 bg-border">
        <div
          data-testid="progress"
          className="h-full bg-primary transition-[width] duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <main
        className="relative min-h-0 flex-1 p-3 sm:p-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <SlideStage>
          <div
            key={index}
            className="h-full w-full animate-in fade-in duration-300"
          >
            <SlideRenderer
              slide={DECK.slides[index]}
              index={index}
              total={total}
            />
          </div>
        </SlideStage>
      </main>

      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t px-4 py-2 text-xs text-muted-foreground">
        <span>← → / 空格 翻页 · 手机左右滑动 · O 总览 · D 深浅色</span>
        <span data-testid="credit">
          SlideBlocks-style demo · 灵感与版式来自{" "}
          <a
            href="https://github.com/UniUni2000/slideblocks-skill"
            className="underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            UniUni2000/slideblocks-skill
          </a>
          （MIT）
        </span>
      </footer>

      {overview && (
        <OverviewGrid
          slides={DECK.slides}
          current={index}
          onSelect={(i) => {
            setIndex(i)
            setOverview(false)
          }}
          onClose={() => setOverview(false)}
        />
      )}
    </div>
  )
}
