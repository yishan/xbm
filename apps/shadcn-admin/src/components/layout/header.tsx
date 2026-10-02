// Showcase inspired by satnaing/shadcn-admin (MIT). https://github.com/satnaing/shadcn-admin
import { Link, useRouterState } from "@tanstack/react-router"
import {
  CheckIcon,
  ExternalLinkIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useTheme, type Theme } from "@/components/theme-provider"

const TITLE_BY_PATH: Record<string, string> = {
  "/": "Dashboard",
  "/tasks": "Tasks",
  "/settings": "Settings",
}

const THEME_OPTIONS: { value: Theme; label: string; testId: string }[] = [
  { value: "light", label: "Light", testId: "theme-light" },
  { value: "dark", label: "Dark", testId: "theme-dark" },
  { value: "system", label: "System", testId: "theme-system" },
]

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const title = TITLE_BY_PATH[pathname] ?? "Dashboard"
  const { theme, setTheme } = useTheme()

  return (
    <header
      data-testid="app-header"
      className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur"
    >
      <SidebarTrigger className="-ml-1" data-testid="sidebar-trigger" />
      <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-center" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink asChild>
              <Link to="/">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="hidden w-56 justify-start text-muted-foreground sm:inline-flex"
          data-testid="header-search"
          onClick={() => toast("Command palette is not part of this showcase")}
        >
          <SearchIcon />
          Search…
          <kbd className="ml-auto rounded border bg-muted px-1.5 text-[10px]">
            ⌘K
          </kbd>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-testid="theme-toggle"
            >
              <SunIcon className="size-4 scale-100 transition-transform dark:scale-0" />
              <MoonIcon className="absolute size-4 scale-0 transition-transform dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {THEME_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                data-testid={option.testId}
                onClick={() => setTheme(option.value)}
              >
                {option.label}
                {theme === option.value ? <CheckIcon className="ml-auto" /> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button type="button" variant="ghost" size="icon" asChild>
          <a
            href="https://github.com/satnaing/shadcn-admin"
            target="_blank"
            rel="noreferrer"
            title="Upstream: satnaing/shadcn-admin (MIT)"
          >
            <ExternalLinkIcon />
            <span className="sr-only">
              Upstream: satnaing/shadcn-admin (MIT)
            </span>
          </a>
        </Button>
      </div>
    </header>
  )
}
