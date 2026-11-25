import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  DEFAULTS,
  parseHash,
  toHash,
  type ReviewState,
} from "./state";

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useHashState(): [
  ReviewState,
  (patch: Partial<ReviewState>) => void,
  () => void,
] {
  const [state, setState] = useState<ReviewState>(() =>
    parseHash(window.location.hash),
  );

  useEffect(() => {
    const onHashChange = () => {
      setState(parseHash(window.location.hash));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const set = useCallback((patch: Partial<ReviewState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      window.history.replaceState(
        null,
        "",
        toHash(next) || window.location.pathname + window.location.search,
      );
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    setState(DEFAULTS);
  }, []);

  return [state, set, reset];
}

export function useTheme(): [boolean, () => void] {
  const getStoredChoice = (): string | null =>
    window.localStorage.getItem("tuffui-theme");

  const getInitialDark = (): boolean => {
    const stored = getStoredChoice();
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [dark, setDark] = useState<boolean>(getInitialDark);
  const [storedChoice, setStoredChoice] = useState<string | null>(getStoredChoice);

  useEffect(() => {
    if (storedChoice !== null) return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      setDark(event.matches);
    };
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [storedChoice]);

  const toggle = useCallback(() => {
    const next = !dark;
    window.localStorage.setItem("tuffui-theme", next ? "dark" : "light");
    setStoredChoice(next ? "dark" : "light");
    setDark(next);
  }, [dark]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.classList.add("theme-switching");

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        root.classList.remove("theme-switching");
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [dark]);

  return [dark, toggle];
}

export function useTicker(
  active: boolean,
  onTick: (dtMs: number) => void,
): void {
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (!active) return;

    let rafId = 0;
    let previous: number | null = null;

    const loop = (now: number) => {
      if (previous === null) {
        previous = now;
      }
      const dt = Math.min(now - previous, 100);
      previous = now;
      onTickRef.current(dt);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [active]);
}
