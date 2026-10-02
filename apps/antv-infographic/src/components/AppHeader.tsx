// Gallery demo using @antv/infographic (MIT). https://github.com/antvis/Infographic
// Bookmark: https://x.com/Huahuazo/status/2104558493244281026

import { ExternalLink } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

type AppHeaderProps = {
  dark: boolean
  onToggleDark: (next: boolean) => void
}

export function AppHeader({ dark, onToggleDark }: AppHeaderProps) {
  return (
    <header
      data-testid="app-header"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-4 py-3 text-sm"
    >
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="font-mono text-xs uppercase tracking-wide">
          xbm demo
        </Badge>
        <h1 className="font-medium tracking-tight">AntV Infographic gallery</h1>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
        <a
          href="https://github.com/antvis/Infographic"
          target="_blank"
          rel="noreferrer"
          data-testid="link-github"
          className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
        >
          GitHub
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
        <a
          href="https://x.com/Huahuazo/status/2104558493244281026"
          target="_blank"
          rel="noreferrer"
          data-testid="link-bookmark"
          className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
        >
          Bookmark
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
        <span className="text-xs">MIT licensed</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <label
          htmlFor="theme-toggle"
          className="cursor-pointer text-xs text-muted-foreground select-none"
        >
          Dark mode
        </label>
        <Switch
          id="theme-toggle"
          data-testid="theme-toggle"
          checked={dark}
          onCheckedChange={onToggleDark}
        />
      </div>
    </header>
  )
}
