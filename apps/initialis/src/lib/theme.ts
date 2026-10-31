import { useEffect, useState } from "react";
import type { CapSettings } from "@/lib/initialis";

/** Follows prefers-color-scheme; toggles the `.dark` class on <html>. */
export function useDark(): [boolean, (dark: boolean) => void] {
  const mq = typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const [dark, setDark] = useState<boolean>(() => mq?.matches ?? false);
  useEffect(() => {
    if (!mq) return;
    const on = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [mq]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return [dark, setDark];
}

/** In dark theme the cap swaps paper and ink A so the canvas follows the page. */
export function themed(settings: CapSettings, dark: boolean): CapSettings {
  if (!dark) return settings;
  const paper = settings.paper ?? "#f3eee3";
  const inkA = settings.inkA ?? "#1a1614";
  return { ...settings, paper: inkA, inkA: paper };
}

/** Starting cap (示例数据 look): Book variant from the prototype. */
export const START: CapSettings = { text: "I", font: "cinzel-700", frame: "rect", inkA: "#1f2a44", inkB: "#9a2f1f" };
