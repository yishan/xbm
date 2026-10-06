// Theme provider (light / dark / system) for the SlideBlocks demo.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type Theme = "light" | "dark" | "system"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = "slideblocks-theme"
const ThemeContext = createContext<ThemeContextValue | null>(null)

// localStorage can throw (disabled storage, privacy modes, sandboxed iframes).
// Never let that blank the page: fall back to "system" and skip saving.
function readStoredTheme(): Theme {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return v === "light" || v === "dark" || v === "system" ? v : "system"
  } catch {
    return "system"
  }
}

function writeStoredTheme(theme: Theme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Storage unavailable: keep the theme for this session only.
  }
}

function systemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)
  const [system, setSystem] = useState<"light" | "dark">(systemTheme)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
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
