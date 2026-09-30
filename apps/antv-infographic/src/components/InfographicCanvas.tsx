// Gallery demo using @antv/infographic (MIT). https://github.com/antvis/Infographic
// Bookmark: https://x.com/Huahuazo/status/2104558493244281026
import { useEffect, useRef, useState } from 'react'
import { Infographic } from '@antv/infographic'
import { cn } from '@/lib/utils'

type InfographicCanvasProps = {
  syntax: string
  className?: string
}

export function InfographicCanvas({ syntax, className }: InfographicCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const instanceRef = useRef<InstanceType<typeof Infographic> | null>(null)
  const [error, setError] = useState<string | null>(null)

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
    })

    try {
      ig.render(syntax)
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
  }, [syntax])

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
