/**
 * Pixel and vector pipelines. Quantization is median-cut (see quantize.ts).
 */

import { contentAdaptive } from "./adaptive"
import { alphaBinarize, countOpaque, finalizePixels, jaggyClean, morphologicalCleanup } from "./cleanup"
import { detectScale } from "./detect"
import { downscaleDominant, downscaleMedian, downscaleNearest } from "./downscale"
import { bilateral, fillBackground, gaussian, hasTransparency, knockout, MAGIC, medianFilter, removeSvgBackground, snapKey } from "./filters"
import { paletteOf, quantize } from "./quantize"
import { fitLongest, type Raster } from "./raster"
import { snapToGrid } from "./snap"

export type DownscaleMethod = "dominant" | "median" | "adaptive" | "nearest"
export type Denoise = "off" | "bilateral" | "median"

export type PixelSettings = {
  scaleMode: "auto" | "manual"
  manualScale: number
  downscale: DownscaleMethod
  maxColors: number
  morph: boolean
  jaggy: boolean
  alphaThreshold: number
  snap: boolean
}

export type VectorSettings = {
  denoise: Denoise
  denoiseSize: number
  maxColors: number
  smooth: number
  detail: number
}

export type ProcessResult = {
  raster: Raster
  palette: string[]
  scale: number
  offsetX: number
  offsetY: number
  svg: string | null
}

export const DEFAULT_PIXEL: PixelSettings = {
  scaleMode: "auto",
  manualScale: 8,
  downscale: "dominant",
  maxColors: 16,
  morph: true,
  jaggy: true,
  alphaThreshold: 128,
  snap: true,
}

export const DEFAULT_VECTOR: VectorSettings = {
  denoise: "bilateral",
  denoiseSize: 7,
  maxColors: 12,
  smooth: 1,
  detail: 62,
}

function clampScale(img: Raster, scale: number): number {
  const cap = Math.max(1, Math.floor(Math.min(img.width, img.height) / 2))
  return Math.max(1, Math.min(cap, Math.round(scale)))
}

export function processPixel(src: Raster, settings: PixelSettings): ProcessResult {
  let current = alphaBinarize(src, settings.alphaThreshold)
  const scale =
    settings.scaleMode === "manual" ? clampScale(current, settings.manualScale) : detectScale(current)

  let offsetX = 0
  let offsetY = 0
  if (settings.snap && scale > 1) {
    const snapped = snapToGrid(current, scale)
    current = snapped.raster
    offsetX = snapped.offsetX
    offsetY = snapped.offsetY
  }

  if (settings.morph && scale > 1) current = morphologicalCleanup(current)

  const beforeDownscale = settings.downscale === "dominant" || settings.downscale === "nearest"
  if (beforeDownscale && countOpaque(current) > settings.maxColors) {
    current = quantize(current, settings.maxColors).raster
  }

  if (scale > 1) {
    const tw = Math.max(1, Math.floor(current.width / scale))
    const th = Math.max(1, Math.floor(current.height / scale))
    switch (settings.downscale) {
      case "dominant":
        current = downscaleDominant(current, scale, 0.15)
        break
      case "median":
        current = downscaleMedian(current, scale)
        break
      case "nearest":
        current = downscaleNearest(current, scale)
        break
      case "adaptive":
        current = contentAdaptive(current, tw, th)
        break
      default: {
        const _never: never = settings.downscale
        throw new Error(`unknown downscale ${_never}`)
      }
    }
    current = finalizePixels(current)
  }

  const quantizeAfter = settings.downscale === "median" || settings.downscale === "adaptive" || scale <= 1
  if (quantizeAfter && countOpaque(current) > settings.maxColors) {
    current = finalizePixels(quantize(current, settings.maxColors).raster)
  }

  if (settings.jaggy) current = jaggyClean(current)

  return {
    raster: current,
    palette: paletteOf(current),
    scale,
    offsetX,
    offsetY,
    svg: null,
  }
}

export type Tracer = {
  imagedataToSVG(img: ImageData, options: Record<string, unknown>): string
}

export function traceOptions(detail: number, palette: Array<{ r: number; g: number; b: number; a: number }>) {
  const t = Math.max(0, Math.min(100, detail)) / 100
  return {
    ltres: 2.4 - t * 2.15,
    qtres: 2.4 - t * 2.15,
    pathomit: Math.round(20 - t * 18),
    rightangleenhance: true,
    colorsampling: 0,
    numberofcolors: Math.max(2, palette.length),
    mincolorratio: 0,
    colorquantcycles: 1,
    strokewidth: 0,
    linefilter: false,
    scale: 1,
    roundcoords: 1,
    viewbox: true,
    desc: false,
    blurradius: 0,
    blurdelta: 20,
    pal: palette,
  }
}

export function paletteObjects(colors: string[]): Array<{ r: number; g: number; b: number; a: number }> {
  return colors.map((hex) => {
    const n = Number.parseInt(hex.slice(1), 16)
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 255 }
  })
}

export function processVector(src: Raster, settings: VectorSettings, trace: (img: Raster, detail: number, colors: string[]) => string): ProcessResult {
  let current = fitLongest(src, 480)
  const masked = hasTransparency(current)
  if (masked) current = fillBackground(current, MAGIC)
  switch (settings.denoise) {
    case "off":
      break
    case "bilateral":
      current = bilateral(current, Math.max(3, Math.min(11, settings.denoiseSize)))
      break
    case "median":
      current = medianFilter(current, Math.max(3, Math.min(7, settings.denoiseSize)))
      break
    default: {
      const _never: never = settings.denoise
      throw new Error(`unknown denoise ${_never}`)
    }
  }
  if (settings.smooth > 0) current = gaussian(current, settings.smooth * 2 + 1)
  if (masked) current = snapKey(current)
  const quantized = quantize(current, settings.maxColors, masked ? [MAGIC[0], MAGIC[1], MAGIC[2]] : undefined)
  current = quantized.raster
  const palette = quantized.palette.filter((color) => color.toLowerCase() !== "#ff00ff")
  // The tracer needs the key in its palette so background pixels stay a layer we can strip.
  // The chips stay the visible colors only.
  const forTrace = masked ? ["#ff00ff", ...palette] : palette
  let svg = trace(current, settings.detail, forTrace)
  if (masked) svg = removeSvgBackground(svg)
  return {
    raster: masked ? knockout(current, MAGIC) : current,
    palette,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    svg,
  }
}
