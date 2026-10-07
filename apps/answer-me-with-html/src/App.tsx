import { useEffect, useRef, useState } from 'react'
import { Columns2, ExternalLink, FileText, Moon, Sun } from 'lucide-react'
import { PageCard } from '@/components/PageCard'
import { PageViewer } from '@/components/PageViewer'
import { Benchmark } from '@/components/Benchmark'
import { Button } from '@/components/ui/button'
import { PAGES, THEMES, UPSTREAM } from '@/data/pages'
import type { ModeId, ThemeId } from '@/data/pages'

export default function App() {
  const [activeId, setActiveId] = useState(PAGES[0].id)
  const [theme, setTheme] = useState<ThemeId>('blueprint')
  const [mode, setMode] = useState<ModeId>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )
  const [view, setView] = useState<'page' | 'split'>('split')
  const viewerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
  }, [mode])

  const activePage = PAGES.find((page) => page.id === activeId) ?? PAGES[0]

  function open(id: string) {
    setActiveId(id)
    viewerRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
          Answer me with HTML
        </h1>
        <p className="text-sm text-muted-foreground break-words">
          Agent 只写一份短 Markdown
          草稿，上游 am CLI 把它渲染成带时序图、对比表、时间线的离线单页
          HTML。这里用 v0.4.14 渲染了 5 页关于 xbm 自己的说明。
        </p>
        <p className="text-xs text-muted-foreground">
          上游：
          <a
            href={UPSTREAM}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            QingYunA/answer-me-with-html
          </a>
          （MIT）
        </p>
      </header>

      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur py-2 border-b border-border flex flex-wrap gap-2 items-center">
        {THEMES.map((t) => (
          <Button
            key={t.id}
            variant={theme === t.id ? 'default' : 'outline'}
            size="sm"
            data-testid={`theme-${t.id}`}
            onClick={() => setTheme(t.id)}
          >
            {t.label}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          data-testid="mode-toggle"
          onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
        >
          {mode === 'dark' ? <Moon /> : <Sun />}
          {mode === 'dark' ? '深色' : '浅色'}
        </Button>

        <Button
          variant={view === 'page' ? 'default' : 'outline'}
          size="sm"
          data-testid="view-page"
          onClick={() => setView('page')}
        >
          <FileText />
          仅页面
        </Button>
        <Button
          variant={view === 'split' ? 'default' : 'outline'}
          size="sm"
          data-testid="view-split"
          onClick={() => setView('split')}
        >
          <Columns2 />
          草稿 vs 页面
        </Button>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {PAGES.map((page, i) => (
          <PageCard
            key={page.id}
            page={page}
            index={i}
            active={page.id === activeId}
            onOpen={() => open(page.id)}
          />
        ))}
      </section>

      <section ref={viewerRef} className="scroll-mt-16 space-y-3">
        <h2 className="text-xl font-semibold text-foreground break-words">
          {activePage.title}
        </h2>
        <PageViewer page={activePage} theme={theme} mode={mode} view={view} />
      </section>

      <Benchmark />

      <footer className="text-xs text-muted-foreground space-y-1">
        <p className="break-words">
          页面由上游 am CLI（MIT License, Copyright (c) 2026 Answer me with HTML
          contributors）在提交时渲染，HTML 已提交到 public/pages/。未使用 am
          video / ElevenLabs。xbm nightly 2026-10-08。
        </p>
        <p>
          <a
            href={UPSTREAM}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
          >
            <ExternalLink className="size-3" />
            QingYunA/answer-me-with-html
          </a>
        </p>
      </footer>
    </div>
  )
}
