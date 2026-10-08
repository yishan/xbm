import { useEffect, useSyncExternalStore } from "react"

export type Theme = "light" | "dark"
const KEY = "ascii-rest-theme"

function initial(): Theme {
  const q = new URLSearchParams(location.search).get("theme")
  if (q === "light" || q === "dark") return q
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === "light" || saved === "dark") return saved
  } catch { /* storage blocked */ }
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

// One shared value for the whole page, so the header toggle and the page grid see the same theme.
let current: Theme = initial()
const listeners = new Set<() => void>()
function apply() {
  document.documentElement.classList.toggle("dark", current === "dark")
  document.documentElement.style.colorScheme = current
}
apply()

function set(t: Theme) {
  current = t
  apply()
  try { localStorage.setItem(KEY, t) } catch { /* storage blocked */ }
  listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }

/** Light/dark on <html class="dark">, saved per browser; ?theme=dark|light overrides (used by QA). */
export function useTheme(): [Theme, (t: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, () => current)
  useEffect(apply, [theme])
  return [theme, set]
}
