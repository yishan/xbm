// SlideBlocks-style layout, inspired by UniUni2000/slideblocks-skill (MIT).
import {
  Blocks,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LayoutGrid,
  Monitor,
  Moon,
  Presentation,
  Sun,
} from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function DeckToolbar({
  index,
  total,
  title,
  onPrev,
  onNext,
  onOverview,
}: {
  index: number
  total: number
  title: string
  onPrev: () => void
  onNext: () => void
  onOverview: () => void
}) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur md:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Blocks className="h-4 w-4" />
        </span>
        <span className="hidden min-w-0 flex-col justify-center leading-tight sm:flex">
          <span className="text-sm font-semibold">SlideBlocks</span>
          <span className="hidden max-w-[260px] truncate text-xs text-muted-foreground sm:block">
            {title}
          </span>
        </span>
      </div>

      <div className="mx-auto flex shrink-0 items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="上一页"
              data-testid="prev-btn"
              disabled={index === 0}
              onClick={onPrev}
            >
              <ChevronLeft />
            </Button>
          </TooltipTrigger>
          <TooltipContent>上一页</TooltipContent>
        </Tooltip>

        <span
          className="w-16 text-center text-sm tabular-nums"
          data-testid="slide-counter"
        >
          {index + 1} / {total}
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="下一页"
              data-testid="next-btn"
              disabled={index === total - 1}
              onClick={onNext}
            >
              <ChevronRight />
            </Button>
          </TooltipTrigger>
          <TooltipContent>下一页</TooltipContent>
        </Tooltip>

        <Button
          variant="outline"
          size="sm"
          data-testid="overview-btn"
          onClick={onOverview}
        >
          <LayoutGrid />
          <span className="hidden sm:inline">总览</span>
        </Button>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  data-testid="theme-toggle"
                  aria-label="切换主题"
                >
                  {resolvedTheme === "dark" ? <Moon /> : <Sun />}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>切换主题</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>主题</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              data-testid="theme-light"
              onClick={() => setTheme("light")}
            >
              <Sun />
              浅色
            </DropdownMenuItem>
            <DropdownMenuItem
              data-testid="theme-dark"
              onClick={() => setTheme("dark")}
            >
              <Moon />
              深色
            </DropdownMenuItem>
            <DropdownMenuItem
              data-testid="theme-system"
              onClick={() => setTheme("system")}
            >
              <Monitor />
              跟随系统
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://uniuni2000.github.io/slideblocks-skill/#/1"
                target="_blank"
                rel="noreferrer"
                data-testid="sample-link"
              >
                <Presentation />
                <span className="hidden md:inline">原版示例</span>
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>原版示例</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" asChild>
              <a
                href="https://github.com/UniUni2000/slideblocks-skill"
                target="_blank"
                rel="noreferrer"
                data-testid="upstream-link"
                aria-label="SlideBlocks on GitHub"
              >
                <ExternalLink />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>GitHub 仓库</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
