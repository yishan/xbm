import { useEffect, useState } from 'react'

const link =
  'rounded-sm text-foreground underline decoration-border underline-offset-2 transition-[color,text-decoration-color] duration-150 ease-out hover:decoration-current focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'

export function SiteFooter() {
  const [open, setOpen] = useState(false)
  const [licence, setLicence] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!open || licence !== null || failed) return
    let cancelled = false
    const controller = new AbortController()
    fetch(`${import.meta.env.BASE_URL}initialis/LICENSE`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then((text) => {
        if (!cancelled) setLicence(text)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [open, licence, failed])

  return (
    <footer className="mt-16 border-t border-border pb-16">
      <div className="mx-auto w-full max-w-[1200px] pr-4 pl-40 pt-6 text-[13px] text-muted-foreground md:pr-8">
        <p className="text-pretty">
          INITIĀLIS 由{' '}
          <a
            href="https://x.com/azlenelza"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            Azlen Elza（@azlenelza）
          </a>{' '}
          创作，原项目{' '}
          <a
            href="https://initialis.azlen.me"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            initialis.azlen.me
          </a>
          ，以 MIT 许可证发布（
          <a
            href="https://github.com/azlen/initialis"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            源代码
          </a>
          ）。
        </p>

        <p className="mt-2 text-pretty">
          字体各自遵循其开源许可（OFL
          等）；正文字体 ET Book（MIT）。页面中的文章段落为示例数据。
        </p>

        <details
          className="mt-3"
          onToggle={(e) => setOpen(e.currentTarget.open)}
        >
          <summary className="cursor-pointer rounded-sm text-[12px] tracking-[0.04em] text-muted-foreground underline decoration-border underline-offset-2 transition-[color,text-decoration-color] duration-150 ease-out hover:decoration-current focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            MIT 许可证
          </summary>
          <div className="mt-2">
            <p className="text-[12px] text-muted-foreground">
              Copyright (c) Azlen Elza — Permission is hereby granted, free of
              charge… (MIT)
            </p>
            <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-[12px] leading-[1.6] text-muted-foreground">
              {licence ?? (failed ? '许可证文本加载失败。' : '载入中…')}
            </pre>
          </div>
        </details>
      </div>
    </footer>
  )
}
