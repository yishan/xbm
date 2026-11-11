import { paletteObjects, processPixel, processVector, traceOptions, type PixelSettings, type VectorSettings } from "../engine/pipeline"
import { paletteOf } from "../engine/quantize"
import type { Raster } from "../engine/raster"
import "../vendor/imagetracer.js"

type Tracer = {
  imagedataToSVG(img: ImageData, options: Record<string, unknown>): string
}

type InMsg = {
  id: number
  kind: "pixel" | "vector" | "trace"
  width: number
  height: number
  data: Uint8ClampedArray
  pixel?: PixelSettings
  vector?: VectorSettings
  detail?: number
}

type OutOk = {
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

function tracer(): Tracer {
  return (self as unknown as { ImageTracer: Tracer }).ImageTracer
}

function trace(img: Raster, detail: number, colors: string[]): string {
  const image = new ImageData(new Uint8ClampedArray(img.data), img.width, img.height)
  return tracer().imagedataToSVG(image, traceOptions(detail, paletteObjects(colors)))
}

self.onmessage = (event: MessageEvent<InMsg>) => {
  const msg = event.data
  try {
    const raster: Raster = { data: msg.data, width: msg.width, height: msg.height }
    if (msg.kind === "pixel" && msg.pixel) {
      const result = processPixel(raster, msg.pixel)
      const data = result.raster.data
      const payload: OutOk = {
        id: msg.id,
        ok: true,
        width: result.raster.width,
        height: result.raster.height,
        data,
        palette: result.palette,
        scale: result.scale,
        offsetX: result.offsetX,
        offsetY: result.offsetY,
        svg: null,
      }
      self.postMessage(payload, { transfer: [data.buffer] })
      return
    }
    if (msg.kind === "vector" && msg.vector) {
      const result = processVector(raster, msg.vector, trace)
      const data = result.raster.data
      const payload: OutOk = {
        id: msg.id,
        ok: true,
        width: result.raster.width,
        height: result.raster.height,
        data,
        palette: result.palette,
        scale: result.scale,
        offsetX: result.offsetX,
        offsetY: result.offsetY,
        svg: result.svg,
      }
      self.postMessage(payload, { transfer: [data.buffer] })
      return
    }
    if (msg.kind === "trace") {
      const colors = paletteOf(raster)
      const svg = trace(raster, msg.detail ?? 70, colors)
      const payload: OutOk = {
        id: msg.id,
        ok: true,
        width: raster.width,
        height: raster.height,
        data: raster.data,
        palette: colors,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        svg,
      }
      self.postMessage(payload)
      return
    }
    self.postMessage({ id: msg.id, ok: false, error: "未知任务" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "处理失败"
    self.postMessage({ id: msg.id, ok: false, error: message })
  }
}
