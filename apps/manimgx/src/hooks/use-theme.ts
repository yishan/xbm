import { useCallback, useEffect, useRef, useState } from "react";

export type ThemeMode = "light" | "dark";

const QUERY = "(prefers-color-scheme: dark)";

function getSystemMode(): ThemeMode {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia(QUERY).matches ? "dark" : "light";
}

function applyMode(mode: ThemeMode): void {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.style.colorScheme = mode;
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(getSystemMode);
  const manualRef = useRef(false);

  useEffect(() => {
    applyMode(mode);
  }, [mode]);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = (event: MediaQueryListEvent): void => {
      if (manualRef.current) return;
      setMode(event.matches ? "dark" : "light");
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    manualRef.current = true;
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { mode, toggle };
}
