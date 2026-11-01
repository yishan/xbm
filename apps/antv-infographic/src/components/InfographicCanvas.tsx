// Gallery demo using @antv/infographic (MIT). https://github.com/antvis/Infographic
// Bookmark: https://x.com/Huahuazo/status/2104558493244281026
import { useEffect, useRef, useState } from 'react'
import { Infographic } from '@antv/infographic'
import { cn } from '@/lib/utils'

type InfographicCanvasProps = {
  syntax: string
  dark?: boolean
  className?: string
}

export function InfographicCanvas({ syntax, dark = false, className }: InfographicCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const instanceRef = useRef<InstanceType<typeof Infographic> | null>(null)
  const [error, setError] = useState<string | null>(null)
  // The renderer measures text before web fonts finish loading, so titles can
  // wrap into their subtitle. Re-render once fonts settle.
  const [fontsTick, setFontsTick] = useState(0)

  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) return
    let alive = true
    const bump = () => alive && setFontsTick((n) => n + 1)
    document.fonts.ready.then(bump)
    document.fonts.addEventListener('loadingdone', bump)
    return () => {
      alive = false
      document.fonts.removeEventListener('loadingdone', bump)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Destroy any previous instance before creating a new one.
    if (instanceRef.current) {
      try {
        instanceRef.current.destroy()
      } catch {
        // ignore destroy errors
      }
      instanceRef.current = null
    }

    // Clear any leftover DOM before re-init.
    container.replaceChildren()

    const ig = new Infographic({
      container,
      width: '100%',
      height: '100%',
      editable: false,
      theme: dark ? 'dark' : 'light',
    })

    try {
      ig.render(dark ? darkenPalette(syntax) : syntax)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }

    instanceRef.current = ig

    return () => {
      try {
        ig.destroy()
      } catch {
        // ignore destroy errors
      }
      if (instanceRef.current === ig) {
        instanceRef.current = null
      }
      container.replaceChildren()
    }
  }, [syntax, dark, fontsTick])

  return (
    <div
      className={cn('relative w-full', className)}
      data-testid="infographic-canvas"
    >
      <div
        ref={containerRef}
        className={cn('h-full w-full min-h-[320px]', error && 'hidden')}
      />
      {error && (
        <div className="flex h-full w-full min-h-[320px] items-center justify-center rounded-xl border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
          {error}
        </div>
      )}
    </div>
  )
}

// Samples hard-code saturated light-mode palettes. On a dark surface, pull
// chroma down and settle lightness so the colours sit with the page.
function darkenPalette(syntax: string) {
  return syntax.replace(/^(\s*palette)((?:\s+#[0-9a-fA-F]{6})+)\s*$/m, (_m, key: string, list: string) => {
    const tuned = list.trim().split(/\s+/).map(tuneForDark).join(' ')
    return `${key} ${tuned}`
  })
}

function tuneForDark(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  let h = 0
  let s = 0
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1))
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return hslToHex(h, Math.min(s * 0.6, 0.55), Math.min(Math.max(l, 0.5), 0.6))
}

function hslToHex(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}
