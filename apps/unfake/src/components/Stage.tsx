import { useEffect, useRef, useState } from "react"
import type { Raster } from "../engine/raster"
import type { ResultView } from "../hooks/use-lab"

type Props = {
  source: Raster | null
  result: ResultView | null
  grid: boolean
  split: number
  onSplit: (value: number) => void
}

type Fit = { dw: number; dh: number; ox: number; oy: number }

function drawLayer(
  canvas: HTMLCanvasElement,
  fit: Fit,
  paint: (ctx: CanvasRenderingContext2D, fit: Fit) => void,
) {
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const w = Math.max(1, Math.round(fit.dw * dpr))
  const h = Math.max(1, Math.round(fit.dh * dpr))
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
  }
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, fit.dw, fit.dh)
  paint(ctx, fit)
}

function blit(raster: Raster) {
  const tmp = document.createElement("canvas")
  tmp.width = raster.width
  tmp.height = raster.height
  const tctx = tmp.getContext("2d")
  if (!tctx) return tmp
  tctx.putImageData(new ImageData(new Uint8ClampedArray(raster.data), raster.width, raster.height), 0, 0)
  return tmp
}

export function Stage({ source, result, grid, split, onSplit }: Props) {
  const frameRef = useRef<HTMLDivElement>(null)
  const beforeRef = useRef<HTMLCanvasElement>(null)
  const afterRef = useRef<HTMLCanvasElement>(null)
  const loupeRef = useRef<HTMLCanvasElement>(null)
  const fitRef = useRef<Fit>({ dw: 1, dh: 1, ox: 0, oy: 0 })
  const [fit, setFit] = useState<Fit>({ dw: 1, dh: 1, ox: 0, oy: 0 })
  const [sample, setSample] = useState({ x: 8, y: 8, after: false })
  const [svgImage, setSvgImage] = useState<HTMLImageElement | null>(null)
  const dragging = useRef(false)

  useEffect(() => {
    if (!result?.svg) {
      setSvgImage(null)
      return
    }
    let cancelled = false
    const url = URL.createObjectURL(new Blob([result.svg], { type: "image/svg+xml" }))
    const image = new Image()
    image.onload = () => {
      if (!cancelled) setSvgImage(image)
    }
    image.src = url
    return () => {
      cancelled = true
      URL.revokeObjectURL(url)
    }
  }, [result?.svg])

  useEffect(() => {
    const frame = frameRef.current
    const before = beforeRef.current
    const after = afterRef.current
    if (!frame || !before || !after || !source) return

    const paint = () => {
      const rect = frame.getBoundingClientRect()
      const scale = Math.min(rect.width / source.width, rect.height / source.height)
      const dw = source.width * scale
      const dh = source.height * scale
      const next = { dw, dh, ox: (rect.width - dw) / 2, oy: (rect.height - dh) / 2 }
      const fit = next
      fitRef.current = next
      setFit((prev) =>
        prev.dw === next.dw && prev.dh === next.dh && prev.ox === next.ox && prev.oy === next.oy ? prev : next,
      )
      before.style.left = `${fit.ox}px`
      before.style.top = `${fit.oy}px`
      before.style.width = `${fit.dw}px`
      before.style.height = `${fit.dh}px`
      after.style.left = `${fit.ox}px`
      after.style.top = `${fit.oy}px`
      after.style.width = `${fit.dw}px`
      after.style.height = `${fit.dh}px`
      const srcCanvas = blit(source)
      drawLayer(before, fit, (ctx) => {
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(srcCanvas, 0, 0, fit.dw, fit.dh)
      })
      drawLayer(after, fit, (ctx) => {
        if (!result) return
        if (svgImage) {
          ctx.imageSmoothingEnabled = true
          ctx.drawImage(svgImage, 0, 0, fit.dw, fit.dh)
          return
        }
        const out = blit(result.raster)
        ctx.imageSmoothingEnabled = false
        const unit = fit.dw / source.width
        ctx.drawImage(
          out,
          result.offsetX * unit,
          result.offsetY * unit,
          result.raster.width * result.scale * unit,
          result.raster.height * result.scale * unit,
        )
      })
    }

    paint()
    const observer = new ResizeObserver(paint)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [source, result, svgImage])

  useEffect(() => {
    const loupe = loupeRef.current
    if (!loupe || !source) return
    const ctx = loupe.getContext("2d")
    if (!ctx) return
    const cells = 12
    const size = 132
    loupe.width = size
    loupe.height = size
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, size, size)
    const unit = size / cells
    const useAfter = sample.after && result
    for (let dy = 0; dy < cells; dy++) {
      for (let dx = 0; dx < cells; dx++) {
        const sx = Math.floor(sample.x) - cells / 2 + dx
        const sy = Math.floor(sample.y) - cells / 2 + dy
        let r = 0
        let g = 0
        let b = 0
        let a = 0
        if (useAfter && result) {
          const rx = Math.floor((sx - result.offsetX) / result.scale)
          const ry = Math.floor((sy - result.offsetY) / result.scale)
          if (rx >= 0 && ry >= 0 && rx < result.raster.width && ry < result.raster.height) {
            const i = (ry * result.raster.width + rx) * 4
            r = result.raster.data[i]
            g = result.raster.data[i + 1]
            b = result.raster.data[i + 2]
            a = result.raster.data[i + 3]
          }
        } else if (sx >= 0 && sy >= 0 && sx < source.width && sy < source.height) {
          const i = (sy * source.width + sx) * 4
          r = source.data[i]
          g = source.data[i + 1]
          b = source.data[i + 2]
          a = source.data[i + 3]
        }
        ctx.fillStyle = a === 0 ? "transparent" : `rgba(${r} ${g} ${b} / ${a / 255})`
        ctx.fillRect(dx * unit, dy * unit, unit + 0.5, unit + 0.5)
      }
    }
    ctx.strokeStyle = "rgba(255 255 255 / 0.9)"
    ctx.lineWidth = 1
    ctx.strokeRect((cells / 2) * unit, (cells / 2) * unit, unit, unit)
  }, [sample, source, result])

  function pointFromEvent(event: { clientX: number; clientY: number }) {
    const frame = frameRef.current
    if (!frame || !source) return null
    const rect = frame.getBoundingClientRect()
    const fit = fitRef.current
    const x = (event.clientX - rect.left - fit.ox) / (fit.dw / source.width)
    const y = (event.clientY - rect.top - fit.oy) / (fit.dh / source.height)
    const after = (event.clientX - rect.left - fit.ox) / fit.dw > split / 100
    return { x, y, after }
  }

  function moveSplit(clientX: number) {
    const frame = frameRef.current
    if (!frame) return
    const rect = frame.getBoundingClientRect()
    const fit = fitRef.current
    const next = ((clientX - rect.left - fit.ox) / fit.dw) * 100
    onSplit(Math.max(0, Math.min(100, next)))
  }

  const lines: number[][] = []
  if (grid && source && result && result.scale > 1) {
    const unit = fit.dw / source.width
    for (let x = result.offsetX; x <= source.width; x += result.scale) lines.push([x * unit, 0, x * unit, fit.dh])
    for (let y = result.offsetY; y <= source.height; y += result.scale) lines.push([0, y * unit, fit.dw, y * unit])
  }

  return (
    <div
      ref={frameRef}
      className="stage"
      onPointerMove={(event) => {
        const point = pointFromEvent(event)
        if (point) setSample(point)
      }}
    >
      <canvas ref={beforeRef} className="layer" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }} />
      <canvas ref={afterRef} className="layer after" style={{ clipPath: `inset(0 0 0 ${split}%)` }} />
      {grid && source && result && result.scale > 1 && (
        <svg
          className="gridlines"
          style={{
            left: fit.ox,
            top: fit.oy,
            width: fit.dw,
            height: fit.dh,
          }}
          aria-hidden="true"
        >
          {lines.map((line, i) => (
            <line key={i} x1={line[0]} y1={line[1]} x2={line[2]} y2={line[3]} />
          ))}
        </svg>
      )}
      <div
        className="divider"
        role="slider"
        tabIndex={0}
        aria-label="对比"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(split)}
        aria-valuetext={`${Math.round(split)}%`}
        style={{ left: `${fit.ox + (fit.dw * split) / 100}px` }}
        onPointerDown={(event) => {
          dragging.current = true
          event.currentTarget.setPointerCapture(event.pointerId)
          moveSplit(event.clientX)
        }}
        onPointerMove={(event) => {
          if (dragging.current) moveSplit(event.clientX)
        }}
        onPointerUp={(event) => {
          dragging.current = false
          event.currentTarget.releasePointerCapture(event.pointerId)
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault()
            const delta = event.key === "ArrowLeft" ? -2 : 2
            onSplit(Math.max(0, Math.min(100, split + delta)))
          } else if (event.key === "Home") {
            onSplit(0)
          } else if (event.key === "End") {
            onSplit(100)
          }
        }}
        onDoubleClick={() => onSplit(50)}
      />
      <canvas
        ref={loupeRef}
        className="loupe"
        width={132}
        height={132}
        aria-hidden="true"
      />
    </div>
  )
}
