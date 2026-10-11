// Theme provider (light / dark / system), same pattern as apps/slideblocks.
// Defaults to the system setting and follows it live until the user picks one.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type Theme = "light" | "dark" | "system"
type Resolved = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: Resolved
  setTheme: (theme: Theme) => void
}

// Keep in sync with the inline script in index.html.
export const THEME_STORAGE_KEY = "open-intelligent-ui-theme"
const ThemeContext = createContext<ThemeContextValue | null>(null)
const QUERY = "(prefers-color-scheme: dark)"

// localStorage can throw (disabled storage, privacy modes, sandboxed iframes).
// Never let that blank the page: fall back to "system" and skip saving.
function readStoredTheme(): Theme {
  try {
    const v = window.localStorage.getItem(THEME_STORAGE_KEY)
    return v === "light" || v === "dark" || v === "system" ? v : "system"
  } catch {
    return "system"
  }
}

function writeStoredTheme(theme: Theme) {
  try {
    if (theme === "system") window.localStorage.removeItem(THEME_STORAGE_KEY)
    else window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage unavailable: keep the theme for this session only.
  }
}

function systemTheme(): Resolved {
  return window.matchMedia(QUERY).matches ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)
  const [system, setSystem] = useState<Resolved>(systemTheme)

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const onChange = () => setSystem(systemTheme())
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const resolvedTheme = theme === "system" ? system : theme

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", resolvedTheme === "dark")
    root.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  const setTheme = (t: Theme) => {
    writeStoredTheme(t)
    setThemeState(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}
