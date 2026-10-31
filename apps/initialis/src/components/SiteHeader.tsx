import { Moon, RotateCcw, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SiteHeaderProps = {
  dark: boolean
  onToggleDark: () => void
  onReplay: () => void
}

export function SiteHeader({ dark, onToggleDark, onReplay }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-3 md:px-8">
        <div className="min-w-0">
          <p className="font-serif text-[20px] leading-none tracking-[0.2em] text-foreground">
            INITIĀLIS
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            生成式装饰首字母 · 演示
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="pointer-coarse:min-h-11 pointer-coarse:min-w-11"
            aria-label="切换深浅色"
            onClick={onToggleDark}
          >
            {dark ? (
              <Sun aria-hidden="true" />
            ) : (
              <Moon aria-hidden="true" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="pointer-coarse:min-h-11 pointer-coarse:min-w-11"
            onClick={onReplay}
          >
            <RotateCcw aria-hidden="true" />
            重播生长
          </Button>
        </div>
      </div>
    </header>
  )
}
