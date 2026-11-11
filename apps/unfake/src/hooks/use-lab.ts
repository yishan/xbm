import { useEffect, useRef, useState } from "react"
import {
  DEFAULT_PIXEL,
  DEFAULT_VECTOR,
  type PixelSettings,
  type VectorSettings,
} from "../engine/pipeline"
import { remapColor } from "../engine/quantize"
import type { Raster } from "../engine/raster"
import { blobToRaster } from "../lib/load"

export type Mode = "pixel" | "vector"

export type ResultView = {
  raster: Raster
  palette: string[]
  scale: number
  offsetX: number
  offsetY: number
  svg: string | null
}

type WorkerOk = {
  id: number
  ok: true
  width: number
  height: number
  data: Uint8ClampedArray
  palette: string[]
  scale: number
  offsetX: number
  offsetY: number
  svg: string | null
}

type WorkerFail = { id: number; ok: false; error: string }

const SAMPLES = [
  { id: "lighthouse", name: "灯塔", file: "lighthouse.png" },
  { id: "mushroom", name: "蘑菇", file: "mushroom.png" },
  { id: "knight", name: "骑士", file: "knight.png" },
  { id: "potion", name: "药水", file: "potion.png" },
] as const

export type SampleId = (typeof SAMPLES)[number]["id"]

export function sampleList() {
  return SAMPLES
}

export function useLab() {
  const workerRef = useRef<Worker | null>(null)
  const seq = useRef(0)
  const [mode, setMode] = useState<Mode>("pixel")
  const [pixel, setPixel] = useState<PixelSettings>(DEFAULT_PIXEL)
  const [vector, setVector] = useState<VectorSettings>(DEFAULT_VECTOR)
  const [source, setSource] = useState<Raster | null>(null)
  const [sourceName, setSourceName] = useState<SampleId | "file">("lighthouse")
  const [result, setResult] = useState<ResultView | null>(null)
  const [busy, setBusy] = useState(true)
  const [note, setNote] = useState("正在处理")
  const [grid, setGrid] = useState(true)

  useEffect(() => {
    const worker = new Worker(new URL("../worker/process.worker.ts", import.meta.url), { type: "module" })
    workerRef.current = worker
    worker.onmessage = (event: MessageEvent<WorkerOk | WorkerFail>) => {
      const msg = event.data
      if (msg.id !== seq.current) return
      setBusy(false)
      if (!msg.ok) {
        setNote(msg.error)
        return
      }
      const raster = { data: msg.data, width: msg.width, height: msg.height }
      setResult({
        raster,
        palette: msg.palette,
        scale: msg.scale,
        offsetX: msg.offsetX,
        offsetY: msg.offsetY,
        svg: msg.svg,
      })
      const kind = msg.svg ? "SVG" : `${msg.scale}×`
      setNote(`${kind} · ${msg.width}×${msg.height} · ${msg.palette.length} 色`)
    }
    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}samples/lighthouse.png`)
      if (!res.ok) throw new Error("示例图加载失败")
      const raster = await blobToRaster(await res.blob())
      if (!cancelled) setSource(raster)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!source || !workerRef.current) return
    const id = ++seq.current
    setBusy(true)
    const timer = window.setTimeout(() => {
      const worker = workerRef.current
      if (!worker) return
      const data = source.data.slice()
      if (mode === "pixel") {
        worker.postMessage({ id, kind: "pixel", width: source.width, height: source.height, data, pixel }, [data.buffer])
      } else {
        worker.postMessage({ id, kind: "vector", width: source.width, height: source.height, data, vector }, [data.buffer])
      }
    }, 48)
    return () => window.clearTimeout(timer)
  }, [source, mode, pixel, vector])

  async function loadBlob(blob: Blob, name: SampleId | "file") {
    const raster = await blobToRaster(blob)
    setSourceName(name)
    setResult(null)
    setSource(raster)
  }

  async function loadSample(id: SampleId) {
    const sample = SAMPLES.find((item) => item.id === id)
    if (!sample) return
    const res = await fetch(`${import.meta.env.BASE_URL}samples/${sample.file}`)
    if (!res.ok) {
      setNote("示例图加载失败")
      return
    }
    await loadBlob(await res.blob(), id)
  }

  function swapColor(from: string, to: string) {
    const next = to.toLowerCase()
    const prev = from.toLowerCase()
    setResult((current) => {
      if (!current) return current
      const raster = remapColor(current.raster, prev, next)
      const svg = current.svg ? replaceSvgColor(current.svg, prev, next) : null
      const palette = [...new Set(current.palette.map((color) => (color.toLowerCase() === prev ? next : color.toLowerCase())))]
      return { ...current, raster, svg, palette }
    })
  }

  async function traceCurrent(): Promise<string | null> {
    const worker = workerRef.current
    const current = result
    if (!worker || !current) return current?.svg ?? null
    if (current.svg) return current.svg
    const id = ++seq.current
    setBusy(true)
    const data = current.raster.data.slice()
    return new Promise((resolve) => {
      const previous = worker.onmessage
      worker.onmessage = (event: MessageEvent<WorkerOk | WorkerFail>) => {
        const msg = event.data
        if (msg.id !== id) {
          previous?.call(worker, event)
          return
        }
        worker.onmessage = previous
        setBusy(false)
        if (!msg.ok || !msg.svg) {
          setNote(msg.ok ? "没有 SVG" : msg.error)
          resolve(null)
          return
        }
        setResult((view) => (view ? { ...view, svg: msg.svg } : view))
        setNote(`SVG · ${msg.width}×${msg.height} · ${msg.palette.length} 色`)
        resolve(msg.svg)
      }
      worker.postMessage(
        { id, kind: "trace", width: current.raster.width, height: current.raster.height, data, detail: 78 },
        [data.buffer],
      )
    })
  }

  return {
    mode,
    setMode,
    pixel,
    setPixel,
    vector,
    setVector,
    source,
    sourceName,
    result,
    busy,
    note,
    setNote,
    grid,
    setGrid,
    loadBlob,
    loadSample,
    swapColor,
    traceCurrent,
  }
}

function replaceSvgColor(svg: string, from: string, to: string): string {
  const parse = (hex: string) => {
    const n = Number.parseInt(hex.replace("#", ""), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const
  }
  const [fr, fg, fb] = parse(from)
  const [tr, tg, tb] = parse(to)
  return svg.replace(new RegExp(`rgb\\(\\s*${fr}\\s*,\\s*${fg}\\s*,\\s*${fb}\\s*\\)`, "g"), `rgb(${tr},${tg},${tb})`)
}
