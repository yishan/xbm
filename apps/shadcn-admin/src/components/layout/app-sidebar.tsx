// Showcase inspired by satnaing/shadcn-admin (MIT). https://github.com/satnaing/shadcn-admin
import { Link, useRouterState } from "@tanstack/react-router"
import {
  ChevronsUpDown,
  Command,
  ExternalLink,
  LayoutDashboard,
  ListTodo,
  LogIn,
  LogOut,
  Settings,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

type NavItem = {
  title: string
  to: string
  slug: string
  icon: typeof LayoutDashboard
  badge?: string
  external?: boolean
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "General",
    items: [
      { title: "Dashboard", to: "/", slug: "dashboard", icon: LayoutDashboard },
      {
        title: "Tasks",
        to: "/tasks",
        slug: "tasks",
        icon: ListTodo,
        badge: "64",
      },
    ],
  },
  {
    label: "Pages",
    items: [
      { title: "Sign in", to: "/sign-in", slug: "sign-in", icon: LogIn },
    ],
  },
  {
    label: "Other",
    items: [
      { title: "Settings", to: "/settings", slug: "settings", icon: Settings },
      {
        title: "Upstream repo",
        to: "https://github.com/satnaing/shadcn-admin",
        slug: "upstream",
        icon: ExternalLink,
        external: true,
      },
    ],
  },
]

function UserMenu({ onNavigate }: { onNavigate: () => void }) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              data-testid="user-menu-trigger"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg">YS</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Yishan</span>
                <span className="truncate text-xs text-muted-foreground">
                  demo@li.yishan.app
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
            data-testid="user-menu-content"
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">YS</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Yishan</span>
                  <span className="truncate text-xs text-muted-foreground">
                    demo@li.yishan.app
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  to="/settings"
                  onClick={onNavigate}
                  data-testid="user-menu-settings"
                >
                  <Settings />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/sign-in"
                  onClick={onNavigate}
                  data-testid="user-menu-sign-out"
                >
                  <LogOut />
                  Sign out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { isMobile, state, setOpenMobile } = useSidebar()

  const handleNavigate = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar collapsible="icon" variant="inset" data-testid="app-sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" data-testid="app-sidebar-brand">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Command className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Shadcn Admin</span>
                <span className="truncate text-xs text-muted-foreground">
                  Vite + TanStack Router
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = !item.external && pathname === item.to

                return (
                  <SidebarMenuItem key={item.slug}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      {item.external ? (
                        <a
                          href={item.to}
                          target="_blank"
                          rel="noreferrer"
                          data-testid={`nav-${item.slug}`}
                        >
                          <Icon />
                          <span>{item.title}</span>
                        </a>
                      ) : (
                        <Link
                          to={item.to}
                          onClick={handleNavigate}
                          data-testid={`nav-${item.slug}`}
                        >
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                    {item.badge ? (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <UserMenu onNavigate={handleNavigate} />
        {(state === "expanded" || isMobile) && (
          <div
            className="px-2 text-[11px] leading-tight text-muted-foreground"
            data-testid="attribution"
          >
            Based on{" "}
            <a
              href="https://github.com/satnaing/shadcn-admin"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-2 hover:underline"
            >
              shadcn-admin
            </a>{" "}
            by Sat Naing · MIT
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
