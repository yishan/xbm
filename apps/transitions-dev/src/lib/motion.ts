import { createContext, useContext, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react"

const QUERY = "(prefers-reduced-motion: reduce)"

function subscribe(cb: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", cb)
  return () => mql.removeEventListener("change", cb)
}

/** Live value of the OS-level `prefers-reduced-motion` setting. */
export function useSystemReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}

export const ReducedMotionContext = createContext(false)

/** True when either the OS or the in-app toggle asks for reduced motion. */
export function useReducedMotion() {
  return useContext(ReducedMotionContext)
}

/**
 * Run `fn` whenever `trigger` changes (skipping the initial value).
 * Cards pass an incrementing counter so every demo can be replayed.
 */
export function useTrigger(trigger: number, fn: () => void) {
  const initial = useRef(trigger)
  const fnRef = useRef(fn)
  useLayoutEffect(() => {
    fnRef.current = fn
  })
  useEffect(() => {
    if (trigger === initial.current) return
    fnRef.current()
  }, [trigger])
}

/** setTimeout registry that is cleared on unmount / reset. */
export function useTimeouts() {
  const ids = useRef<number[]>([])
  useEffect(() => () => ids.current.forEach((id) => window.clearTimeout(id)), [])
  return {
    set(fn: () => void, ms: number) {
      ids.current.push(window.setTimeout(fn, ms))
    },
    clear() {
      ids.current.forEach((id) => window.clearTimeout(id))
      ids.current = []
    },
  }
}
