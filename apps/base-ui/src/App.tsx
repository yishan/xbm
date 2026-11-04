import { useCallback, useEffect, useRef, useState } from "react"
import { Toast } from "@base-ui/react/toast"
import { Board, ToastList } from "./lab/Board"
import { StateLabels } from "./lab/StateLabels"
import { TuningBar } from "./lab/TuningBar"
import { DEFAULT_TUNING, toCss, toVars } from "./lab/tuning"
import type { Tuning } from "./lab/tuning"
import "./lab/lab.css"

function App() {
  const [tuning, setTuning] = useState<Tuning>(DEFAULT_TUNING)
  const [inspect, setInspect] = useState(false)
  const [copied, setCopied] = useState(false)
  const [dark, setDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  )

  const userPickedTheme = useRef(false)
  const copiedTimer = useRef<number | null>(null)

  // Follow the system theme until the user picks one.
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = (event: MediaQueryListEvent) => {
      if (!userPickedTheme.current) setDark(event.matches)
    }
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  // Apply the theme without transitioning every surface at once.
  useEffect(() => {
    const root = document.documentElement
    root.classList.add("lab-no-transition")
    root.classList.toggle("dark", dark)
    const first = requestAnimationFrame(() => {
      requestAnimationFrame(() => root.classList.remove("lab-no-transition"))
    })
    return () => {
      cancelAnimationFrame(first)
      root.classList.remove("lab-no-transition")
    }
  }, [dark])

  // Write the tuning vars on <html> so portaled popups inherit them too.
  useEffect(() => {
    const root = document.documentElement
    const vars = toVars(tuning)
    for (const [name, value] of Object.entries(vars)) {
      root.style.setProperty(name, value)
    }
    root.dataset.origin = tuning.origin
  }, [tuning])

  useEffect(() => {
    return () => {
      if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current)
    }
  }, [])

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(toCss(tuning)).then(() => {
      setCopied(true)
      if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current)
      copiedTimer.current = window.setTimeout(() => setCopied(false), 1500)
    })
  }, [tuning])

  const handleDark = useCallback(() => {
    userPickedTheme.current = true
    setDark((current) => !current)
  }, [])

  return (
    <Toast.Provider>
      <div className="lab min-h-screen" data-inspect={inspect ? "" : undefined}>
        <TuningBar
          tuning={tuning}
          onChange={setTuning}
          inspect={inspect}
          onInspect={setInspect}
          onCopy={handleCopy}
          copied={copied}
          dark={dark}
          onDark={handleDark}
        />
        <main>
          <Board />
        </main>
      </div>
      <ToastList />
      <StateLabels enabled={inspect} />
    </Toast.Provider>
  )
}

export default App
