import { useState } from 'react'
import { ArticleOpening } from '@/components/ArticleOpening'
import { CapCanvas } from '@/components/CapCanvas'
import { ExportBar } from '@/components/ExportBar'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { TunePanel } from '@/components/TunePanel'
import { VariationGrid } from '@/components/VariationGrid'
import type { CapSettings } from '@/lib/initialis'
import { START, themed, useDark } from '@/lib/theme'

export function App() {
  const [settings, setSettings] = useState<CapSettings>(START)
  const [replayKey, setReplayKey] = useState(0)
  const [dark, setDark] = useDark()

  const shown = themed(settings, dark)
  const letter = String(settings.text ?? 'I')

  function patch(p: CapSettings) {
    setSettings((prev) => ({ ...prev, ...p }))
  }

  function reset() {
    setSettings(START)
  }

  function replay() {
    setReplayKey((k) => k + 1)
  }

  function pick(s: CapSettings) {
    setSettings(s)
    setReplayKey((k) => k + 1)
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader
        dark={dark}
        onToggleDark={() => setDark(!dark)}
        onReplay={replay}
      />

      <main className="mx-auto w-full max-w-[1200px] px-4 pt-6 md:px-8">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-x-8 lg:gap-y-8">
          <aside className="order-2 lg:sticky lg:top-[4.5rem] lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:max-h-[calc(100dvh-5rem)] lg:self-start lg:overflow-y-auto">
            <div className="rounded-2xl bg-card p-4 shadow-[var(--elevation-raised)]">
              <TunePanel settings={settings} onChange={patch} onReset={reset} />
            </div>
          </aside>

          <div className="order-1 lg:col-start-2 lg:row-start-1">
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-card p-4 shadow-[var(--elevation-raised)] md:p-6">
              <CapCanvas
                settings={shown}
                size={360}
                animate
                replayKey={replayKey}
                label="首字母预览"
                className="h-auto max-w-full rounded-lg outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
              />
              <ExportBar settings={settings} />
            </div>
          </div>

          <section
            className="order-3 lg:col-start-2 lg:row-start-2"
            aria-labelledby="article-heading"
          >
            <h2
              id="article-heading"
              className="mb-2 text-[12px] tracking-[0.04em] text-muted-foreground uppercase"
            >
              文章开头
            </h2>
            <div className="rounded-2xl bg-card p-4 shadow-[var(--elevation-raised)] md:p-6">
              <ArticleOpening
                settings={shown}
                replayKey={replayKey}
                letter={letter}
              />
            </div>
          </section>

          <section className="order-4 lg:col-start-2 lg:row-start-3">
            <VariationGrid base={settings} dark={dark} onPick={pick} />
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

export default App
