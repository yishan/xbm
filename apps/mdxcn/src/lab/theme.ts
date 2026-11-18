import { useCallback, useEffect, useRef, useState } from "react";

export function useTheme(): { dark: boolean; toggle: () => void } {
  const [dark, setDark] = useState<boolean>(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [manual, setManual] = useState(false);
  const frame = useRef<number | null>(null);

  const beginThemeSwitch = useCallback(() => {
    const root = document.documentElement;
    root.classList.add("theme-switching");

    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
    }

    frame.current = requestAnimationFrame(() => {
      frame.current = requestAnimationFrame(() => {
        root.classList.remove("theme-switching");
        frame.current = null;
      });
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    if (manual) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      beginThemeSwitch();
      setDark(event.matches);
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [manual, beginThemeSwitch]);

  const toggle = useCallback(() => {
    setManual(true);
    beginThemeSwitch();
    setDark((prev) => !prev);
  }, [beginThemeSwitch]);

  return { dark, toggle };
}
