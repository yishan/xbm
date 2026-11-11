import { useEffect, useRef, useState } from "react"
import { Bench } from "./components/Bench"
import { Stage } from "./components/Stage"
import { useLab, type SampleId } from "./hooks/use-lab"
import { downloadBlob, rasterToPng, scaleNearest } from "./lib/load"

type Theme = "system" | "light" | "dark"

function initialTheme(): Theme {
  try {
    const stored = localStorage.getItem("unfake-theme")
    if (stored === "light" || stored === "dark" || stored === "system") return stored
  } catch {
    /* ignore */
  }
  return "system"
}

export default function App() {
  const lab = useLab()
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [split, setSplit] = useState(62)
  const [flash, setFlash] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const dragDepth = useRef(0)
  const [draggingFile, setDraggingFile] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    if (theme !== "system") root.classList.add(theme)
    try {
      localStorage.setItem("unfake-theme", theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const file = [...(event.clipboardData?.files ?? [])].find((item) => item.type.startsWith("image/"))
      if (!file) return
      event.preventDefault()
      void lab.loadBlob(file, "file")
    }
    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [lab])

  useEffect(() => {
    if (!flash) return
    const timer = window.setTimeout(() => setFlash(null), 1600)
    return () => window.clearTimeout(timer)
  }, [flash])

  async function exportPng(kind: "native" | "upscale") {
    if (!lab.result) return
    const factor = kind === "upscale" ? Math.max(4, lab.result.scale) : 1
    const capped = Math.min(factor, Math.floor(1600 / Math.max(lab.result.raster.width, lab.result.raster.height)))
    const raster = kind === "upscale" ? scaleNearest(lab.result.raster, Math.max(2, capped)) : lab.result.raster
    downloadBlob(await rasterToPng(raster), kind === "upscale" ? "unfake-up.png" : "unfake-1x.png")
  }

  async function exportSvg() {
    const svg = await lab.traceCurrent()
    if (!svg) return
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "unfake.svg")
  }

  async function copySettings() {
    const text = JSON.stringify({ mode: lab.mode, pixel: lab.pixel, vector: lab.vector }, null, 2)
    try {
      await navigator.clipboard.writeText(text)
      setFlash("已复制")
    } catch {
      setFlash("未能复制")
    }
  }

  return (
    <div
      className="lab"
      data-drag={draggingFile ? "on" : "off"}
      onDragEnter={(event) => {
        event.preventDefault()
        dragDepth.current += 1
        setDraggingFile(true)
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => {
        dragDepth.current = Math.max(0, dragDepth.current - 1)
        if (dragDepth.current === 0) setDraggingFile(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        dragDepth.current = 0
        setDraggingFile(false)
        const file = [...event.dataTransfer.files].find((item) => item.type.startsWith("image/"))
        if (file) void lab.loadBlob(file, "file")
      }}
    >
      <header className="topbar">
        <h1>Unfake</h1>
        <div className="tabs" role="tablist" aria-label="模式">
          <button
            type="button"
            role="tab"
            aria-selected={lab.mode === "pixel"}
            onClick={() => lab.setMode("pixel")}
            onKeyDown={(event) => {
              if (event.key !== "ArrowRight") return
              event.preventDefault()
              lab.setMode("vector")
              const next = event.currentTarget.parentElement?.querySelectorAll("button")[1]
              next?.focus()
            }}
          >
            像素
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={lab.mode === "vector"}
            onClick={() => lab.setMode("vector")}
            onKeyDown={(event) => {
              if (event.key !== "ArrowLeft") return
              event.preventDefault()
              lab.setMode("pixel")
              const prev = event.currentTarget.parentElement?.querySelectorAll("button")[0]
              prev?.focus()
            }}
          >
            矢量
          </button>
        </div>
        <span className="grow" />
        <div className="segment" role="radiogroup" aria-label="外观">
          {(["system", "light", "dark"] as const).map((id) => (
            <button key={id} type="button" role="radio" aria-checked={theme === id} onClick={() => setTheme(id)}>
              {id === "system" ? "系统" : id === "light" ? "浅色" : "深色"}
            </button>
          ))}
        </div>
      </header>
      <div className="stage-wrap" aria-busy={lab.busy}>
        <Stage source={lab.source} result={lab.result} grid={lab.grid && lab.mode === "pixel"} split={split} onSplit={setSplit} />
      </div>
      <Bench
        mode={lab.mode}
        pixel={lab.pixel}
        vector={lab.vector}
        sourceName={lab.sourceName}
        result={lab.result}
        note={flash ?? lab.note}
        grid={lab.grid}
        onPixel={lab.setPixel}
        onVector={lab.setVector}
        onSample={(id: SampleId) => void lab.loadSample(id)}
        onOpen={() => fileRef.current?.click()}
        onGrid={lab.setGrid}
        onSwap={lab.swapColor}
        onExportPng={(kind) => void exportPng(kind)}
        onExportSvg={() => void exportSvg()}
        onCopy={() => void copySettings()}
      />
      <input
        ref={fileRef}
        className="sr-only"
        type="file"
        accept="image/*"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void lab.loadBlob(file, "file")
          event.target.value = ""
        }}
      />
    </div>
  )
}
