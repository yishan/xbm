// Showcase inspired by satnaing/shadcn-admin (MIT). https://github.com/satnaing/shadcn-admin
import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { SignInPage } from "@/features/auth/sign-in"
import { DashboardPage } from "@/features/dashboard"
import { SettingsPage } from "@/features/settings"
import { TasksPage } from "@/features/tasks"

const rootRoute = createRootRoute({ component: Outlet })

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: AuthenticatedLayout,
})

const dashboardRoute = createRoute({ getParentRoute: () => appRoute, path: "/", component: DashboardPage })
const tasksRoute = createRoute({ getParentRoute: () => appRoute, path: "/tasks", component: TasksPage })
const settingsRoute = createRoute({ getParentRoute: () => appRoute, path: "/settings", component: SettingsPage })
const signInRoute = createRoute({ getParentRoute: () => rootRoute, path: "/sign-in", component: SignInPage })

const routeTree = rootRoute.addChildren([
  appRoute.addChildren([dashboardRoute, tasksRoute, settingsRoute]),
  signInRoute,
])

// Hash history: the app is served statically under /shadcn-admin/ with no SPA rewrites.
export const router = createRouter({ routeTree, history: createHashHistory() })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
