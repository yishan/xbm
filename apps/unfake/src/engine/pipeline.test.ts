import { describe, expect, test } from "bun:test"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { contentAdaptive } from "./adaptive"
import { alphaBinarize, jaggyClean } from "./cleanup"
import { detectScale, runsBasedDetect } from "./detect"
import { isKeyColor } from "./filters"
import { quantize, remapColor } from "./quantize"
import { emptyRaster, type Raster } from "./raster"
import { snapToGrid } from "./snap"
import { DEFAULT_PIXEL, DEFAULT_VECTOR, processPixel, processVector } from "./pipeline"

function fillCell(img: Raster, x: number, y: number, rgb: [number, number, number]) {
  const i = (y * img.width + x) * 4
  img.data[i] = rgb[0]
  img.data[i + 1] = rgb[1]
  img.data[i + 2] = rgb[2]
  img.data[i + 3] = 255
}

function checker(cell: number, cells: number): Raster {
  const n = cell * cells
  const img = emptyRaster(n, n)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const on = ((x / cell) | 0) + ((y / cell) | 0)
      fillCell(img, x, y, on % 2 === 0 ? [220, 48, 36] : [28, 36, 64])
    }
  }
  return img
}

function upscaleNearest(src: Raster, scale: number): Raster {
  const width = src.width * scale
  const height = src.height * scale
  const img = emptyRaster(width, height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const si = (((y / scale) | 0) * src.width + ((x / scale) | 0)) * 4
      const di = (y * width + x) * 4
      img.data[di] = src.data[si]
      img.data[di + 1] = src.data[si + 1]
      img.data[di + 2] = src.data[si + 2]
      img.data[di + 3] = src.data[si + 3]
    }
  }
  return img
}

function boxBlur(src: Raster): Raster {
  const { width, height, data } = src
  const out = emptyRaster(width, height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      let n = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = Math.max(0, Math.min(width - 1, x + dx))
          const yy = Math.max(0, Math.min(height - 1, y + dy))
          const i = (yy * width + xx) * 4
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
          a += data[i + 3]
          n++
        }
      }
      const o = (y * width + x) * 4
      out.data[o] = r / n
      out.data[o + 1] = g / n
      out.data[o + 2] = b / n
      out.data[o + 3] = a / n
    }
  }
  return out
}

describe("pixel pipeline", () => {
  test("runs and edge detection recover an integer grid", () => {
    const art = checker(1, 8)
    const big = upscaleNearest(art, 4)
    expect(runsBasedDetect(big)).toBe(4)
    expect(detectScale(big)).toBe(4)
  })

  test("soft edges still land on the true scale", () => {
    const art = checker(1, 10)
    const soft = boxBlur(upscaleNearest(art, 6))
    const scale = detectScale(soft)
    expect(scale).toBeGreaterThanOrEqual(5)
    expect(scale).toBeLessThanOrEqual(7)
  })

  test("snap crops a shifted grid back onto the cell phase", () => {
    const art = upscaleNearest(checker(1, 6), 4)
    const padded = emptyRaster(art.width + 2, art.height + 2, [0, 0, 0, 255])
    for (let y = 0; y < art.height; y++) {
      for (let x = 0; x < art.width; x++) {
        const si = (y * art.width + x) * 4
        const di = ((y + 2) * padded.width + (x + 2)) * 4
        padded.data[di] = art.data[si]
        padded.data[di + 1] = art.data[si + 1]
        padded.data[di + 2] = art.data[si + 2]
        padded.data[di + 3] = 255
      }
    }
    const snapped = snapToGrid(padded, 4)
    expect(snapped.offsetX).toBeGreaterThanOrEqual(0)
    expect(snapped.offsetX).toBeLessThan(4)
    expect(snapped.raster.width % 4).toBe(0)
    expect(snapped.raster.height % 4).toBe(0)
    const recovered = processPixel(padded, {
      ...DEFAULT_PIXEL,
      scaleMode: "manual",
      manualScale: 4,
      maxColors: 4,
      morph: false,
    })
    expect(recovered.raster.width).toBe(6)
    expect(recovered.raster.height).toBe(6)
  })

  test("dominant downscale returns the native sprite", () => {
    const art = checker(1, 8)
    const big = upscaleNearest(art, 4)
    const out = processPixel(big, { ...DEFAULT_PIXEL, scaleMode: "manual", manualScale: 4, maxColors: 4, morph: false })
    expect(out.scale).toBe(4)
    expect(out.raster.width).toBe(8)
    expect(out.raster.height).toBe(8)
    expect(out.palette.length).toBeLessThanOrEqual(4)
    expect(out.palette.length).toBeGreaterThanOrEqual(2)
  })

  test("median-cut stops at the requested budget and keeps a smaller palette exact", () => {
    const img = emptyRaster(32, 8)
    for (let i = 0; i < 32 * 8; i++) {
      img.data[i * 4] = (i * 8) % 256
      img.data[i * 4 + 1] = (i * 3) % 256
      img.data[i * 4 + 2] = (i * 5) % 256
      img.data[i * 4 + 3] = 255
    }
    const q = quantize(img, 4)
    expect(q.palette.length).toBeLessThanOrEqual(4)
    expect(q.palette.length).toBeGreaterThan(0)
    const tiny = checker(1, 2)
    const exact = quantize(tiny, 8)
    expect(exact.palette.length).toBe(2)
  })

  test("alpha binarize, jaggy removal, and palette swap", () => {
    const img = emptyRaster(3, 3)
    img.data[3] = 10
    img.data[7] = 200
    const bin = alphaBinarize(img, 128)
    expect(bin.data[3]).toBe(0)
    expect(bin.data[7]).toBe(255)

    const jag = emptyRaster(3, 3)
    fillCell(jag, 1, 1, [255, 0, 0])
    fillCell(jag, 2, 0, [255, 0, 0])
    const cleaned = jaggyClean(jag)
    expect(cleaned.data[(1 * 3 + 1) * 4 + 3]).toBe(0)

    const swapped = remapColor(jag, "#ff0000", "#0000ff")
    const painted = (1 * 3 + 1) * 4
    expect(swapped.data[painted]).toBe(0)
    expect(swapped.data[painted + 2]).toBe(255)
    expect(swapped.data[painted + 3]).toBe(255)
  })

  test("vector palette stays inside the color budget", () => {
    const img = emptyRaster(48, 24)
    for (let i = 0; i < 48 * 24; i++) {
      img.data[i * 4] = (i * 17) % 256
      img.data[i * 4 + 1] = (i * 29) % 256
      img.data[i * 4 + 2] = (i * 13) % 256
      img.data[i * 4 + 3] = 255
    }
    const out = processVector(img, { ...DEFAULT_VECTOR, maxColors: 6, smooth: 1, denoise: "off" }, () => "<svg></svg>")
    expect(out.palette.length).toBeLessThanOrEqual(6)
    expect(out.palette.length).toBeGreaterThan(1)
    expect(out.svg).toBe("<svg></svg>")
  })

  test("vector key color stays out of the palette", () => {
    const art = upscaleNearest(checker(1, 6), 4)
    for (let y = 0; y < art.height; y++) {
      for (let x = 0; x < art.width; x++) {
        if (x < 4 || y < 4) art.data[(y * art.width + x) * 4 + 3] = 0
      }
    }
    const out = processVector(art, { ...DEFAULT_VECTOR, maxColors: 8, smooth: 1 }, () => "<svg></svg>")
    for (const color of out.palette) {
      const n = Number.parseInt(color.slice(1), 16)
      expect(isKeyColor((n >> 16) & 255, (n >> 8) & 255, n & 255)).toBe(false)
    }
    expect(out.palette.length).toBeGreaterThan(0)
  })

  test("content-adaptive keeps the requested size", () => {
    const big = upscaleNearest(checker(1, 6), 4)
    const out = contentAdaptive(big, 6, 6)
    expect(out.width).toBe(6)
    expect(out.height).toBe(6)
    expect(out.data[3]).toBeGreaterThan(0)
  })
})

describe("license boundary", () => {
  test("the app tree ships no imagequant, libimagequant, or wasm core", () => {
    const root = join(import.meta.dir, "..", "..")
    const banned = /imagequant|libimagequant|unfake_wasm|unfake-core/i
    const hits: string[] = []
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        if (name === "node_modules" || name === "dist" || name.endsWith(".test.ts")) continue
        const p = join(dir, name)
        if (statSync(p).isDirectory()) {
          walk(p)
          continue
        }
        if (name.endsWith(".wasm")) hits.push(p)
        if (/\.(png|jpg|woff2?)$/.test(name)) continue
        const text = readFileSync(p, "utf8")
        if (banned.test(text)) hits.push(`${p}`)
      }
    }
    walk(root)
    const allowed = hits.filter((h) => !h.endsWith("THIRD_PARTY_LICENSE.txt") && !h.endsWith("PLAN.md") && !h.endsWith("README.md"))
    expect(allowed).toEqual([])
  })
})
