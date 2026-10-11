// Light / dark / system theme via next-themes (already a dependency for sonner).
// Defaults to the system setting and follows it live until the user picks one.
// next-themes wraps every localStorage access in try/catch, so blocked storage
// just means "system" for this session. The pre-paint class is set by the
// inline script in index.html (same storage key).
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ReactNode } from "react"

export const THEME_STORAGE_KEY = "obsidian-ui-theme"

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey={THEME_STORAGE_KEY}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
