import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { parseHash, toHash, DEFAULTS } from "./state";
import type { HudState } from "./state";

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useHashState(): [HudState, (patch: Partial<HudState>) => void, () => void] {
  const [state, setState] = useState<HudState>(() => parseHash(window.location.hash));
  const stateRef = useRef<HudState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const onHashChange = () => {
      const next = parseHash(window.location.hash);
      stateRef.current = next;
      setState(next);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const set = useCallback((patch: Partial<HudState>) => {
    const next = { ...stateRef.current, ...patch };
    const hash = toHash(next);
    window.history.replaceState(null, "", hash || window.location.pathname + window.location.search);
    stateRef.current = next;
    setState(next);
  }, []);

  const reset = useCallback(() => {
    const next = DEFAULTS;
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    stateRef.current = next;
    setState(next);
  }, []);

  return [state, set, reset];
}

export function useMissionClock(): () => string {
  const startRef = useRef<number | null>(null);
  if (startRef.current === null) {
    startRef.current = Date.now();
  }

  return useCallback(() => {
    const start = startRef.current ?? Date.now();
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);
}
